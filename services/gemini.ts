import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  
  const model = 'gemini-2.5-flash'; // Using the recommended flash model for speed/cost efficiency

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
    const response = await ai.models.generateContent({
      model: model,
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