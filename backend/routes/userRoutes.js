// backend/routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for avatars
});

router.get("/profile", protect, getUserProfile); 
router.put("/profile", protect, updateUserProfile);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);
router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);

export default router;
