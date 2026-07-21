import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type { InitProgressReport } from "@mlc-ai/web-llm";
import { PROMPTS } from "./gemini";
import type { SummaryType, PatientMetadata } from "./gemini";

// Selected model for WebLLM: Llama-3.2-1B-Instruct is very lightweight and performant
export const WEBLLM_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let globalEngine: MLCEngine | null = null;
let isLoading = false;

export interface WebLLMInitCallback {
  (report: InitProgressReport): void;
}

/**
 * Initializes the local WebLLM engine with progress feedback.
 * Caches the engine instance to avoid redundant downloads or setups.
 */
export async function initLocalEngine(
  onProgress?: WebLLMInitCallback
): Promise<MLCEngine> {
  if (globalEngine) {
    // If already loaded, trigger progress 100% manually to let caller know it's ready
    if (onProgress) {
      onProgress({
        progress: 1,
        text: "Model already loaded and ready",
        timeElapsed: 0,
      });
    }
    return globalEngine;
  }

  if (isLoading) {
    throw new Error("WebLLM engine is already initializing. Please wait.");
  }

  // Pre-check for WebGPU API availability
  if (typeof navigator !== "undefined" && !("gpu" in navigator)) {
    throw new Error(
      "WebGPU is not supported or enabled in your browser. WebLLM requires WebGPU to run local AI models. Please use Google Chrome 113+ or Microsoft Edge 113+ with Hardware Acceleration enabled."
    );
  }

  isLoading = true;
  try {
    const engine = await CreateMLCEngine(WEBLLM_MODEL, {
      initProgressCallback: (report) => {
        if (onProgress) {
          onProgress(report);
        }
      },
    });
    globalEngine = engine;
    return engine;
  } catch (error: any) {
    console.error("Failed to initialize WebLLM engine:", error);
    const msg = error?.message || String(error);
    if (msg.includes("Cache.add") || msg.includes("network error") || msg.includes("Failed to fetch")) {
      throw new Error(
        "Failed to download AI model weights from network. Please verify your internet connection, make sure Hugging Face (huggingface.co) is accessible, and click 'Reset local AI Cache' below to retry."
      );
    }
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * Checks if the local engine is initialized.
 */
export function isLocalEngineReady(): boolean {
  return globalEngine !== null;
}

/**
 * Generates clinical summary locally using Llama-3.2-1B in the browser.
 */
export async function generateLocalClinicalSummary(
  transcript: string,
  summaryType: SummaryType,
  patientDetails?: PatientMetadata
): Promise<string> {
  if (!globalEngine) {
    throw new Error("Local AI model is not loaded. Please initialize the engine first.");
  }

  // Construct patient metadata header
  let patientHeader = "";
  if (patientDetails) {
    const { name, age, gender, date } = patientDetails;
    const details = [];
    if (name) details.push(`**Patient Name**: ${name}`);
    if (age) details.push(`**Age/DOB**: ${age}`);
    if (gender) details.push(`**Gender**: ${gender}`);
    if (date) details.push(`**Date of Visit**: ${date}`);
    
    if (details.length > 0) {
      patientHeader = `### Patient & Visit Details\n${details.join(" | ")}\n\n---\n\n`;
    }
  }

  const promptTemplate = PROMPTS[summaryType];
  const patientContext = patientDetails
    ? `Patient Context:\n- Name: ${patientDetails.name || "N/A"}\n- Age: ${patientDetails.age || "N/A"}\n- Gender: ${patientDetails.gender || "N/A"}\n- Date: ${patientDetails.date || "N/A"}\n\n`
    : "";

  const systemMessage = "You are a helpful, professional clinical AI assistant that generates medical summaries.";
  const userPrompt = `${promptTemplate}\n\n${patientContext}Transcript:\n${transcript}`;

  const response = await globalEngine.chat.completions.create({
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response returned from Local AI engine.");
  }

  return patientHeader + content;
}

/**
 * Clears the local Cache Storage used by WebLLM to resolve download corruption/network errors.
 */
export async function clearLocalCache(): Promise<void> {
  globalEngine = null;
  if (typeof caches !== "undefined") {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        if (key.includes("webllm")) {
          await caches.delete(key);
        }
      }
      console.log("WebLLM local cache cleared successfully.");
    } catch (e) {
      console.error("Failed to clear local cache:", e);
      throw new Error("Failed to clear browser cache. Please clear your site data in DevTools.");
    }
  }
}
