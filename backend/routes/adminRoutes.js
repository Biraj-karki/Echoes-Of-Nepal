import express from "express";
import { adminProtect } from "../middleware/adminProtect.js";
import { adminListUsers, adminListStories, adminDeleteStory } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", adminProtect, adminListUsers);
router.get("/stories", adminProtect, adminListStories);
router.delete("/stories/:id", adminProtect, adminDeleteStory);

export default router;
