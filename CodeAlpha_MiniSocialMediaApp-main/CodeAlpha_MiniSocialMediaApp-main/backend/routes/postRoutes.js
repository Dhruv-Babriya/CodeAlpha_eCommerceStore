const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
router.post("/", async (req, res) => {
    try {
        const { user, content, image } = req.body;
        if (!user || !content) {
            return res.status(400).json({ message: "User ID and content are required." });
        }

        const post = await Post.create({
            user,
            content,
            image // Optional image URL
        });

        const populatedPost = await Post.findById(post._id).populate("user", "username email profileImage");
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/posts
// @desc    Get all posts (sorted newest first)
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username email profileImage")
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/posts/like/:id
// @desc    Toggle like status on a post
router.put("/like/:id", async (req, res) => {
    try {
        const { user } = req.body;
        if (!user) {
            return res.status(400).json({ message: "User ID is required to like a post." });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const likeIndex = post.likes.indexOf(user);
        if (likeIndex > -1) {
            // Already liked, so remove like (unlike)
            post.likes.splice(likeIndex, 1);
        } else {
            // Not liked, add like
            post.likes.push(user);
        }

        await post.save();
        const populatedPost = await Post.findById(post._id).populate("user", "username email profileImage");
        res.json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }
        
        await Post.deleteOne({ _id: req.params.id });
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;