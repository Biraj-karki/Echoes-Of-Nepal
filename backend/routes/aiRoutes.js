import express from "express";
import { getAiRecommendations } from "../controllers/aiController.js";
import { chatWithAi } from "../controllers/enhancedAiController.js";

const router = express.Router();

router.post("/recommendations", getAiRecommendations);
router.post("/chat", chatWithAi);

export default router;
