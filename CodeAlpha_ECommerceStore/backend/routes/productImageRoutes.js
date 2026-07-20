const express = require("express");

const router = express.Router();

const multer = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");

const Product = require("../models/Product");

const path = require("path");
const fs = require("fs");

const removeOldImageIfExists = (imagePathOrUrl) => {
    if (!imagePathOrUrl) return;

    // We only manage images stored in /uploads/products
    const uploadsPrefix = "/uploads/products/";
    if (!imagePathOrUrl.includes(uploadsPrefix)) return;

    const fileName = path.basename(imagePathOrUrl);
    const fullPath = path.join(__dirname, "../uploads/products", fileName);

    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
        } catch (e) {
            console.error("Failed to delete old product image:", e);
        }
    }
};

// Upload image and attach it to an existing product (replace image).
router.post(
    "/products/:id",
    protect,
    (req, res, next) => {
        req.uploadType = "products";
        next();
    },
    multer.single("image"),
    async (req, res) => {
        // Prevent any accidental routing collisions where req.params.id === 'create'
        // by ensuring this handler is always treated as /products/create.
        // (This route never uses req.params.id.)

        try {
            if (!req.file) {
                return res.status(400).json({ message: "No image uploaded" });
            }

            const product = await Product.findById(req.params.id);
            if (!product) {
                // cleanup uploaded file since product doesn't exist
                return res.status(404).json({ message: "Product not found" });
            }

            // Delete previous image if any
            removeOldImageIfExists(product.image);

            product.image = `/uploads/products/${req.file.filename}`;
            await product.save();

            res.json({ image: product.image, product });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

// Upload image first (for product creation), without requiring an existing product.
router.post(
    "/products/create",
    protect,
    (req, res, next) => {
        req.uploadType = "products";
        next();
    },
    multer.single("image"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No image uploaded" });
            }

            const image = `/uploads/products/${req.file.filename}`;
            return res.json({ image });
        } catch (err) {
            // Return full error details to help debug 500 during image upload
            return res.status(500).json({
                message: err.message,
                stack: err.stack
            });
        }
    }
);


module.exports = router;

