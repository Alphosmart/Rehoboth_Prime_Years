const mongoose = require("mongoose");

const admissionPaymentSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    accessCode: String,
    authorizationUrl: String,
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    amountKobo: { type: Number, required: true },
    paidAmountKobo: Number,
    currency: { type: String, default: "NGN" },
    status: { type: String, enum: ["initialized", "success", "failed"], default: "initialized" },
    gateway: { type: String, default: "paystack" },
    gatewayResponse: String,
    paystackTransactionId: String,
    paidAt: Date,
    usedAt: Date,
    application: { type: mongoose.Schema.Types.ObjectId, ref: "AdmissionApplication" },
    rawResponse: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmissionPayment", admissionPaymentSchema);
