import express from "express";
import { adminLogin, adminMe } from "../controllers/adminAuthController.js";
import { adminProtect } from "../middleware/adminProtect.js";


const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", adminProtect, adminMe);

export default router;
