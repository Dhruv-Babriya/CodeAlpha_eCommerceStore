const express = require("express");

const router = express.Router();

const multer = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");

const Product = require("../models/Product");

router.post("/products/:id", protect, (req, res, next) => {
    // Tell upload middleware where to store
    req.uploadType = "products";
    next();
}, multer.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // placeholder; will fix path after storage destination is corrected
        product.image = `/uploads/products/${req.file.filename}`;
        await product.save();

        res.json({ image: product.image, product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

