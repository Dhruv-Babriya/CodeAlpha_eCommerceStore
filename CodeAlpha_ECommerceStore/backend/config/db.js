const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce";

        await mongoose.connect(uri);

        console.log("MongoDB Connected");

    } catch (error) {

        console.log("MongoDB Connection Error:", error.message);
        // Don't exit process - let server start anyway for Railway
        // The server will show errors on API calls but won't crash

    }
};

module.exports = connectDB;
