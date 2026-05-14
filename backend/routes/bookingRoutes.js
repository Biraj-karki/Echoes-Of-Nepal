// backend/routes/bookingRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createBooking,
    getMyBookings,
    getVendorBookings,
    updateBookingStatus,
    getBookingById,
    verifyKhaltiPayment,
    initiateKhaltiPayment
} from "../controllers/bookingController.js";

const router = express.Router();

// Vendor Bookings Management
router.get("/vendor", protect, getVendorBookings);
router.put("/:id/status", protect, updateBookingStatus);

// User Bookings
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.post("/:id/initiate-khalti", protect, initiateKhaltiPayment);
router.post("/verify-khalti", protect, verifyKhaltiPayment);

export default router;
