const express = require("express");

const router = express.Router();

const {
    createOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);

router.get("/", getOrders);

router.put("/:id", updateOrderStatus);

router.delete("/:id", deleteOrder);

module.exports = router;