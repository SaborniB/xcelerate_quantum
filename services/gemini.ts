import { GoogleGenAI } from "@google/genai";

// Lazy initialization to prevent crash on import if API key is missing
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    const key = process.env.API_KEY;
    // Initialize even with empty key to allow app to load; specific calls will fail gracefully later
    aiInstance = new GoogleGenAI({ apiKey: key || '' });
  }
  return aiInstance;
};

export interface AuditResult {
  score: number;
  analysis: string;
  factors: {
    name: string;
    impact: number; // 0-1 scale
    reason: string;
  }[];
}

export const auditJobPost = async (
  title: string,
  company: string,
  requirements: string,
  location: string,
  employmentType: string,
  industry: string
): Promise<AuditResult> => {
  
  const modelName = 'gemini-2.5-flash'; // Using the recommended flash model for speed/cost efficiency
  const ai = getAI();

  const prompt = `
    You are an expert HR auditor and AI risk analyst. Analyze the following job posting to determine if it is a "Ghost Job" (a fake, stale, or compliance-only listing with no intent to hire).
    
    JOB DETAILS:
    Title: ${title}
    Company: ${company}
    Location: ${location}
    Type: ${employmentType}
    Industry: ${industry}
    Content: ${requirements}

    TASK:
    Return a JSON object with the following structure:
    {
      "score": <number between 0.00 and 1.00, where 1.00 is extremely high risk of being a ghost job>,
      "analysis": "<short summary of why it received this score, max 2 sentences>",
      "factors": [
        {
          "name": "<Name of risk factor, e.g., 'Vague Responsibilities', 'No Salary', 'Stale Keywords'>",
          "impact": <number 0.00-1.00 representing contribution to the score>,
          "reason": "<brief explanation>"
        }
      ]
    }
    
    Strictly return valid JSON.
  `;

  try {
    // Check if API key is actually available before calling
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please configure process.env.API_KEY.");
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4, // Lower temperature for more analytical/consistent results
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AuditResult;
    
    // Sanity check the score
    if (typeof result.score !== 'number') {
      result.score = 0.5; // Fallback
    }

    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};