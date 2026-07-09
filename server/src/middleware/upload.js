const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { cloudinary, configured } = require("../config/cloudinary");

// Per-type size ceilings (bytes). Images are compressed, so keep them small;
// videos need more headroom.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
];

const allowedDocumentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

function resourceType(file) {
  return file.mimetype.startsWith("video/") ? "video" : "image";
}

function storedResourceType(mimetype) {
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("image/")) return "image";
  return "raw";
}

function documentResourceType(file) {
  return file.mimetype.startsWith("image/") ? "image" : "raw";
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only JPG, PNG, WebP, GIF, MP4, WebM, and MOV uploads are allowed"));
    cb(null, true);
  }
});

const admissionDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_BYTES, files: 6 },
  fileFilter(req, file, cb) {
    if (!allowedDocumentTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF, Word, JPG, PNG, WebP, HEIC, and HEIF documents are allowed"));
    }
    cb(null, true);
  }
});

const extensionByMime = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx"
};

// Enforce the per-type size limit (multer only supports one global limit).
function assertWithinSizeLimit(file) {
  const isVideo = file.mimetype.startsWith("video/");
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    const error = new Error(`${isVideo ? "Video" : "Image"} exceeds the ${Math.round(max / (1024 * 1024))}MB limit`);
    error.statusCode = 413;
    throw error;
  }
}

// Compress/resize images to web-friendly dimensions before storage. Animated
// GIFs and videos are passed through untouched. Returns { buffer, mimetype, ext }.
async function optimizeImage(file) {
  if (!file.mimetype.startsWith("image/") || file.mimetype === "image/gif") {
    return { buffer: file.buffer, mimetype: file.mimetype, ext: extensionByMime[file.mimetype] };
  }
  try {
    const buffer = await sharp(file.buffer)
      .rotate() // honour EXIF orientation
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    return { buffer, mimetype: "image/jpeg", ext: ".jpg" };
  } catch (error) {
    console.error("Image optimization failed, using original:", error.message);
    return { buffer: file.buffer, mimetype: file.mimetype, ext: extensionByMime[file.mimetype] };
  }
}

async function saveLocalUpload(buffer, ext, mimetype, baseUrl) {
  const uploadsDir = path.join(__dirname, "..", "..", "uploads");
  const filename = `${crypto.randomUUID()}${ext || ".jpg"}`;
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  return { url: `${baseUrl}/uploads/${filename}`, publicId: filename, resourceType: storedResourceType(mimetype) };
}

async function uploadToCloudinary(file, folder = "school-website", baseUrl = "") {
  assertWithinSizeLimit(file);
  const { buffer, mimetype, ext } = await optimizeImage(file);
  const optimized = { ...file, buffer, mimetype };

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cloudinary must be configured for production uploads");
    }
    return saveLocalUpload(buffer, ext || path.extname(file.originalname), mimetype, baseUrl);
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType(optimized) },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
      }
    );
    stream.end(buffer);
  });
}

async function uploadAdmissionDocument(file, folder = "admission-documents", baseUrl = "") {
  if (file.size > MAX_DOCUMENT_BYTES) {
    const error = new Error(`Document exceeds the ${Math.round(MAX_DOCUMENT_BYTES / (1024 * 1024))}MB limit`);
    error.statusCode = 413;
    throw error;
  }

  const ext = extensionByMime[file.mimetype] || path.extname(file.originalname);
  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cloudinary must be configured for production uploads");
    }
    return saveLocalUpload(file.buffer, ext, file.mimetype, baseUrl);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: documentResourceType(file) },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
      }
    );
    stream.end(file.buffer);
  });
}

module.exports = { upload, admissionDocumentUpload, uploadToCloudinary, uploadAdmissionDocument };
