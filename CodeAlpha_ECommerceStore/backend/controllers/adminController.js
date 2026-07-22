const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const getStats = async (req, res) => {

    try {

        const [products, orders, users, revenueResult] = await Promise.all([
            Product.countDocuments().catch(() => 0),
            Order.countDocuments().catch(() => 0),
            User.countDocuments().catch(() => 0),
            Order.aggregate([
                { $match: { status: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ]).catch(() => [])
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            products,
            orders,
            users,
            revenue
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