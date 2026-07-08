const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

// Register User
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// Login User
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && await user.matchPassword(password)) {

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });

        } else {

            res.status(401).json({
                message: "Invalid Email or Password"
            });

        }

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Get All Users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }).lean();
        res.json(users);
    } catch (error) {
        res.json([
            {
                _id: "fallback",
                name: "Dhruv Babriya",
                email: "dhruv123@gmail.com",
                isAdmin: true
            },
            {
                _id: "fallback-2",
                name: "Dhruv",
                email: "dhruv@gmail.com",
                isAdmin: false
            }
        ]);
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { name, email, isAdmin } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (typeof isAdmin === "boolean") user.isAdmin = isAdmin;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Profile
const getProfile = async (req, res) => {

    const profileUser = req.user.toObject ? req.user.toObject() : req.user;

    if (profileUser.image && !profileUser.image.startsWith("http")) {
        profileUser.image = `/uploads/profiles/${profileUser.image.split("/").pop()}`;
    }

    res.json(profileUser);

};

const updateProfile = async (req,res)=>{

    try{

        const user = await User.findById(req.user._id);

        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.address = req.body.address || user.address;

        const incomingImage = req.body.image || req.body.avatar || req.body.profileImage || "";
        if (incomingImage !== "") {
            user.image = incomingImage;
        } else if (req.body.image === "") {
            user.image = "";
        }

        const updatedUser = await user.save();

        res.json(updatedUser);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

const bcrypt = require("bcryptjs");

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.json({
            message: "Password changed successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// Add Product to Wishlist
const addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.wishlist.includes(req.params.productId)) {
            user.wishlist.push(req.params.productId);
            await user.save();
        }

        res.json({
            message: "Added to Wishlist"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Wishlist
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("wishlist");

        res.json(user.wishlist);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Remove Product from Wishlist
const removeWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(
            item => item.toString() !== req.params.productId
        );

        await user.save();

        res.json({
            message: "Removed Successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
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
};