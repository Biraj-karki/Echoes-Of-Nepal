import ollama from "ollama";
import pool from "../config/db.js";
import {
    createGeminiModel,
    disableGeminiTemporarily,
    getGeminiModelName,
    isGeminiQuotaError,
} from "../utils/gemini.js";

const model = createGeminiModel();

export const getAiRecommendations = async (req, res) => {
    const { location, budget, interest } = req.body;

    try {
        const trekKeywords = [
            "trek",
            "trekking",
            "hike",
            "hiking",
            "trail",
            "climb",
            "climbing",
            "adventure",
            "base camp",
            "mountain",
        ];
        const interestLower = (interest || "").toLowerCase();
        const isTrekFocused = trekKeywords.some((kw) => interestLower.includes(kw));

        let prompt;
        if (isTrekFocused) {
            prompt = `Recommend 5 specific TREKKING ROUTES or HIKING TRAILS in Nepal based on:
Location: ${location || "Anywhere in Nepal"}
Budget: ${budget || "Mixed"}
Interests: ${interest || "Trekking"}

IMPORTANT: Return only trek/trail names like "Everest Base Camp", "Annapurna Circuit", "Langtang Valley Trek", "Mardi Himal Trek".
Do NOT return city names or general destinations like "Pokhara" or "Kathmandu".
Return ONLY a raw JSON array of 5 strings. No markdown, no backticks, no extra text.
Example: ["Everest Base Camp", "Annapurna Base Camp", "Langtang Valley Trek", "Mardi Himal Trek", "Manaslu Circuit Trek"]`;
        } else {
            prompt = `Recommend 5 specific travel destinations or places to visit in Nepal based on:
Location: ${location || "Anywhere in Nepal"}
Budget: ${budget || "Mixed"}
Interests: ${interest || "Nature, Culture"}

Return specific place names like "Phewa Lake", "Chitwan National Park", "Lumbini Sacred Garden", "Bhaktapur Durbar Square".
Return ONLY a raw JSON array of 5 strings. No markdown, no backticks, no extra text.
Example: ["Phewa Lake", "Lumbini", "Chitwan National Park", "Rara Lake", "Bandipur"]`;
        }

        let recommendedNames = [];
        let aiSource = "database-fallback";

        try {
            try {
                const ollamaResponse = await ollama.generate({
                    model: "mistral",
                    prompt,
                    stream: false,
                });

                const cleanText = ollamaResponse.response.trim().replace(/```json/g, "").replace(/```/g, "").trim();
                recommendedNames = JSON.parse(cleanText);
                aiSource = "ollama";
                console.log("AI recommendations from Ollama");
            } catch (ollamaError) {
                console.log("Ollama unavailable, trying Gemini:", ollamaError.message);

                try {
                    if (!model) {
                        console.log("Gemini unavailable, using database fallback");
                        throw new Error("Gemini not configured or disabled");
                    }

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const cleanText = response.text().trim().replace(/```json/g, "").replace(/```/g, "").trim();
                    recommendedNames = JSON.parse(cleanText);
                    aiSource = "gemini";
                    console.log(`AI recommendations from Gemini (${getGeminiModelName()})`);
                } catch (geminiError) {
                    if (isGeminiQuotaError(geminiError)) {
                        disableGeminiTemporarily("quota/rate limit");
                    }
                    console.log("Both Ollama and Gemini failed, using database:", geminiError.message);
                    recommendedNames = [];
                    aiSource = "database-fallback";
                }
            }
        } catch (err) {
            console.error("AI layer error:", err.message);
            recommendedNames = [];
            aiSource = "database-fallback";
        }

        const results = [];
        for (const name of recommendedNames) {
            const pattern = `%${name}%`;

            if (isTrekFocused) {
                const trekRes = await pool.query(
                    "SELECT id, name, image, description, 'Varies' as price, 'trek' as type FROM treks WHERE name ILIKE $1 LIMIT 1",
                    [pattern]
                );
                if (trekRes.rows.length > 0) {
                    results.push(trekRes.rows[0]);
                    continue;
                }

                const destRes = await pool.query(
                    "SELECT id, name, image, description, entry_fee as price, 'destination' as type FROM destinations WHERE name ILIKE $1 LIMIT 1",
                    [pattern]
                );
                if (destRes.rows.length > 0) {
                    results.push(destRes.rows[0]);
                }
            } else {
                const destRes = await pool.query(
                    "SELECT id, name, image, description, entry_fee as price, 'destination' as type FROM destinations WHERE name ILIKE $1 LIMIT 1",
                    [pattern]
                );
                if (destRes.rows.length > 0) {
                    results.push(destRes.rows[0]);
                    continue;
                }

                const trekRes = await pool.query(
                    "SELECT id, name, image, description, 'Varies' as price, 'trek' as type FROM treks WHERE name ILIKE $1 LIMIT 1",
                    [pattern]
                );
                if (trekRes.rows.length > 0) {
                    results.push(trekRes.rows[0]);
                }
            }
        }

        if (results.length === 0) {
            const fallbackRes = isTrekFocused
                ? await pool.query("SELECT id, name, image, description, 'Varies' as price, 'trek' as type FROM treks WHERE featured = true LIMIT 5")
                : await pool.query(`
                    (SELECT id, name, image, description, entry_fee as price, 'destination' as type FROM destinations WHERE featured = true LIMIT 3)
                    UNION ALL
                    (SELECT id, name, image, description, 'Varies' as price, 'trek' as type FROM treks WHERE featured = true LIMIT 2)
                    LIMIT 5
                `);

            return res.json({
                recommendations: fallbackRes.rows,
                source: aiSource,
                message: aiSource === "database-fallback" ? "Using featured destinations" : "AI recommendations",
            });
        }

        res.json({
            recommendations: results,
            source: aiSource,
            message:
                aiSource === "ollama"
                    ? "Powered by Ollama"
                    : aiSource === "gemini"
                        ? `Powered by Google Gemini (${getGeminiModelName()})`
                        : "From database",
        });
    } catch (err) {
        console.error("Recommendation Error:", err);
        res.status(500).json({ error: "Failed to get recommendations" });
    }
};
