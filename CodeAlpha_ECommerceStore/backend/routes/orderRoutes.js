const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");


// Create order
router.post("/", protect, createOrder);


// User/Admin get orders
router.get("/", protect, getOrders);


// Update order status
router.put("/:id", protect, updateOrderStatus);


// Delete order
router.delete("/:id", protect, deleteOrder);


module.exports = router;