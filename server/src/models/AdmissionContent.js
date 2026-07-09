const mongoose = require("mongoose");

const admissionContentSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Admissions" },
    content: String,
    requirements: [String],
    processSteps: [{ title: String, description: String }],
    ctaText: String,
    admissionFormFee: { type: Number, default: 0 },
    admissionPaymentCurrency: { type: String, default: "NGN" },
    admissionPaymentProvider: { type: String, default: "paystack" },
    enforceAdmissionPayment: { type: Boolean, default: false },
    seoTitle: String,
    seoDescription: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmissionContent", admissionContentSchema);
