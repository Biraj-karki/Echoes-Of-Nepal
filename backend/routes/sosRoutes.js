import express from "express";
import { createSOSAlert, getAllSOSAlerts, resolveSOSAlert, updateSOSSituation } from "../controllers/sosController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminProtect } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/", protect, createSOSAlert);

// Admin only routes
router.get("/admin/all", adminProtect, getAllSOSAlerts);
router.patch("/admin/resolve/:id", adminProtect, resolveSOSAlert);
router.patch("/admin/update/:id", adminProtect, updateSOSSituation);

export default router;
