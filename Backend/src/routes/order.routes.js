import express from "express";
import { placeOrder, getOrderHistory } from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 📌 Place an Order (Protected Route)
router.post("/place-order", authMiddleware, placeOrder);

// 📌 Get Order History (Protected Route)
router.get("/order-history", authMiddleware, getOrderHistory);

export default router;
