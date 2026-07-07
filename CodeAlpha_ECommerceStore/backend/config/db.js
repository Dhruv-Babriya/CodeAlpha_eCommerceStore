const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce";

        await mongoose.connect(uri);

        console.log("MongoDB Connected");

    } catch (error) {

        console.log(error.message);

        process.exit(1);

    }
};

module.exports = connectDB;