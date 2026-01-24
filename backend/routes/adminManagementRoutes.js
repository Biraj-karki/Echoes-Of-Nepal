import express from "express";
import { adminProtect } from "../middleware/adminProtect.js";
import {
  listUsers,
  listStories,
  adminDeleteStory,
  adminDeleteUser,
} from "../controllers/adminManagementController.js";

const router = express.Router();

// Admin-only routes with protection
router.get("/users", adminProtect, listUsers);  // Fetch users
router.get("/stories", adminProtect, listStories);  // Fetch stories
router.delete("/stories/:id", adminProtect, adminDeleteStory);  // Delete story
router.delete("/users/:id", adminProtect, adminDeleteUser);  // Delete user

export default router;
