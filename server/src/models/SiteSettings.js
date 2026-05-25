const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    schoolName: { type: String, default: "Rehoboth Prime Years" },
    motto: { type: String, default: "Growing in wisdom and favour" },
    logo: String,
    favicon: String,
    primaryColor: { type: String, default: "#7EA652" },
    secondaryColor: { type: String, default: "#F5E011" },
    email: { type: String, default: "info@rehobothprimeyears.edu.ng" },
    phone: { type: String, default: "07046272361, 09018690022, 08180705629" },
    whatsapp: { type: String, default: "+2347046272361" },
    address: { type: String, default: "900241 Cadastral Street, Plot 5/7 Durumi District, Area 1, F.C.T. Abuja" },
    facebookUrl: String,
    instagramUrl: String,
    youtubeUrl: String,
    tiktokUrl: String,
    xUrl: String,
    googleMapEmbed: String,
    footerText: { type: String, default: "A caring Abuja school where children grow in wisdom, confidence, character, and favour with God and people." },
    seoTitle: { type: String, default: "Rehoboth Prime Years" },
    seoDescription: { type: String, default: "A warm Abuja school for early years, primary, and secondary learners, combining strong foundations, creativity, character, and family partnership." }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
