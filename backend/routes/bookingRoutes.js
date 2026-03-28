// backend/routes/bookingRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createBooking,
    getMyBookings,
    getVendorBookings,
    updateBookingStatus
} from "../controllers/bookingController.js";

const router = express.Router();

// User Bookings
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);

// Vendor Bookings Management
router.get("/vendor", protect, getVendorBookings);
router.put("/:id/status", protect, updateBookingStatus);

export default router;
