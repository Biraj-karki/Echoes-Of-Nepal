import ollama from "ollama";
import pool from "../config/db.js";
import {
    createGeminiModel,
    disableGeminiTemporarily,
    getGeminiModelName,
    isGeminiQuotaError,
} from "../utils/gemini.js";

const model = createGeminiModel();

/**
 * Helper function to call AI (Ollama > Gemini > null)
 */
const callAI = async (prompt, modelName = "llama3") => {
    try {
        const modelsToTry = [modelName, "mistral", "llama2"];
        let lastError = null;

        for (const ollamaModel of modelsToTry) {
            try {
                const ollamaResponse = await ollama.generate({
                    model: ollamaModel,
                    prompt,
                    stream: false,
                });

                return {
                    text: ollamaResponse.response.trim(),
                    source: `ollama (${ollamaModel})`,
                    success: true,
                };
            } catch (err) {
                lastError = err;
            }
        }

        try {
            if (!model) {
                throw new Error("Gemini not configured or disabled");
            }

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return {
                text: response.text().trim(),
                source: `gemini (${getGeminiModelName()})`,
                success: true,
            };
        } catch (geminiError) {
            if (isGeminiQuotaError(geminiError)) {
                disableGeminiTemporarily("quota/rate limit");
            }

            return {
                text: null,
                source: "none",
                success: false,
                error: `Ollama: ${lastError?.message || "Unknown"}, Gemini: ${geminiError.message}`,
            };
        }
    } catch (err) {
        return {
            text: null,
            source: "error",
            success: false,
            error: err.message,
        };
    }
};

/**
 * 1. Generate Itinerary
 * POST /api/ai/itinerary
 */
export const generateItinerary = async (req, res) => {
    try {
        const { origin, destination, duration, budget, interests } = req.body;

        if (!destination || !duration) {
            return res.status(400).json({ error: "destination and duration are required" });
        }

        const prompt = `Create a detailed ${duration}-day travel itinerary in Nepal with these details:
Origin: ${origin || "Kathmandu"}
Destination: ${destination}
Budget: ${budget || "moderate"} (budget-friendly, moderate, or luxury)
Interests: ${interests || "general tourism"}

Return a JSON object with this structure:
{
  "title": "Itinerary for [duration] days",
  "overview": "brief summary",
  "days": [
    {
      "day": 1,
      "title": "Arrival and Orientation",
      "morning": "activity description",
      "afternoon": "activity description",
      "evening": "activity description",
      "meals": "recommended restaurants/costs",
      "hotel_suggestion": "type and estimated cost",
      "estimated_cost": "in USD"
    }
  ],
  "total_estimated_cost": "total USD",
  "packing_tips": ["tip1", "tip2"],
  "best_season": "season recommendation",
  "safety_tips": ["tip1", "tip2"]
}

Return ONLY valid JSON, no markdown.`;

        const aiResponse = await callAI(prompt);

        if (!aiResponse.success || !aiResponse.text) {
            return res.json({
                error: "AI services unavailable, returning template",
                itinerary: {
                    title: `${duration}-Day ${destination} Itinerary`,
                    overview: "Unable to generate. Please try again.",
                    days: [],
                    recommendation: "Try again in a few moments or contact support",
                },
                aiSource: aiResponse.source,
                timestamp: new Date().toISOString(),
            });
        }

        try {
            const cleanText = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
            const itinerary = JSON.parse(cleanText);

            return res.json({
                itinerary,
                aiSource: aiResponse.source,
                timestamp: new Date().toISOString(),
            });
        } catch (parseError) {
            return res.json({
                itinerary: { raw: aiResponse.text },
                aiSource: aiResponse.source,
                parseNote: "Raw response returned (not valid JSON)",
                timestamp: new Date().toISOString(),
            });
        }
    } catch (err) {
        console.error("Itinerary generation error:", err.message);
        res.status(500).json({ error: "Failed to generate itinerary" });
    }
};

/**
 * 2. Tag Story Automatically
 * POST /api/ai/tag-story
 */
export const tagStory = async (req, res) => {
    try {
        const { content, title } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Story content is required" });
        }

        const prompt = `Analyze this travel story and extract metadata:

Title: ${title || "Untitled"}
Content: ${content.substring(0, 500)}...

Return a JSON object with:
{
  "suggested_tags": ["tag1", "tag2", "tag3"], // max 5 tags like: adventure, culture, nature, food, trek, budget, luxury, wildlife, historical, spiritual
  "districts_mentioned": ["district1", "district2"], // Nepal districts
  "season": "best season to visit",
  "budget_category": "budget-friendly|moderate|luxury",
  "story_type": "trek|cultural|food|wildlife|adventure|spiritual|mountaineering",
  "sentiment": "positive|neutral|negative",
  "duration_days": estimated number of days,
  "locations": ["location1", "location2"]
}

Return ONLY valid JSON.`;

        const aiResponse = await callAI(prompt);

        if (!aiResponse.success || !aiResponse.text) {
            return res.json({
                metadata: {
                    suggested_tags: ["story"],
                    districts_mentioned: [],
                    season: "anytime",
                    budget_category: "unknown",
                    story_type: "general",
                },
                aiSource: aiResponse.source,
                message: "Using default tagging (AI unavailable)",
            });
        }

        try {
            const cleanText = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
            const metadata = JSON.parse(cleanText);

            res.json({
                metadata,
                aiSource: aiResponse.source,
            });
        } catch (parseError) {
            res.json({
                metadata: { raw: aiResponse.text },
                aiSource: aiResponse.source,
                parseNote: "Raw response returned",
            });
        }
    } catch (err) {
        console.error("Story tagging error:", err.message);
        res.status(500).json({ error: "Failed to tag story" });
    }
};

/**
 * 3. Enhance Vendor Description
 * POST /api/ai/enhance-description
 */
export const enhanceDescription = async (req, res) => {
    try {
        const { currentDesc, vendorType, businessName } = req.body;

        if (!currentDesc) {
            return res.status(400).json({ error: "Current description is required" });
        }

        const prompt = `Improve this ${vendorType} business description to be more engaging and SEO-friendly for Nepal tourism:

Business Name: ${businessName || "Tourism Business"}
Current Description: ${currentDesc}

Create an enhanced version that:
1. Highlights unique features
2. Includes relevant Nepal tourism keywords
3. Has a clear call-to-action
4. Is 3-4 sentences (100-150 words)
5. Appeals to international tourists

Return as JSON:
{
  "enhanced_description": "improved text",
  "suggested_keywords": ["keyword1", "keyword2", "keyword3"],
  "seo_tips": ["tip1", "tip2"],
  "call_to_action": "CTA suggestion"
}

Return ONLY valid JSON.`;

        const aiResponse = await callAI(prompt);

        if (!aiResponse.success || !aiResponse.text) {
            return res.json({
                enhancement: {
                    enhanced_description: currentDesc,
                    suggested_keywords: [],
                    seo_tips: ["Add more keywords", "Include location names"],
                    call_to_action: "Book now",
                },
                aiSource: aiResponse.source,
                message: "AI unavailable - original description returned",
            });
        }

        try {
            const cleanText = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
            const enhancement = JSON.parse(cleanText);

            res.json({
                enhancement,
                aiSource: aiResponse.source,
            });
        } catch (parseError) {
            res.json({
                enhancement: { raw: aiResponse.text },
                aiSource: aiResponse.source,
            });
        }
    } catch (err) {
        console.error("Description enhancement error:", err.message);
        res.status(500).json({ error: "Failed to enhance description" });
    }
};

/**
 * 4. Moderate Content
 * POST /api/ai/moderate
 */
export const moderateContent = async (req, res) => {
    try {
        const { text, type = "story" } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text to moderate is required" });
        }

        const prompt = `Review this ${type} content and assess it for safety and appropriateness in Nepal tourism context:

Content: "${text}"

Analyze for:
- Inappropriate language or hate speech
- Safety violations or warnings
- Misleading or false claims
- Spam or commercial abuse
- Offensive cultural content

Return as JSON:
{
  "is_appropriate": true|false,
  "safety_score": 0.0-1.0,
  "issues": ["issue1", "issue2"] or [],
  "suggestions": ["suggestion1"] or [],
  "requires_review": true|false
}

Return ONLY valid JSON.`;

        const aiResponse = await callAI(prompt);

        if (!aiResponse.success || !aiResponse.text) {
            return res.json({
                moderation: {
                    is_appropriate: true,
                    safety_score: 0.8,
                    issues: [],
                    suggestions: ["Please ensure all information is accurate"],
                    requires_review: false,
                },
                aiSource: aiResponse.source,
                message: "Using default safety check (AI unavailable)",
            });
        }

        try {
            const cleanText = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
            const moderation = JSON.parse(cleanText);

            res.json({
                moderation,
                aiSource: aiResponse.source,
            });
        } catch (parseError) {
            res.json({
                moderation: { raw: aiResponse.text },
                aiSource: aiResponse.source,
            });
        }
    } catch (err) {
        console.error("Content moderation error:", err.message);
        res.status(500).json({ error: "Failed to moderate content" });
    }
};

/**
 * 5. Analyze Pricing
 * POST /api/ai/analyze-pricing
 */
export const analyzePricing = async (req, res) => {
    try {
        const { packagePrice, packageType, vendorType, description } = req.body;

        if (!packagePrice || !packageType) {
            return res.status(400).json({ error: "packagePrice and packageType are required" });
        }

        const prompt = `Analyze the competitiveness of this Nepal tourism package pricing:

Package Type: ${packageType}
Vendor Type: ${vendorType || "guide/homestay"}
Listed Price: USD ${packagePrice}
Description: ${description || "Not provided"}

Consider:
- Standard market rates for ${packageType} in Nepal
- Duration of package
- Included services
- Competitiveness vs competitors
- Value proposition

Return as JSON:
{
  "analysis": "detailed analysis",
  "market_range": {
    "min": "USD amount",
    "max": "USD amount",
    "typical": "USD amount"
  },
  "verdict": "overpriced|fair|underpriced|excellent-value",
  "recommendations": ["rec1", "rec2"],
  "market_position": "premium|standard|budget",
  "confidence": 0.0-1.0
}

Return ONLY valid JSON.`;

        const aiResponse = await callAI(prompt);

        if (!aiResponse.success || !aiResponse.text) {
            return res.json({
                pricing_analysis: {
                    analysis: "Unable to analyze at this time",
                    market_range: { min: "Unknown", max: "Unknown", typical: "Unknown" },
                    verdict: "unknown",
                    recommendations: ["Check competitor pricing"],
                    market_position: "unknown",
                    confidence: 0.0,
                },
                aiSource: aiResponse.source,
                message: "AI unavailable - please refresh and try again",
            });
        }

        try {
            const cleanText = aiResponse.text.replace(/```json/g, "").replace(/```/g, "").trim();
            const analysis = JSON.parse(cleanText);

            res.json({
                pricing_analysis: analysis,
                aiSource: aiResponse.source,
            });
        } catch (parseError) {
            res.json({
                pricing_analysis: { raw: aiResponse.text },
                aiSource: aiResponse.source,
            });
        }
    } catch (err) {
        console.error("Pricing analysis error:", err.message);
        res.status(500).json({ error: "Failed to analyze pricing" });
    }
};

/**
 * 6. Get AI System Status
 * GET /api/ai/status
 */
export const getAiStatus = async (req, res) => {
    try {
        let ollamaStatus = "unavailable";
        let geminiStatus = "unavailable";
        let models = [];

        try {
            const testResponse = await callAI("Hello", "llama2");
            if (testResponse.source === "ollama") {
                ollamaStatus = "active";

                try {
                    const response = await ollama.list();
                    models = response.models || [];
                } catch (e) {
                    models = ["- (could not fetch list)"];
                }
            }
        } catch (e) {
            ollamaStatus = "offline";
        }

        if (model) {
            geminiStatus = "configured";
        }

        res.json({
            status: {
                ollama: ollamaStatus,
                gemini: geminiStatus,
                overall: ollamaStatus === "active" ? "optimal" : geminiStatus === "configured" ? "fallback-ready" : "degraded",
            },
            installed_models: models || ["llama2", "mistral", "neural-chat"],
            timestamp: new Date().toISOString(),
            recommendation: ollamaStatus === "offline" ? "Please start Ollama with 'ollama serve'" : "System ready",
        });
    } catch (err) {
        console.error("Status check error:", err.message);
        res.status(500).json({ error: "Failed to check AI status" });
    }
};

/**
 * 7. AI Travel Assistant Chat
 * POST /api/ai/chat
 */
export const chatWithAi = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const systemPrompt = `You are a professional Nepal travel assistant named "Echoes of Nepal Assistant".
Your goal is to help users plan trips, find treks, and explore the culture and nature of Nepal.

Guidelines:
1. Provide concise, structured, and helpful travel suggestions.
2. Use emojis to make the response engaging (🥾, 🌄, 🏨, 🥘, 🕉️).
3. If an itinerary is requested, return a clear day-wise plan with "Day X:" headers.
4. Focus on safety, best seasons, and local tips.
5. IMPORTANT: If you suggest specific places, destinations, or treks, list their names at the very end of your response inside double square brackets like this: [[Destination Name 1, Destination Name 2]].
6. Only list real, well-known locations in Nepal.

User Message: ${message}`;

        let fullPrompt = systemPrompt;
        if (history.length > 0) {
            const historyText = history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
            fullPrompt = `${systemPrompt}\n\nPrevious conversation:\n${historyText}\n\nAssistant:`;
        }

        const aiResponse = await callAI(fullPrompt, "llama3");

        if (!aiResponse.success || !aiResponse.text) {
            return res.json({
                message: aiResponse.error || "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
                error: aiResponse.error,
                aiSource: aiResponse.source,
                success: false,
            });
        }

        let responseText = aiResponse.text;
        let extractedDestinations = [];
        let extractedNames = new Set();

        const destMatches = responseText.matchAll(/\[\[(.*?)\]\]/g);
        for (const match of destMatches) {
            if (match[1]) {
                match[1].split(",").forEach((s) => extractedNames.add(s.trim()));
            }
        }

        responseText = responseText.replace(/\[\[.*?\]\]/g, "").trim();

        const knownLocations = [
            "Pokhara",
            "Phewa Lake",
            "Mustang",
            "Upper Mustang",
            "Lumbini",
            "Everest Base Camp",
            "Annapurna Base Camp",
            "Rara Lake",
            "Chitwan National Park",
            "Bandipur",
            "Ghandruk",
            "Ilam",
            "Janaki Temple",
            "Bhaktapur",
            "Mardi Himal",
        ];

        if (extractedNames.size === 0) {
            for (const loc of knownLocations) {
                if (responseText.includes(loc)) {
                    extractedNames.add(loc);
                }
            }
        }

        for (const name of extractedNames) {
            const pattern = `%${name}%`;

            const destRes = await pool.query(
                "SELECT id, name, image, description, entry_fee as price, category, rating, 'destination' as type FROM destinations WHERE name ILIKE $1 LIMIT 1",
                [pattern]
            );

            if (destRes.rows.length > 0) {
                extractedDestinations.push(destRes.rows[0]);
            } else {
                const trekRes = await pool.query(
                    "SELECT id, name, image, description, 'Varies' as price, 'trek' as category, '4.8' as rating, 'trek' as type FROM treks WHERE name ILIKE $1 LIMIT 1",
                    [pattern]
                );
                if (trekRes.rows.length > 0) {
                    extractedDestinations.push(trekRes.rows[0]);
                }
            }
        }

        const uniqueDestinations = Array.from(new Map(extractedDestinations.map((item) => [item.id, item])).values());

        res.json({
            message: responseText,
            destinations: uniqueDestinations.slice(0, 4),
            aiSource: aiResponse.source,
            success: true,
        });
    } catch (err) {
        console.error("Chat AI error:", err.message);
        res.status(500).json({ error: "Failed to process chat" });
    }
};
