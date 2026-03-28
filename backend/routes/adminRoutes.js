import express from "express";
import multer from "multer";
import { adminProtect } from "../middleware/adminProtect.js";
import {
  listUsers,
  listStories,
  adminDeleteStory,
  adminDeleteUser,
} from "../controllers/adminManagementController.js";
import {
    getAllDistricts,
    updateDistrict,
    getAllDestinations,
    addDestination,
    updateDestination,
    deleteDestination,
    getAllTreks,
    addTrek,
    updateTrek,
    deleteTrek
} from "../controllers/tourismController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/users", adminProtect, listUsers);
router.delete("/users/:id", adminProtect, adminDeleteUser);

router.get("/stories", adminProtect, listStories);
router.delete("/stories/:id", adminProtect, adminDeleteStory);

// Tourism Management
router.get("/districts", adminProtect, getAllDistricts);
router.put("/districts/:id", adminProtect, upload.single("image"), updateDistrict);

router.get("/destinations", adminProtect, getAllDestinations);
router.post("/destinations", adminProtect, upload.single("image"), addDestination);
router.put("/destinations/:id", adminProtect, upload.single("image"), updateDestination);
router.delete("/destinations/:id", adminProtect, deleteDestination);

router.get("/treks", adminProtect, getAllTreks);
router.post("/treks", adminProtect, upload.single("image"), addTrek);
router.put("/treks/:id", adminProtect, upload.single("image"), updateTrek);
router.delete("/treks/:id", adminProtect, deleteTrek);

// Vendor Management
import { getAllVendors, approveVendor, rejectVendor } from "../controllers/vendorController.js";
router.get("/vendors", adminProtect, getAllVendors);
router.put("/vendors/:id/approve", adminProtect, approveVendor);
router.put("/vendors/:id/reject", adminProtect, rejectVendor);

export default router;

