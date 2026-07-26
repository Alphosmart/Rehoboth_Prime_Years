const router = require("express").Router();
const GalleryItem = require("../models/GalleryItem");
const crud = require("../controllers/crudController");
const mountAdminOps = require("./adminOps");
const { protect, adminOnly } = require("../middleware/auth");
const { adminRateLimit } = require("../middleware/security");
const validate = require("../middleware/validate");
const { gallerySchema } = require("../validators/schemas");
const asyncHandler = require("../middleware/asyncHandler");
const { sanitizeObject } = require("../utils/sanitizeHtml");
const { CURRENT_GALLERY_VERSION } = require("../models/GalleryItem");

router.get("/", crud.list(GalleryItem, { publicFilter: () => ({ collectionVersion: CURRENT_GALLERY_VERSION }) }));
router.post(
  "/replace-from-categories",
  adminRateLimit,
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length || items.length > 200) {
      return res.status(400).json({ message: "Provide between 1 and 200 gallery items" });
    }
    const cleanItems = items.map((item) => sanitizeObject({
      title: String(item.title || "").trim().slice(0, 120),
      description: String(item.description || "").trim().slice(0, 500),
      image: String(item.image || "").trim(),
      category: String(item.category || "Campus").trim().slice(0, 100),
      featured: Boolean(item.featured),
      collectionVersion: CURRENT_GALLERY_VERSION,
    }));
    if (cleanItems.some((item) => !item.title || !item.image)) {
      return res.status(400).json({ message: "Every gallery item needs a title and image" });
    }
    await GalleryItem.deleteMany({});
    const created = await GalleryItem.insertMany(cleanItems);
    res.locals.audit = { action: "replace", count: created.length };
    res.status(201).json({ message: "Gallery replaced", count: created.length });
  })
);
router.post("/", adminRateLimit, protect, adminOnly, validate(gallerySchema), crud.create(GalleryItem));
router.put("/:id", adminRateLimit, protect, adminOnly, validate(gallerySchema), crud.update(GalleryItem));
router.delete("/:id", adminRateLimit, protect, adminOnly, crud.remove(GalleryItem));

mountAdminOps(router, GalleryItem);

module.exports = router;
