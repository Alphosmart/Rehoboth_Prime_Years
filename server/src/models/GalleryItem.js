const mongoose = require("mongoose");
const CURRENT_GALLERY_VERSION = "categories-2026-07-stable";

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: { type: String, required: true },
    category: { type: String, default: "Campus" },
    featured: { type: Boolean, default: false },
    collectionVersion: { type: String, default: CURRENT_GALLERY_VERSION, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
module.exports.CURRENT_GALLERY_VERSION = CURRENT_GALLERY_VERSION;
