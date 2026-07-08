const Coupon = require("../models/Coupon");

const applyCoupon = async (req, res) => {

    try {

        const { code } = req.body;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            active: true
        });

        if (!coupon) {
            return res.status(404).json({
                message: "Invalid Coupon"
            });
        }

        res.json({
            discount: coupon.discount
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    applyCoupon
};