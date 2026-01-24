// backend/routes/storyRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import {
  createStory,
  getAllStories,
  getMyStories,
  deleteStory,
  deleteStoryMedia,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
} from "../controllers/storyController.js";


const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.get("/",optionalAuth, getAllStories);
router.get("/me", protect, getMyStories);

router.post("/", protect, upload.array("media", 6), createStory);

//  delete whole story + cloudinary assets
router.delete("/:id", protect, deleteStory);

// delete single media from a story + cloudinary asset
router.delete("/:storyId/media/:mediaId", protect, deleteStoryMedia);

router.post("/:id/like", protect, toggleLike);
router.get("/:id/comments", optionalAuth, getComments);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);


export default router;
