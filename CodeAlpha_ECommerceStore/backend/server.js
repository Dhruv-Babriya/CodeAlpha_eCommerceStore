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
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
    res.send("E-Commerce API Running...");
});

// Future Routes
// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});