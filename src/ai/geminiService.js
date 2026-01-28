import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config.js";

/**
 * Service to handle all interactions with Google Gemini API.
 */
export class GeminiService {
    constructor() {
        if (!GEMINI_API_KEY) {
            console.warn("Gemini Service: No API Key found in config.");
        }
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    /**
     * Generates a 3D context-aware explanation for a specific part.
     * @param {string} meshName - The name of the clicked part
     * @param {string} parentModelName - Context of the full model
     * @param {string} [imageBase64] - Optional base64 screenshot of the current view
     * @returns {Promise<string>} The explanation text.
     */
    async explainMesh(meshName, parentModelName, imageBase64 = null) {
        console.log(`🤖 Gemini thinking about: ${meshName} in ${parentModelName}...`);

        const prompt = `
            You are an expert 3D Tutor.
            The user is looking at a 3D model of: "${parentModelName}".
            The user just clicked on a specific sub-part named: "${meshName}".
            
            ${imageBase64 ? "I have attached a screenshot of what the user is currently looking at. Use this visual context to identify the part more accurately." : ""}

            Task:
            1. Identify what this part ("${meshName}") is in the context of a ${parentModelName}.
            2. Explain its function concisely (max 2 sentences).
            3. Use a friendly, educational tone.
            4. If the part name is generic (like "Object_4"), rely heavily on the visual context to guess what it is.
        `;

        // Prepare parts for the model
        const parts = [{ text: prompt }];
        if (imageBase64) {
            // Remove header if present (e.g., "data:image/jpeg;base64,")
            const base64Data = imageBase64.split(',')[1] || imageBase64;
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data
                }
            });
        }

        const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of modelsToTry) {
            try {
                console.log(`🔄 Attempting to generate with model: ${modelName}`);
                const modelInstance = this.genAI.getGenerativeModel({ model: modelName });

                const result = await modelInstance.generateContent(parts);
                const response = await result.response;
                return response.text();
            } catch (error) {
                console.warn(`⚠️ Failed with ${modelName}:`, error);

                // Fallback: Try without image if image was present (maybe payload too large?)
                if (imageBase64 && modelName === modelsToTry[0]) {
                    console.log("⚠️ Retrying without image...");
                    try {
                        const result = await modelInstance.generateContent(prompt);
                        const response = await result.response;
                        return response.text();
                    } catch (retryError) {
                        console.warn("⚠️ Text-only retry also failed:", retryError);
                    }
                }
            }
        }

        console.error("❌ All models failed.");
        return `I'm having trouble connecting. Details: ${modelsToTry.join(', ')} failed. Check console for exact errors.`;
    }
}
