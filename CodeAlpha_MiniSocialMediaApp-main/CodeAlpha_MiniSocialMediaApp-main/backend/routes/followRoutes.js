const express = require("express");
const Follow = require("../models/Follow");
const User = require("../models/User");

const router = express.Router();

// @route   POST /api/follow/toggle
// @desc    Toggle follow/unfollow a user
router.post("/toggle", async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ message: "Both followerId and followingId are required." });
        }

        if (followerId === followingId) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        // Check if follow record already exists
        const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });

        if (existingFollow) {
            // Unfollow logic
            await Follow.deleteOne({ _id: existingFollow._id });

            // Update User profiles
            await User.findByIdAndUpdate(followerId, { $pull: { following: followingId } });
            await User.findByIdAndUpdate(followingId, { $pull: { followers: followerId } });

            return res.json({ following: false, message: "Unfollowed successfully" });
        } else {
            // Follow logic
            await Follow.create({ follower: followerId, following: followingId });

            // Update User profiles
            await User.findByIdAndUpdate(followerId, { $addToSet: { following: followingId } });
            await User.findByIdAndUpdate(followingId, { $addToSet: { followers: followerId } });

            return res.json({ following: true, message: "Followed successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/follow/status
// @desc    Get follow status between two users
router.get("/status", async (req, res) => {
    try {
        const { followerId, followingId } = req.query;
        if (!followerId || !followingId) {
            return res.status(400).json({ message: "Both followerId and followingId are required." });
        }

        const isFollowing = await Follow.exists({ follower: followerId, following: followingId });
        res.json({ following: !!isFollowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
