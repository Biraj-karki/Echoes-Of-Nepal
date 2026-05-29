import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const geminiModelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

let geminiTemporarilyDisabled = process.env.GEMINI_DISABLED === "true";

export const getGeminiModelName = () => geminiModelName;

export const isGeminiAvailable = () => !!geminiApiKey && !geminiTemporarilyDisabled;

export const createGeminiModel = () => {
    if (!isGeminiAvailable()) return null;
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    return genAI.getGenerativeModel({ model: geminiModelName });
};

export const isGeminiQuotaError = (error) => {
    const status = error?.status || error?.statusCode || error?.response?.status;
    const code = error?.code;
    const message = String(error?.message || "").toLowerCase();

    return (
        status === 429 ||
        code === 429 ||
        code === "RESOURCE_EXHAUSTED" ||
        message.includes("quota") ||
        message.includes("rate limit") ||
        message.includes("too many requests") ||
        message.includes("resource exhausted")
    );
};

export const disableGeminiTemporarily = (reason = "quota issue") => {
    geminiTemporarilyDisabled = true;
    console.warn(`Gemini temporarily disabled (${reason}). Falling back to database/Ollama.`);
};

export const resetGeminiDisableFlag = () => {
    geminiTemporarilyDisabled = false;
};
