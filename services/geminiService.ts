import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio, ImageSize } from "../types.ts";

// Helper to remove header from base64 if present
const cleanBase64 = (b64: string) => b64.replace(/^data:image\/\w+;base64,/, "");

const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    return new GoogleGenAI({ apiKey });
};

export const generateImage = async (
    prompt: string,
    aspectRatio: AspectRatio,
    imageSize: ImageSize
): Promise<string> => {
    const ai = getAI();
    // Using gemini-3-pro-image-preview as requested for generation
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: imageSize
            }
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    const ai = getAI();
    // Using gemini-2.5-flash-image (Nano banana) for editing
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: cleanBase64(base64Image),
                        mimeType: 'image/png', // Assuming PNG for simplicity or converted canvas
                    },
                },
                { text: prompt },
            ],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No edited image returned");
};

export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
    const ai = getAI();
    // Using gemini-3-pro-preview for analysis
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: cleanBase64(base64Image),
                        mimeType: 'image/jpeg', 
                    },
                },
                { text: prompt },
            ],
        },
    });
    
    return response.text || "No analysis available.";
};

export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Puck' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    return await audioContext.decodeAudioData(bytes.buffer);
};