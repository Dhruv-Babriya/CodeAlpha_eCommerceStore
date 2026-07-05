const Order = require("../models/Order");

const createOrder = async (req,res)=>{

    try{

        const order = await Order.create({

            user:req.user._id,

            products:req.body.products,

            totalPrice:req.body.totalPrice,

            shippingAddress:req.body.shippingAddress,

            paymentMethod:req.body.paymentMethod

        });

        res.status(201).json(order);

    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};

// Get All Orders
const getOrders = async (req, res) => {

    try {

        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product", "name price");

        res.json(orders);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Update Order Status
const updateOrderStatus = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id);

        if (!order) {

            return res.status(404).json({
                message: "Order not found"
            });

        }

        order.status = req.body.status;

        await order.save();

        res.json(order);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Delete Order
const deleteOrder = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id);

        if (!order) {

            return res.status(404).json({
                message: "Order not found"
            });

        }

        await order.deleteOne();

        res.json({
            message:"Order Deleted"
        });

    } catch (error) {

        res.status(500).json({
            message:error.message
        });

    }

};

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder
};