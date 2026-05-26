const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    schoolName: { type: String, default: "Rehoboth Prime Years" },
    motto: { type: String, default: "Growing in wisdom and favour with God and Man" },
    logo: String,
    favicon: String,
    primaryColor: { type: String, default: "#00843D" },
    secondaryColor: { type: String, default: "#FFD200" },
    email: { type: String, default: "rehobothprimeyears@gmail.com" },
    phone: { type: String, default: "07034558581, 07015945362" },
    whatsapp: { type: String, default: "0703 455 8581" },
    address: { type: String, default: "Plot 115, Christine Nwuche Street Golden Spring Estate, Duboyi, FCT Abuja." },
    portalUrl: { type: String, default: "https://rehobothprimeyears.dpa.ng/" },
    facebookUrl: String,
    instagramUrl: String,
    youtubeUrl: String,
    tiktokUrl: String,
    xUrl: String,
    googleMapEmbed: String,
    footerText: { type: String, default: "A caring Abuja school where children grow in wisdom and favour with God and Man." },
    seoTitle: { type: String, default: "Rehoboth Prime Years" },
    seoDescription: { type: String, default: "A warm Abuja school for early years, primary, and secondary learners, combining strong foundations, creativity, character, and family partnership." }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
