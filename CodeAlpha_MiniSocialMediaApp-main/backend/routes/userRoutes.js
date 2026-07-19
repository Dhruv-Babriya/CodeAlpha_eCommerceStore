const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();

/*
REGISTER USER
*/
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration Successful",
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/*
LOGIN USER
*/
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id },
            "SECRET_KEY",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage,
                coverImage: user.coverImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/*
GET ALL USERS (excluding password)
*/
router.get("/all", async (req, res) => {
    try {
        const users = await User.find({}, "-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/*
GET PROFILE BY ID
*/
router.get("/profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id, "-password")
            .populate("followers", "username email profileImage")
            .populate("following", "username email profileImage");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/*
GET USER POSTS
*/
router.get("/profile/:id/posts", async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.id })
            .populate("user", "username email profileImage")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/*
UPDATE PROFILE (Bio & Profile Image)
*/
router.put("/profile/:id", async (req, res) => {
    try {
        const { bio, profileImage, coverImage } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (bio !== undefined) user.bio = bio;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (coverImage !== undefined) user.coverImage = coverImage;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage,
                coverImage: user.coverImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;