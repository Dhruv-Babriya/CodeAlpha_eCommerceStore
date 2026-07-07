const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads/profiles");

console.log("Upload Path:", uploadPath);
console.log("Folder Exists:", fs.existsSync(uploadPath));

// Create folder automatically
if (fs.existsSync(uploadPath) && !fs.statSync(uploadPath).isDirectory()) {
    fs.unlinkSync(uploadPath);
}

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
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