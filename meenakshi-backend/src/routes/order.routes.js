// src/routes/order.routes.js
import { Router } from "express";
import { createOrder, confirmUpiPayment, getMyOrders, getAllOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { orderValidator, validate } from "../middleware/validate.middleware.js";

const router = Router();
router.post  ("/",                     protect,            orderValidator, validate, createOrder);
router.patch ("/:id/confirm-payment",  protect,            confirmUpiPayment);
router.get   ("/my",                   protect,            getMyOrders);
router.get   ("/",                     protect, adminOnly, getAllOrders);
router.patch ("/:id/status",           protect, adminOnly, updateOrderStatus);
export default router;
