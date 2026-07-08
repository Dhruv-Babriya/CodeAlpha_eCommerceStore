const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword,
    getUsers,
    updateUser,
    deleteUser,
    addToWishlist,
    getWishlist,
    removeWishlist
} = require("../controllers/userController");

const {
    protect
} = require("../middleware/authMiddleware");

router.put("/change-password", protect, changePassword);

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Users list
router.get("/", getUsers);

router.post(
    "/wishlist/:productId",
    protect,
    addToWishlist
);

router.get(
    "/wishlist",
    protect,
    getWishlist
);

router.delete(
    "/wishlist/:productId",
    protect,
    removeWishlist
);

// Update/Delete user
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;