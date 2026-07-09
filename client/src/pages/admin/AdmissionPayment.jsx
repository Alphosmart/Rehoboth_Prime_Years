import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, LockKeyhole, UnlockKeyhole } from "lucide-react";
import http from "../../api/http";

const initialForm = {
  admissionFormFee: 0,
  admissionPaymentCurrency: "NGN",
  admissionPaymentProvider: "paystack",
  enforceAdmissionPayment: false
};

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

export default function AdmissionPayment() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    http.get("/admissions")
      .then((res) => {
        if (!active) return;
        setForm({
          ...initialForm,
          admissionFormFee: res.data?.admissionFormFee ?? 0,
          admissionPaymentCurrency: res.data?.admissionPaymentCurrency || "NGN",
          admissionPaymentProvider: res.data?.admissionPaymentProvider || "paystack",
          enforceAdmissionPayment: Boolean(res.data?.enforceAdmissionPayment)
        });
      })
      .catch((error) => toast.error(error?.response?.data?.message || "Unable to load payment settings."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function setValue(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function setPaymentEnforcement(enabled) {
    if (enabled && Number(form.admissionFormFee) <= 0) {
      toast.error("Set an application fee above zero before enforcing payment.");
      return;
    }
    setValue("enforceAdmissionPayment", enabled);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await http.put("/admissions", {
        admissionFormFee: Number(form.admissionFormFee) || 0,
        admissionPaymentCurrency: form.admissionPaymentCurrency,
        admissionPaymentProvider: form.admissionPaymentProvider,
        enforceAdmissionPayment: Boolean(form.enforceAdmissionPayment)
      });
      toast.success("Payment settings saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save payment settings.");
    } finally {
      setSaving(false);
    }
  }

  const feeAmount = Number(form.admissionFormFee) || 0;
  const enforcementEnabled = Boolean(form.enforceAdmissionPayment);
  const paymentRequired = enforcementEnabled && feeAmount > 0;
  const statusLabel = paymentRequired ? "Payment required" : enforcementEnabled ? "Fee needed" : "Payment not enforced";
  const statusClass = paymentRequired ? "font-bold text-emerald-700" : enforcementEnabled ? "font-bold text-amber-700" : "font-bold text-slate-700";

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Admission Payment</h1>
      <p className="mt-2 text-sm text-slate-600">Set the admission form fee and choose whether applicants must pay before the form opens.</p>

      <form className="card mt-7 max-w-3xl p-6" onSubmit={save}>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="grid gap-6">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-950">Require payment before form access</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Current status:{" "}
                  <span className={statusClass}>
                    {statusLabel}
                  </span>
                </p>
              </div>
              <button
                aria-pressed={enforcementEnabled}
                className={enforcementEnabled
                  ? "btn-secondary mt-4 w-full border-slate-300 text-slate-700 hover:bg-slate-100 sm:mt-0 sm:w-fit"
                  : "btn mt-4 w-full bg-indigo-950 text-white hover:bg-indigo-900 focus:ring-indigo-950 sm:mt-0 sm:w-fit"}
                disabled={saving}
                onClick={() => setPaymentEnforcement(!enforcementEnabled)}
                type="button"
              >
                {enforcementEnabled ? <UnlockKeyhole size={18} /> : <LockKeyhole size={18} />}
                {enforcementEnabled ? "Disable enforcement" : "Enforce payment"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Application fee amount</span>
                <input
                  className="input"
                  min="0"
                  type="number"
                  value={form.admissionFormFee}
                  onChange={(event) => setValue("admissionFormFee", event.target.value)}
                />
              </label>
              <label>
                <span className="label">Currency</span>
                <select className="input" value={form.admissionPaymentCurrency} onChange={(event) => setValue("admissionPaymentCurrency", event.target.value)}>
                  <option value="NGN">NGN</option>
                </select>
              </label>
            </div>

            <label>
              <span className="label">Payment provider</span>
              <select className="input" value={form.admissionPaymentProvider} onChange={(event) => setValue("admissionPaymentProvider", event.target.value)}>
                <option value="paystack">Paystack</option>
              </select>
            </label>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                <CreditCard size={18} />
                Applicant charge
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">
                {formatCurrency(form.admissionFormFee, form.admissionPaymentCurrency)}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {paymentRequired
                  ? "Applicants must complete this payment before they can access the form."
                  : feeAmount > 0
                  ? "Applicants can access the form without payment until enforcement is enabled."
                  : "No payment is required while the fee is set to zero."}
              </p>
            </div>

            <button className="btn bg-indigo-950 text-white hover:bg-indigo-900 focus:ring-indigo-950 sm:w-fit" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save payment settings"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
