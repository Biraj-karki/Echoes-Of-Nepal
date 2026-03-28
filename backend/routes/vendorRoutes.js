// backend/routes/vendorRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
    applyVendor,
    getMyVendorProfile,
    addListing,
    updateListing,
    deleteListing,
    getMyListings,
    getPublicVendorsByDistrict,
    getPublicVendorsByDestination,
    getPublicVendorsByTrek,
    getPublicListingById
} from "../controllers/vendorController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public Routes
router.get("/district/:slug", getPublicVendorsByDistrict);
router.get("/destination/:id", getPublicVendorsByDestination);
router.get("/trek/:id", getPublicVendorsByTrek);
router.get("/listing/:id", getPublicListingById);

// Protected Routes (Vendor Application & Management)
router.post("/apply", protect, upload.any(), applyVendor); // Can receive 'document' and 'image' files
router.get("/me", protect, getMyVendorProfile);

// Listing Management
router.get("/listings", protect, getMyListings);
router.post("/listings", protect, upload.any(), addListing);
router.put("/listings/:id", protect, upload.any(), updateListing);
router.delete("/listings/:id", protect, deleteListing);

export default router;
