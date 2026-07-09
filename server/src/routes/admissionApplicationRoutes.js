const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/admissionApplicationController");
const { admissionDocumentUpload } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth");
const { adminRateLimit } = require("../middleware/security");

const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 5 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many application submissions. Please wait a few minutes and try again." }
});

router.post("/", applicationLimiter, admissionDocumentUpload.fields([
  { name: "birthCertificate", maxCount: 1 },
  { name: "passportPhotographs", maxCount: 2 },
  { name: "immunizationRecord", maxCount: 1 },
  { name: "previousSchoolReport", maxCount: 1 },
  { name: "additionalDocument", maxCount: 1 }
]), ctrl.createApplication);
router.get("/", adminRateLimit, protect, adminOnly, ctrl.listApplications);
router.put("/:id/read", adminRateLimit, protect, adminOnly, ctrl.markRead);
router.delete("/:id", adminRateLimit, protect, adminOnly, ctrl.deleteApplication);

module.exports = router;
