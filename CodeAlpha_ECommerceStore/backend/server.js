const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const couponRoutes = require("./routes/couponRoutes");
const productImageRoutes = require("./routes/productImageRoutes");


dotenv.config({ path: path.resolve(__dirname, ".env") });
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce";

const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/upload", productImageRoutes);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// Serve frontend static files from the parent directory's frontend folder
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Serve admin pages
app.use("/admin", express.static(path.join(frontendPath, "admin")));

// For any route that doesn't match an API route, serve index.html (SPA-like fallback)
app.get("*", (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(frontendPath, "index.html"));
    } else {
        res.status(404).json({ message: "API route not found" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});
