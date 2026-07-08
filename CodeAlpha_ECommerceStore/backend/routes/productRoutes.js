const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReview
} = require("../controllers/productController");

router.post("/", addProduct);

router.get("/", getProducts);

router.post("/:id/reviews", protect, addReview);

router.get("/:id", getProductById);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;