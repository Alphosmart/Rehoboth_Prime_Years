const crypto = require("crypto");
const { z } = require("zod");
const AdmissionContent = require("../models/AdmissionContent");
const AdmissionPayment = require("../models/AdmissionPayment");
const asyncHandler = require("../middleware/asyncHandler");

const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PUBLIC_PAYMENT_ERROR_MESSAGE = "Payment is temporarily unavailable. Please contact the school office for assistance.";

const initializeSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional().default("")
});

async function getAdmissionsConfig() {
  return (await AdmissionContent.findOne()) || {};
}

function requiredAmountKobo(config) {
  return Math.max(0, Math.round((Number(config?.admissionFormFee) || 0) * 100));
}

function paymentIsRequired(config) {
  return Boolean(config?.enforceAdmissionPayment) && requiredAmountKobo(config) > 0;
}

function paymentCurrency(config) {
  return config.admissionPaymentCurrency || "NGN";
}

function paymentProvider(config) {
  return config.admissionPaymentProvider || "paystack";
}

function getClientBaseUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)[0]
    ?.replace(/\/$/, "") || "http://localhost:5173";
}

function getPaystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET;
}

function ensurePaystackSecret() {
  const secret = getPaystackSecret();
  if (!secret) {
    const error = new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to the server environment.");
    error.statusCode = 503;
    throw error;
  }
  return secret;
}

function publicPaymentError() {
  const error = new Error(PUBLIC_PAYMENT_ERROR_MESSAGE);
  error.statusCode = 503;
  return error;
}

async function paystackRequest(path, options = {}) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${ensurePaystackSecret()}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.status === false) {
    const error = new Error(body.message || "Unable to complete Paystack request.");
    error.statusCode = response.status >= 400 ? response.status : 502;
    error.paystack = body;
    throw error;
  }
  return body;
}

function makeReference() {
  return `rpy-adm-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
}

exports.initializePayment = asyncHandler(async (req, res) => {
  const customer = initializeSchema.parse(req.body);
  const admissions = await getAdmissionsConfig();
  const amountKobo = requiredAmountKobo(admissions);

  if (!paymentIsRequired(admissions)) {
    return res.json({ paymentRequired: false, message: "Admission payment is not required." });
  }
  if (paymentProvider(admissions) !== "paystack") {
    return res.status(400).json({ message: "Unsupported admission payment provider." });
  }

  const reference = makeReference();
  const currency = paymentCurrency(admissions);
  const payment = await AdmissionPayment.create({
    reference,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    amountKobo,
    currency
  });

  try {
    const callbackUrl = `${getClientBaseUrl()}/admissions/apply?payment=paystack`;
    const result = await paystackRequest("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: customer.email,
        amount: String(amountKobo),
        currency,
        reference,
        callback_url: callbackUrl,
        metadata: JSON.stringify({
          purpose: "admission_form",
          paymentId: String(payment._id),
          fullName: customer.fullName,
          phone: customer.phone
        })
      })
    });

    payment.accessCode = result.data?.access_code;
    payment.authorizationUrl = result.data?.authorization_url;
    await payment.save();

    res.status(201).json({
      paymentRequired: true,
      reference,
      authorizationUrl: payment.authorizationUrl,
      accessCode: payment.accessCode,
      amount: amountKobo / 100,
      amountKobo,
      currency
    });
  } catch (error) {
    payment.status = "failed";
    payment.gatewayResponse = error.message;
    payment.rawResponse = error.paystack;
    await payment.save();
    throw publicPaymentError();
  }
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const reference = z.string().trim().min(3).max(120).parse(req.params.reference);
  const payment = await AdmissionPayment.findOne({ reference });
  if (!payment) return res.status(404).json({ message: "Payment reference not found" });

  let result;
  try {
    result = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, { method: "GET" });
  } catch (error) {
    throw publicPaymentError();
  }

  const transaction = result.data || {};
  const isSuccessful = result.status === true && transaction.status === "success";
  const paidAmountKobo = Number(transaction.amount) || 0;

  payment.status = isSuccessful ? "success" : "failed";
  payment.paidAmountKobo = paidAmountKobo || undefined;
  payment.currency = transaction.currency || payment.currency;
  payment.gatewayResponse = transaction.gateway_response || result.message;
  payment.paystackTransactionId = transaction.id ? String(transaction.id) : payment.paystackTransactionId;
  payment.paidAt = transaction.paid_at ? new Date(transaction.paid_at) : payment.paidAt;
  payment.rawResponse = transaction;
  await payment.save();

  if (!isSuccessful) {
    return res.status(400).json({ message: "Payment has not been completed.", status: payment.status, reference });
  }

  if (paidAmountKobo < payment.amountKobo) {
    return res.status(400).json({ message: "Payment amount is lower than the required admission form fee.", status: payment.status, reference });
  }

  res.json({
    message: "Payment verified",
    reference: payment.reference,
    status: payment.status,
    amount: payment.amountKobo / 100,
    amountKobo: payment.amountKobo,
    paidAmountKobo,
    currency: payment.currency,
    paidAt: payment.paidAt,
    usedAt: payment.usedAt
  });
});

exports.paymentIsRequired = paymentIsRequired;
exports.requiredAmountKobo = requiredAmountKobo;
