const crypto = require("crypto");
const { z } = require("zod");
const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionContent = require("../models/AdmissionContent");
const AdmissionPayment = require("../models/AdmissionPayment");
const asyncHandler = require("../middleware/asyncHandler");
const { sendEmail } = require("../utils/email");

const requiredString = (label, max) => z.string().trim().min(1, `${label} is required.`).max(max);
const optionalString = (max) => z.string().trim().max(max).optional().default("");
const emptyToUndefined = (value) => (value === "" || value === null ? undefined : value);
const optionalNumber = (max) => z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(max).optional());
const validDate = (label) => requiredString(label, 20).refine((value) => !Number.isNaN(Date.parse(value)), `${label} must be a valid date.`);

const communicationPreferenceSchema = z.preprocess(
  (value) => (Array.isArray(value) ? value : value ? [value] : []),
  z.array(z.enum(["Phone", "Text", "Email"])).min(1, "Select at least one communication method.")
);

const applicationSchema = z.object({
  childName: requiredString("Pupil / student name", 120),
  dob: validDate("Date of birth"),
  age: z.coerce.number().int().min(1, "Age is required.").max(30, "Enter a valid age."),
  sex: z.enum(["Female", "Male"]),
  homeAddress: requiredString("Home address", 250),
  stateOfOrigin: requiredString("State of origin", 120),
  lga: requiredString("L.G.A.", 120),
  religion: optionalString(80),
  churchAttending: optionalString(180),
  bloodGroup: optionalString(20),
  genotype: optionalString(20),
  classSought: requiredString("Class sought", 120),
  numberOfChildren: optionalNumber(30),
  childPosition: optionalString(40),
  allergies: optionalString(500),
  immunizationUpToDate: z.enum(["Yes", "No"]),
  hasMedicalCondition: z.enum(["Yes", "No"]),
  medicalDetails: optionalString(700),
  fatherName: optionalString(120),
  fatherOccupation: optionalString(120),
  fatherOfficeAddress: optionalString(250),
  motherName: optionalString(120),
  motherOccupation: optionalString(120),
  motherOfficeAddress: optionalString(250),
  primaryPhone: requiredString("Parent / guardian phone", 40),
  parentEmail: z.string().trim().email("Enter a valid parent email.").max(180),
  communicationPreferences: communicationPreferenceSchema,
  emergencyContactName: requiredString("Emergency contact name", 120),
  emergencyContactPhone: requiredString("Emergency contact phone", 40),
  pickupOneName: requiredString("Authorized pickup name", 120),
  pickupOnePhone: requiredString("Authorized pickup phone", 40),
  pickupOneAddress: optionalString(250),
  pickupTwoName: optionalString(120),
  pickupTwoPhone: optionalString(40),
  pickupTwoAddress: optionalString(250),
  attestationName: requiredString("Parent / guardian name", 120),
  attestationDate: validDate("Attestation date"),
  attestationAgreement: z.boolean().refine(Boolean, "Confirm the attestation to submit."),
  paymentReference: optionalString(120)
}).refine(
  (data) => data.hasMedicalCondition !== "Yes" || Boolean(data.medicalDetails.trim()),
  { message: "Please give details of the medical condition.", path: ["medicalDetails"] }
).refine(
  (data) => Boolean(data.fatherName.trim() || data.motherName.trim()),
  { message: "Enter at least one parent name.", path: ["fatherName"] }
);

function optionalText(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "N/A";
  return value || "N/A";
}

function requiredAmountKobo(config) {
  return Math.max(0, Math.round((Number(config?.admissionFormFee) || 0) * 100));
}

function admissionPaymentIsRequired(config) {
  return Boolean(config?.enforceAdmissionPayment) && requiredAmountKobo(config) > 0;
}

function generateApplicationNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");
  return `ADM-${datePart}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function paymentRequiredError(message) {
  const error = new Error(message);
  error.statusCode = 402;
  throw error;
}

async function reservePayment(reference) {
  const admissions = await AdmissionContent.findOne();
  const requiredPaymentAmountKobo = requiredAmountKobo(admissions);

  if (!admissionPaymentIsRequired(admissions)) return null;
  if (!reference) paymentRequiredError("Admission form payment is required before submitting this application.");

  const payment = await AdmissionPayment.findOne({ reference });
  if (!payment) paymentRequiredError("Payment reference was not found. Please make payment before submitting.");
  if (payment.status !== "success") paymentRequiredError("Payment has not been verified successfully.");
  if (payment.usedAt) paymentRequiredError("This payment reference has already been used for an application.");
  if (payment.amountKobo < requiredPaymentAmountKobo) paymentRequiredError("Payment amount is lower than the current admission form fee.");

  const reserved = await AdmissionPayment.findOneAndUpdate(
    { _id: payment._id, usedAt: { $exists: false } },
    { usedAt: new Date() },
    { new: true }
  );
  if (!reserved) paymentRequiredError("This payment reference has already been used for an application.");
  return reserved;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildApplicationEmail(data) {
  return [
    "PUPIL/STUDENT INFORMATION",
    `Name: ${data.childName}`,
    `Date of birth: ${data.dob}`,
    `Age: ${data.age}`,
    `Sex: ${data.sex}`,
    `Home address: ${data.homeAddress}`,
    `State of origin: ${data.stateOfOrigin}`,
    `LGA: ${data.lga}`,
    `Religion: ${optionalText(data.religion)}`,
    `Church attending: ${optionalText(data.churchAttending)}`,
    `Blood group: ${optionalText(data.bloodGroup)}`,
    `Genotype: ${optionalText(data.genotype)}`,
    `Class sought: ${data.classSought}`,
    `Number of children in family: ${optionalText(data.numberOfChildren)}`,
    `Child's position: ${optionalText(data.childPosition)}`,
    `Allergies: ${optionalText(data.allergies)}`,
    `Immunization up to date: ${data.immunizationUpToDate}`,
    `Medical condition: ${data.hasMedicalCondition}`,
    `Medical details: ${optionalText(data.medicalDetails)}`,
    "",
    "PARENTS' INFORMATION",
    `Father's name: ${optionalText(data.fatherName)}`,
    `Father's occupation: ${optionalText(data.fatherOccupation)}`,
    `Father's office address: ${optionalText(data.fatherOfficeAddress)}`,
    `Mother's name: ${optionalText(data.motherName)}`,
    `Mother's occupation: ${optionalText(data.motherOccupation)}`,
    `Mother's office address: ${optionalText(data.motherOfficeAddress)}`,
    `Parent/guardian phone: ${data.primaryPhone}`,
    `Parent email: ${data.parentEmail}`,
    `Preferred communication: ${optionalText(data.communicationPreferences)}`,
    `Emergency contact: ${data.emergencyContactName} (${data.emergencyContactPhone})`,
    "",
    "AUTHORIZED PICKUP PEOPLE",
    `1. ${data.pickupOneName} | ${data.pickupOnePhone} | ${optionalText(data.pickupOneAddress)}`,
    `2. ${optionalText(data.pickupTwoName)} | ${optionalText(data.pickupTwoPhone)} | ${optionalText(data.pickupTwoAddress)}`,
    "",
    "PAYMENT",
    `Reference: ${optionalText(data.paymentReference)}`,
    `Amount: ${data.paymentAmountKobo ? `NGN ${(data.paymentAmountKobo / 100).toLocaleString()}` : "N/A"}`,
    `Paid at: ${data.paymentPaidAt ? new Date(data.paymentPaidAt).toLocaleString() : "N/A"}`,
    "",
    "ATTESTATION",
    `Parent/guardian name: ${data.attestationName}`,
    `Date: ${data.attestationDate}`,
    "Attestation confirmed: Yes"
  ].join("\n");
}

exports.createApplication = asyncHandler(async (req, res) => {
  const data = applicationSchema.parse(req.body);
  const payment = await reservePayment(data.paymentReference);
  const applicationPayload = payment ? {
    ...data,
    applicationNumber: generateApplicationNumber(),
    paymentReference: payment.reference,
    payment: payment._id,
    paymentAmountKobo: payment.amountKobo,
    paymentCurrency: payment.currency,
    paymentPaidAt: payment.paidAt
  } : { ...data, applicationNumber: generateApplicationNumber() };

  let application;
  try {
    application = await AdmissionApplication.create(applicationPayload);
  } catch (error) {
    if (payment) await AdmissionPayment.findByIdAndUpdate(payment._id, { $unset: { usedAt: "" } });
    throw error;
  }

  if (payment) await AdmissionPayment.findByIdAndUpdate(payment._id, { application: application._id });

  const notifyTo = process.env.ADMISSIONS_NOTIFY_EMAIL || process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER;
  if (notifyTo) {
    const text = buildApplicationEmail(applicationPayload);
    sendEmail({
      to: notifyTo,
      subject: `New admission application: ${data.childName}`,
      text,
      html: `<p><strong>New admission application:</strong> ${escapeHtml(data.childName)}</p><p><strong>Parent email:</strong> ${escapeHtml(data.parentEmail)}</p><p><strong>Phone:</strong> ${escapeHtml(data.primaryPhone)}</p><pre>${escapeHtml(text)}</pre>`
    }).catch((error) => console.error("Admission application notification failed:", error.message));
  }

  res.status(201).json({ message: "Application submitted successfully", id: application._id });
});

exports.listApplications = asyncHandler(async (req, res) => {
  res.json(await AdmissionApplication.find().sort("-createdAt"));
});

exports.markRead = asyncHandler(async (req, res) => {
  const application = await AdmissionApplication.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!application) return res.status(404).json({ message: "Application not found" });
  res.json(application);
});

exports.deleteApplication = asyncHandler(async (req, res) => {
  const application = await AdmissionApplication.findByIdAndDelete(req.params.id);
  if (!application) return res.status(404).json({ message: "Application not found" });
  res.json({ message: "Deleted successfully" });
});
