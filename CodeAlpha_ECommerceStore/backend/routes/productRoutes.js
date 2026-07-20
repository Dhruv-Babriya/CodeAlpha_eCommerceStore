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

// Admin creation is not protected in your current code, but it is harmless.
// IMPORTANT: the "create" path is under /api/products/create in the admin upload flow.
// If you add a router.post("/:id", ...) it can cause "create" to be treated as an id.
// Here we only define routes without conflicting "create".

router.post("/", addProduct);

// Defensive: if someone hits /api/products/create, avoid treating it as :id.
// Also blocks other accidental string ids from reaching Product.findById.
router.all("/create", (req, res) => res.status(404).json({ message: "Not found" }));

// Defensive: if :id is not a valid ObjectId, return 400 instead of Mongoose cast error.
router.param("id", (req, res, next, id) => {
    // 24 hex chars
    if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) return next();
    return res.status(400).json({ message: `Invalid product id: ${id}` });
});



router.get("/", getProducts);

router.post("/:id/reviews", protect, addReview);

router.get("/:id", getProductById);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;

