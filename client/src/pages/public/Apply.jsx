import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, FileText, HeartPulse, MessageSquare, Send, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import http from "../../api/http";
import SectionTitle from "../../components/public/SectionTitle";
import { defaultAdmissions } from "../../data/defaultContent";
import { setSeo } from "../../utils/seo";

const required = (label) => ({ required: `${label} is required.` });
const toList = (value) => Array.isArray(value) ? value : value ? [value] : [];
const hasSelection = (value) => toList(value).length > 0 || "Select at least one option.";
const paymentStorageKey = "rehoboth-admission-payment";
const genericPaymentError = "Payment is temporarily unavailable. Please contact the school office for assistance.";
const sensitivePaymentErrorPattern = /paystack|secret|authorization|bearer|environment/i;
const maxDocumentFileSize = 8 * 1024 * 1024;
const documentAccept = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,image/heic,image/heif";
const allowedDocumentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);
const allowedDocumentExtension = /\.(pdf|doc|docx|jpe?g|png|webp|heic|heif)$/i;
const documentUploadFields = [
  { name: "birthCertificate", label: "Birth certificate" },
  { name: "passportPhotographs", label: "Passport photographs", multiple: true, maxFiles: 2 },
  { name: "immunizationRecord", label: "Immunization record" },
  { name: "previousSchoolReport", label: "Last result / transfer certificate" },
  { name: "additionalDocument", label: "Additional document" }
];
const documentUploadFieldNames = new Set(documentUploadFields.map((field) => field.name));

function formatCurrency(value, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function readStoredPayment() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(paymentStorageKey)) || null;
  } catch {
    return null;
  }
}

function storePayment(payment) {
  if (typeof window === "undefined") return;
  if (!payment) {
    window.localStorage.removeItem(paymentStorageKey);
    return;
  }
  window.localStorage.setItem(paymentStorageKey, JSON.stringify(payment));
}

function customerPaymentError(error, fallback = genericPaymentError) {
  const message = error?.response?.data?.message || error?.message;
  if (!message || sensitivePaymentErrorPattern.test(message)) return fallback;
  return message;
}

function formatFileSize(bytes) {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

function validateDocumentFiles(value, field) {
  const files = Array.from(value || []);
  if (!files.length) return true;
  if (!field.multiple && files.length > 1) return `Upload one ${field.label.toLowerCase()} file.`;
  if (field.maxFiles && files.length > field.maxFiles) return `Upload up to ${field.maxFiles} ${field.label.toLowerCase()} files.`;

  for (const file of files) {
    const allowed = (file.type && allowedDocumentTypes.has(file.type)) || allowedDocumentExtension.test(file.name || "");
    if (!allowed) return "Upload a PDF, Word document, JPG, PNG, WebP, HEIC, or HEIF file.";
    if (file.size > maxDocumentFileSize) return `Each document must be ${formatFileSize(maxDocumentFileSize)} or less.`;
  }

  return true;
}

function appendFormValue(formData, key, value) {
  if (value === undefined || value === null || value === "") return;
  if (Array.isArray(value)) {
    value.forEach((entry) => appendFormValue(formData, key, entry));
    return;
  }
  formData.append(key, typeof value === "boolean" ? String(value) : value);
}

function FieldError({ errors, name }) {
  const error = errors[name];
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600">{error.message || "This field is required."}</p>;
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-[#dbe8bf] pb-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eef5dd] text-brand">
          <Icon size={20} />
        </span>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function TextField({ errors, label, name, register, rules, type = "text", ...props }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} className="input" type={type} {...register(name, rules)} {...props} />
      <FieldError errors={errors} name={name} />
    </div>
  );
}

function TextAreaField({ errors, label, name, register, rules, rows = 4, ...props }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea id={name} className="input min-h-28" rows={rows} {...register(name, rules)} {...props} />
      <FieldError errors={errors} name={name} />
    </div>
  );
}

function SelectField({ errors, label, name, options, register, rules }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <select id={name} className="input" {...register(name, rules)}>
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <FieldError errors={errors} name={name} />
    </div>
  );
}

function FileField({ errors, field, register }) {
  return (
    <div>
      <label className="label" htmlFor={field.name}>{field.label}</label>
      <input
        id={field.name}
        className="input"
        type="file"
        accept={documentAccept}
        multiple={field.multiple}
        {...register(field.name, { validate: (value) => validateDocumentFiles(value, field) })}
      />
      <FieldError errors={errors} name={field.name} />
    </div>
  );
}

function PaymentGate({ amount, currency, error, loading, onPay, verifying }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();
  const disabled = loading || verifying || isSubmitting;

  return (
    <section className="card mt-8 max-w-3xl p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#eef5dd] text-brand">
          <CreditCard size={24} />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Admission form payment</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Pay the admission form fee to unlock the online application form.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-[#dbe8bf] bg-[#f8fbef] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount due</p>
        <p className="mt-1 text-3xl font-black text-slate-950">{formatCurrency(amount, currency)}</p>
      </div>

      {verifying ? (
        <p className="mt-5 rounded-md border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-700">Verifying your Paystack payment...</p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-md border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onPay)}>
        <TextField errors={errors} label="Parent / guardian name" name="fullName" register={register} rules={{ ...required("Parent / guardian name"), minLength: { value: 2, message: "Enter at least 2 characters." } }} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField errors={errors} label="Email for payment receipt" name="email" register={register} rules={{ ...required("Email"), maxLength: { value: 180, message: "Use 180 characters or fewer." } }} type="email" />
          <TextField errors={errors} label="Phone number" name="phone" register={register} rules={{ maxLength: { value: 40, message: "Use 40 characters or fewer." } }} type="tel" />
        </div>
        <button className="btn-primary w-full sm:w-fit" disabled={disabled} type="submit">
          <CreditCard size={18} />
          {disabled ? "Preparing payment..." : "Pay with Paystack"}
        </button>
      </form>
    </section>
  );
}

export default function Apply() {
  setSeo("Admission Form", "Complete the Rehoboth Prime Years enrollment form online.");
  const [searchParams, setSearchParams] = useSearchParams();
  const [admissions, setAdmissions] = useState(null);
  const [admissionsLoading, setAdmissionsLoading] = useState(true);
  const [payment, setPayment] = useState(() => readStoredPayment());
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { communicationPreferences: [] } });

  const hasMedicalCondition = watch("hasMedicalCondition");
  const motherName = watch("motherName");
  const admissionFormFee = Number(admissions?.admissionFormFee) || 0;
  const admissionPaymentCurrency = admissions?.admissionPaymentCurrency || "NGN";
  const admissionFormFeeKobo = Math.round(admissionFormFee * 100);
  const paymentRequired = admissionFormFeeKobo > 0;
  const paymentSatisfied = !paymentRequired || (
    payment?.status === "success" &&
    Number(payment.amountKobo || 0) >= admissionFormFeeKobo &&
    !payment.usedAt
  );
  const callbackReference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    let active = true;
    setAdmissionsLoading(true);
    http.get("/admissions")
      .then((res) => {
        if (active) setAdmissions({ ...defaultAdmissions, ...(res.data || {}) });
      })
      .catch(() => {
        if (active) {
          setAdmissions(defaultAdmissions);
          toast.error("Unable to load admissions payment settings.");
        }
      })
      .finally(() => {
        if (active) setAdmissionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!callbackReference) return undefined;

    let active = true;
    setPaymentError("");
    setVerifyingPayment(true);
    http.get(`/admission-payments/verify/${encodeURIComponent(callbackReference)}`)
      .then((res) => {
        if (!active) return;
        const verifiedPayment = { ...res.data, verifiedAt: new Date().toISOString() };
        setPayment(verifiedPayment);
        storePayment(verifiedPayment);
        toast.success("Payment verified. You can now complete the admission form.");
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("reference");
        nextParams.delete("trxref");
        nextParams.delete("payment");
        setSearchParams(nextParams, { replace: true });
      })
      .catch((error) => {
        if (!active) return;
        const message = customerPaymentError(
          error,
          "Unable to verify payment right now. Please contact the school office if you have been debited."
        );
        setPaymentError(message);
        toast.error(message);
      })
      .finally(() => {
        if (active) setVerifyingPayment(false);
      });

    return () => {
      active = false;
    };
  }, [callbackReference, searchParams, setSearchParams]);

  useEffect(() => {
    if (admissionsLoading || !paymentRequired || !payment?.reference || callbackReference) return undefined;

    let active = true;
    setVerifyingPayment(true);
    http.get(`/admission-payments/verify/${encodeURIComponent(payment.reference)}`)
      .then((res) => {
        if (!active) return;
        const verifiedPayment = { ...res.data, verifiedAt: new Date().toISOString() };
        setPayment(verifiedPayment);
        storePayment(verifiedPayment);
      })
      .catch(() => {
        if (!active) return;
        setPayment(null);
        storePayment(null);
      })
      .finally(() => {
        if (active) setVerifyingPayment(false);
      });

    return () => {
      active = false;
    };
  }, [admissionsLoading, paymentRequired, payment?.reference, callbackReference]);

  async function startPayment(values) {
    setPaymentError("");
    setPaymentLoading(true);
    try {
      const res = await http.post("/admission-payments/initialize", values);
      if (!res.data?.paymentRequired) {
        setPayment(null);
        storePayment(null);
        return;
      }
      if (!res.data?.authorizationUrl) throw new Error("Paystack did not return a payment link.");
      window.location.assign(res.data.authorizationUrl);
    } catch (error) {
      const message = customerPaymentError(error);
      setPaymentError(message);
      toast.error(message);
    } finally {
      setPaymentLoading(false);
    }
  }

  async function onSubmit(values) {
    if (paymentRequired && !paymentSatisfied) {
      toast.error("Please complete the admission form payment before submitting.");
      return;
    }

    const formData = new FormData();
    Object.entries({
      ...values,
      paymentReference: paymentRequired ? payment.reference : ""
    }).forEach(([key, value]) => {
      if (!documentUploadFieldNames.has(key)) appendFormValue(formData, key, value);
    });
    documentUploadFields.forEach((field) => {
      Array.from(values[field.name] || []).forEach((file) => {
        if (file?.size) formData.append(field.name, file);
      });
    });

    try {
      await http.post("/admission-applications", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Application submitted. Our admissions team will be in touch.");
      reset();
      if (paymentRequired) {
        setPayment(null);
        storePayment(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to submit application. Please try again.");
    }
  }

  return (
    <main className="container-pad py-14">
      <Link to="/admissions" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:underline">
        <ArrowLeft size={16} /> Back to Admissions
      </Link>
      <SectionTitle
        eyebrow="Admissions"
        title="Admission form"
        text="Complete the Rehoboth Prime Years enrollment form. Our admissions team will review the details and contact you about the next step."
      />

      {admissionsLoading ? (
        <div className="card mt-8 max-w-3xl p-6 text-sm text-slate-600">Loading admission form settings...</div>
      ) : paymentRequired && !paymentSatisfied ? (
        <PaymentGate
          amount={admissionFormFee}
          currency={admissionPaymentCurrency}
          error={paymentError || (payment?.status === "success" ? "A saved payment was found, but it does not match the current admission form fee." : "")}
          loading={paymentLoading}
          onPay={startPayment}
          verifying={verifyingPayment}
        />
      ) : null}

      {!admissionsLoading && paymentSatisfied ? (
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid max-w-5xl gap-6">
        {paymentRequired ? (
          <div className="rounded-lg border border-[#dbe8bf] bg-[#f8fbef] p-5 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <div>
                <h2 className="font-bold text-slate-950">Payment verified</h2>
                <p className="mt-1">Reference: {payment.reference}</p>
              </div>
            </div>
          </div>
        ) : null}

        <FormSection icon={UserRound} title="Pupil / Student Information">
          <TextField errors={errors} label="Name of pupil / student" name="childName" register={register} rules={{ ...required("Pupil / student name"), minLength: { value: 2, message: "Enter at least 2 characters." }, maxLength: { value: 120, message: "Use 120 characters or fewer." } }} />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField errors={errors} label="Date of birth" name="dob" register={register} rules={required("Date of birth")} type="date" />
            <TextField errors={errors} label="Age" name="age" register={register} rules={{ required: "Age is required.", min: { value: 1, message: "Enter a valid age." }, max: { value: 30, message: "Enter a valid age." } }} type="number" min="1" max="30" />
            <SelectField errors={errors} label="Sex" name="sex" options={["Female", "Male"]} register={register} rules={required("Sex")} />
          </div>
          <TextAreaField errors={errors} label="Home address" name="homeAddress" register={register} rules={{ ...required("Home address"), maxLength: { value: 250, message: "Use 250 characters or fewer." } }} rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField errors={errors} label="State of origin" name="stateOfOrigin" register={register} rules={required("State of origin")} />
            <TextField errors={errors} label="L.G.A." name="lga" register={register} rules={required("L.G.A.")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField errors={errors} label="Religion" name="religion" register={register} />
            <TextField errors={errors} label="If Christian, church attending" name="churchAttending" register={register} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField errors={errors} label="Blood group" name="bloodGroup" register={register} />
            <TextField errors={errors} label="Genotype" name="genotype" register={register} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField errors={errors} label="Class into which admission is sought" name="classSought" register={register} rules={required("Class sought")} />
            <TextField errors={errors} label="Number of children in family" name="numberOfChildren" register={register} type="number" min="1" />
            <TextField errors={errors} label="Child's position" name="childPosition" register={register} />
          </div>
        </FormSection>

        <FormSection icon={HeartPulse} title="Health Information">
          <TextAreaField errors={errors} label="Allergy, if any (give details)" name="allergies" register={register} rules={{ maxLength: { value: 500, message: "Use 500 characters or fewer." } }} />
          <fieldset>
            <legend className="label">Is this child's immunization up to date?</legend>
            <div className="flex flex-wrap gap-3">
              {["Yes", "No"].map((option) => (
                <label key={option} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <input type="radio" value={option} {...register("immunizationUpToDate", required("Immunization status"))} />
                  {option}
                </label>
              ))}
            </div>
            <FieldError errors={errors} name="immunizationUpToDate" />
          </fieldset>
          <fieldset>
            <legend className="label">Does this child have any medical condition?</legend>
            <div className="flex flex-wrap gap-3">
              {["No", "Yes"].map((option) => (
                <label key={option} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <input type="radio" value={option} {...register("hasMedicalCondition", required("Medical condition response"))} />
                  {option}
                </label>
              ))}
            </div>
            <FieldError errors={errors} name="hasMedicalCondition" />
          </fieldset>
          <TextAreaField
            errors={errors}
            label="Medical condition details"
            name="medicalDetails"
            register={register}
            rules={{
              validate: (value) => hasMedicalCondition !== "Yes" || value?.trim() ? true : "Please give details of the medical condition.",
              maxLength: { value: 700, message: "Use 700 characters or fewer." }
            }}
          />
        </FormSection>

        <FormSection icon={UsersRound} title="Parents' Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              errors={errors}
              label="Father's name"
              name="fatherName"
              register={register}
              rules={{ validate: (value) => value?.trim() || motherName?.trim() ? true : "Enter at least one parent name." }}
            />
            <TextField errors={errors} label="Father's occupation" name="fatherOccupation" register={register} />
          </div>
          <TextAreaField errors={errors} label="Father's office address" name="fatherOfficeAddress" register={register} rules={{ maxLength: { value: 250, message: "Use 250 characters or fewer." } }} rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField errors={errors} label="Mother's name" name="motherName" register={register} />
            <TextField errors={errors} label="Mother's occupation" name="motherOccupation" register={register} />
          </div>
          <TextAreaField errors={errors} label="Mother's office address" name="motherOfficeAddress" register={register} rules={{ maxLength: { value: 250, message: "Use 250 characters or fewer." } }} rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField errors={errors} label="Parent / guardian phone" name="primaryPhone" register={register} rules={{ ...required("Parent / guardian phone"), maxLength: { value: 40, message: "Use 40 characters or fewer." } }} type="tel" />
            <TextField errors={errors} label="Parents' email" name="parentEmail" register={register} rules={{ ...required("Parents' email"), maxLength: { value: 180, message: "Use 180 characters or fewer." } }} type="email" />
          </div>
        </FormSection>

        <FormSection icon={MessageSquare} title="Communication and Pickup">
          <fieldset>
            <legend className="label">Preferred method of communication</legend>
            <div className="flex flex-wrap gap-3">
              {["Phone", "Text", "Email"].map((option) => (
                <label key={option} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <input type="checkbox" value={option} {...register("communicationPreferences", { validate: hasSelection })} />
                  {option}
                </label>
              ))}
            </div>
            <FieldError errors={errors} name="communicationPreferences" />
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField errors={errors} label="Emergency contact name" name="emergencyContactName" register={register} rules={required("Emergency contact name")} />
            <TextField errors={errors} label="Emergency contact phone" name="emergencyContactPhone" register={register} rules={{ ...required("Emergency contact phone"), maxLength: { value: 40, message: "Use 40 characters or fewer." } }} type="tel" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-4 font-semibold text-slate-900">Authorized pickup person 1</h3>
              <div className="grid gap-4">
                <TextField errors={errors} label="Name" name="pickupOneName" register={register} rules={required("Authorized pickup name")} />
                <TextField errors={errors} label="Phone number" name="pickupOnePhone" register={register} rules={{ ...required("Authorized pickup phone"), maxLength: { value: 40, message: "Use 40 characters or fewer." } }} type="tel" />
                <TextAreaField errors={errors} label="Address" name="pickupOneAddress" register={register} rules={{ maxLength: { value: 250, message: "Use 250 characters or fewer." } }} rows={3} />
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-4 font-semibold text-slate-900">Authorized pickup person 2</h3>
              <div className="grid gap-4">
                <TextField errors={errors} label="Name" name="pickupTwoName" register={register} />
                <TextField errors={errors} label="Phone number" name="pickupTwoPhone" register={register} type="tel" />
                <TextAreaField errors={errors} label="Address" name="pickupTwoAddress" register={register} rules={{ maxLength: { value: 250, message: "Use 250 characters or fewer." } }} rows={3} />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection icon={FileText} title="Documents">
          <p className="text-sm leading-6 text-slate-700">
            Upload clear copies of the documents that are ready now. The admissions team can follow up on anything that still needs to be submitted.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {documentUploadFields.map((field) => (
              <FileField key={field.name} errors={errors} field={field} register={register} />
            ))}
          </div>
          <p className="text-xs font-medium text-slate-500">Accepted: PDF, Word, JPG, PNG, WebP, HEIC, or HEIF. Maximum {formatFileSize(maxDocumentFileSize)} each.</p>
        </FormSection>

        <FormSection icon={ShieldCheck} title="Attestation">
          <p className="text-sm leading-6 text-slate-700">
            I hereby acknowledge and confirm my desire to enroll my child in Rehoboth Prime Years. I understand and agree to the Christian values and educational standards upheld by the school, and I commit to supporting my child in adhering to the school's policies and educational journey.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField errors={errors} label="Parent / guardian's name" name="attestationName" register={register} rules={{ ...required("Parent / guardian name"), minLength: { value: 2, message: "Enter at least 2 characters." }, maxLength: { value: 120, message: "Use 120 characters or fewer." } }} />
            <TextField errors={errors} label="Date" name="attestationDate" register={register} rules={required("Attestation date")} type="date" />
          </div>
          <label className="flex items-start gap-3 rounded-md border border-[#dbe8bf] bg-[#f8fbef] p-4 text-sm text-slate-700">
            <input className="mt-1" type="checkbox" {...register("attestationAgreement", { required: "Confirm the attestation to submit." })} />
            <span>I confirm that the information provided is accurate and that this typed name serves as my admission form signature.</span>
          </label>
          <FieldError errors={errors} name="attestationAgreement" />
        </FormSection>

        <button className="btn-primary w-full sm:w-fit" disabled={isSubmitting} type="submit">
          <Send size={18} />
          {isSubmitting ? "Submitting..." : "Submit admission form"}
        </button>
      </form>
      ) : null}
    </main>
  );
}
