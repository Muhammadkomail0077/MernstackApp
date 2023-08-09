import express from "express";
import { Admin, isAuthenticated } from "../middlewares/auth.js"
import { createOrder, getMyOrders, getOrderDetails, processOrder, getAdminOrders, processPayment } from "../controllers/order.js";


const router = express.Router();

router.post("/new", isAuthenticated, createOrder)
router.post("/payment", isAuthenticated, processPayment)


router.get("/my", isAuthenticated, getMyOrders)
router.get("/admin", isAuthenticated, Admin, getAdminOrders)
router.route("/single/:id").get(isAuthenticated, getOrderDetails).put(isAuthenticated, processOrder)


export default router;