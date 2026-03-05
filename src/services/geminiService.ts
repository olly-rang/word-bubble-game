import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Theme } from "../types";

// Note: In a real production environment, never expose your API key in client-side code.
// For this prototype, we use a placeholder or check for environment variables.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function generateHealingQuote(theme: Theme): Promise<string> {
    if (!genAI) {
        // Fallback quotes if no API key is provided
        const fallbacks = {
            sunny: "오늘의 햇살처럼 당신의 마음도 밝게 빛나길.",
            rainy: "빗소리에 걱정을 씻어내고 평온함만 담으세요.",
            night: "고요한 밤, 당신의 꿈도 아름답게 피어나길."
        };
        return fallbacks[theme] || "숨을 깊게 들이마시고, 내뱉으세요.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a "Zen Master" providing a short, healing Korean quote (max 15 words) for a user in a "Digital Spa" app. 
        The current theme is "${theme}". 
        Make it poetic, calming, and relevant to the theme. 
        Only return the Korean text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini generation failed:", error);
        return "당신의 존재만으로도 충분히 아름답습니다.";
    }
}

export async function generateWordContext(word: string): Promise<string> {
    if (!genAI) return word;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Provide a very short (1 sentence) poetic usage of the Korean word "${word}" in Korean.`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (e) {
        return word;
    }
}
