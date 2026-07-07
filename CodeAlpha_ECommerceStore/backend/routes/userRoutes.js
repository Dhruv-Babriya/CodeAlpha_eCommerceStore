const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    getUsers,
    updateUser,
    deleteUser
}=require("../controllers/userController");

const {
    protect
} = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Users list
router.get("/", getUsers);

// Update/Delete user
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;