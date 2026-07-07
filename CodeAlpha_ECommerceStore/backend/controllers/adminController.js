const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const getStats = async (req, res) => {

    try {

        const [products, orders, users] = await Promise.all([
            Product.countDocuments().catch(() => 0),
            Order.countDocuments().catch(() => 0),
            User.countDocuments().catch(() => 0)
        ]);

        res.json({
            products,
            orders,
            users
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    getStats
};