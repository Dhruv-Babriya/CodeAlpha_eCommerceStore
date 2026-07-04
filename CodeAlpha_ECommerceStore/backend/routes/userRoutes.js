const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile
} = require("../controllers/userController");

const {
    protect
} = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Profile
router.get("/profile", protect, getProfile);

module.exports = router;