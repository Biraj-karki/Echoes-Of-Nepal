import express from "express";
import { adminProtect } from "../middleware/adminProtect.js";
import {
  listUsers,
  listStories,
  adminDeleteStory,
  adminDeleteUser,
} from "../controllers/adminManagementController.js";

const router = express.Router();

router.get("/users", adminProtect, listUsers);
router.get("/stories", adminProtect, listStories);
router.delete("/stories/:id", adminProtect, adminDeleteStory);
router.delete("/users/:id", adminProtect, adminDeleteUser);

export default router;
