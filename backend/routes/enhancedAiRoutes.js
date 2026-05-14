import express from "express";
import {
    generateItinerary,
    tagStory,
    enhanceDescription,
    moderateContent,
    analyzePricing,
    getAiStatus
} from "../controllers/enhancedAiController.js";
import { getAiRecommendations } from "../controllers/aiController.js";

const router = express.Router();

/**
 * Original routes
 */
router.post("/recommendations", getAiRecommendations);

/**
 * New enhanced AI routes
 */

// 1. Generate personalized itinerary
router.post("/itinerary", generateItinerary);

// 2. Auto-tag stories with metadata
router.post("/tag-story", tagStory);

// 3. Enhance vendor descriptions
router.post("/enhance-description", enhanceDescription);

// 4. Moderate content (safety check)
router.post("/moderate", moderateContent);

// 5. Analyze pricing competitiveness
router.post("/analyze-pricing", analyzePricing);

// 6. System status check
router.get("/status", getAiStatus);

export default router;
