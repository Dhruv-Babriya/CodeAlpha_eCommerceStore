const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Supports multiple upload destinations by using a route-specific destination.
// By default this middleware uploads to ../uploads/profiles (used by profile upload).
const defaultUploadPath = path.join(__dirname, "../uploads/profiles");

const getUploadPath = (req) => {
    // For product upload routes, we expect header/field usage via req.uploadType.
    // productImageRoutes will set req.uploadType = "products".
    if (req && req.uploadType === "products") {
        return path.join(__dirname, "../uploads/products");
    }
    return defaultUploadPath;
};

const ensureDir = (dirPath) => {
    // Create folder automatically
    if (fs.existsSync(dirPath) && !fs.statSync(dirPath).isDirectory()) {
        fs.unlinkSync(dirPath);
    }
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Use Node.js built-in crypto module (DO NOT install npm 'crypto' package)
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = getUploadPath(req);
        ensureDir(uploadPath);
        cb(null, uploadPath);
    },

    filename(req, file, cb) {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const unique = crypto.randomBytes(16).toString("hex");
        cb(null, `${Date.now()}-${unique}${ext}`);
    }
});


const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
]);

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const fileFilter = (req, file, cb) => {
    const mimeOk = ALLOWED_MIME.has(file.mimetype);
    const ext = path.extname(file.originalname || "").toLowerCase();
    const extOk = ALLOWED_EXT.has(ext);

    if (mimeOk && extOk) return cb(null, true);

    cb(new Error("Invalid image type. Allowed: JPG, JPEG, PNG, WEBP"), false);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
