import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function run() {
  try {
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("Gemini OK:", response.text());
  } catch (err) {
    console.error("Gemini Failed:", err.message);
  }
}

run();
