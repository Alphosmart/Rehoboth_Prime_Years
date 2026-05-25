const mongoose = require("mongoose");

const homepageContentSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "Every child known. Every talent strengthened." },
    heroSubtitle: { type: String, default: "A close-knit Abuja learning community where strong academics, creativity, confidence, and character grow side by side." },
    heroImage: String,
    heroVideo: String,
    heroMedia: String,
    heroMediaType: { type: String, enum: ["image", "video"], default: "image" },
    heroMediaActive: { type: Boolean, default: true },
    heroSlides: [
      {
        title: String,
        subtitle: String,
        image: String,
        video: String,
        media: String,
        mediaType: { type: String, enum: ["image", "video"], default: "image" },
        isActive: { type: Boolean, default: true },
        ctaLabel: String,
        ctaLink: String
      }
    ],
    aboutPreview: String,
    whyChooseUs: [{ title: String, description: String }],
    admissionsCtaTitle: { type: String, default: "Begin your admissions journey" },
    admissionsCtaText: String,
    seoTitle: String,
    seoDescription: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageContent", homepageContentSchema);
