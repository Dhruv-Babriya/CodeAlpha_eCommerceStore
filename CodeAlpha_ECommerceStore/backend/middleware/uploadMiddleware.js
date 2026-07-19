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

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadPath = getUploadPath(req);
        console.log("Upload Path:", uploadPath);
        console.log("Folder Exists:", fs.existsSync(uploadPath));
        ensureDir(uploadPath);
        cb(null, uploadPath);
    },

    filename(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

module.exports = multer({
    storage,
    fileFilter
});