const express = require("express");
const Comment = require("../models/Comment");

const router = express.Router();

// @route   POST /api/comments
// @desc    Create a comment
router.post("/", async (req, res) => {
    try {
        const { post, user, comment } = req.body;
        if (!post || !user || !comment) {
            return res.status(400).json({ message: "Post ID, user ID, and comment text are required." });
        }

        const newComment = await Comment.create({
            post,
            user,
            comment
        });

        const populatedComment = await Comment.findById(newComment._id).populate("user", "username email profileImage");
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a post
router.get("/post/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate("user", "username email profileImage")
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
