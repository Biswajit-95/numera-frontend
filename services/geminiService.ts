
// import { GoogleGenAI, Type } from "@google/genai";
// import { UserInput, NumerologyData, ReportType, PageContent } from "../types";

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

// export const generateReportContent = async (
//   input: UserInput,
//   data: NumerologyData
// ): Promise<{ pages: PageContent[], glossary: PageContent }> => {
//   const model = "gemini-3-pro-preview";
  
//   const isDeep = input.reportType === ReportType.FOURTEEN_PAGE;
//   const numPages = isDeep ? 14 : 7;

//   const prompt = `
//     You are a professional numerologist and career consultant with 15+ years of experience.
//     Generate a ${input.reportType} premium career numerology report for:
//     Name: ${input.fullName}
//     DOB: ${input.dob}
//     Calculated Life Path: ${data.lifePath}
//     Calculated Personal Year: ${data.personalYear}
//     Calculated Expression: ${data.expression}
//     Calculated Soul Urge: ${data.soulUrge}

//     Tone: Strategic, minimalist, authoritative, and focused on business/career logic.
//     Language: Simple, professional, accessible terminology.

//     Required Main Pages in sequence:
//     ${isDeep ? 
//       "Deep Life Path Analysis, Core Identity & Strengths, Primary Career Directions, Business Ownership vs Job Growth, Financial Blueprint, Current Personal Year Cycle, Professional Expression, Core Motivation, Networking & People Management, Managing Career Delays, Major Growth Milestones, Best Strategy for Next 2 Years, Scaling Your Career, 5-Year Master Strategy" : 
//       "Career Personality Overview, Business & Job Suitability, Core Professional Strengths, Money & Financial Behavior, Current Year Growth Path, Overcoming Career Blocks, Strategic 5-Step Action Plan"
//     }

//     ALSO, generate a separate "Numerology Fundamentals" page that explains the core numbers (Life Path, Expression, Soul Urge, Personal Year) in simple, professional terms for a non-expert.

//     Return the result as a JSON object with two keys: "pages" (array of ${numPages} items) and "glossary" (a single PageContent object).
//     Each PageContent item must have:
//     - title: Simple page title
//     - headline: Strong business-focused summary headline
//     - paragraphs: 3 to 6 insightful paragraphs
//     - accentNote: A single refined strategic takeaway
//     - numberDisplay: The core number relevant to this page (if applicable)
//   `;

//   const response = await ai.models.generateContent({
//     model,
//     contents: prompt,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.OBJECT,
//         properties: {
//           pages: {
//             type: Type.ARRAY,
//             items: {
//               type: Type.OBJECT,
//               properties: {
//                 title: { type: Type.STRING },
//                 headline: { type: Type.STRING },
//                 paragraphs: { 
//                   type: Type.ARRAY,
//                   items: { type: Type.STRING }
//                 },
//                 accentNote: { type: Type.STRING },
//                 numberDisplay: { type: Type.STRING }
//               },
//               required: ["title", "headline", "paragraphs"]
//             }
//           },
//           glossary: {
//             type: Type.OBJECT,
//             properties: {
//               title: { type: Type.STRING },
//               headline: { type: Type.STRING },
//               paragraphs: { 
//                 type: Type.ARRAY,
//                 items: { type: Type.STRING }
//               },
//               accentNote: { type: Type.STRING }
//             },
//             required: ["title", "headline", "paragraphs"]
//           }
//         },
//         required: ["pages", "glossary"]
//       }
//     }
//   });

//   try {
//     const text = response.text || "{}";
//     return JSON.parse(text);
//   } catch (e) {
//     console.error("Failed to parse Gemini response", e);
//     throw new Error("Failed to generate report content");
//   }
// };


import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, NumerologyData, ReportType, PageContent } from "../types";

// Use Vite environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API key missing. Check .env or Vercel settings.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || ""
});

export const generateReportContent = async (
  input: UserInput,
  data: NumerologyData
): Promise<{ pages: PageContent[]; glossary: PageContent }> => {

  const model = "gemini-3-pro-preview";
  const isDeep = input.reportType === ReportType.FOURTEEN_PAGE;
  const numPages = isDeep ? 14 : 7;

  const prompt = `
You are a professional numerologist and career consultant with 15+ years of experience.

Generate a ${input.reportType} premium career numerology report for:
Name: ${input.fullName}
DOB: ${input.dob}

Calculated Life Path: ${data.lifePath}
Calculated Personal Year: ${data.personalYear}
Calculated Expression: ${data.expression}
Calculated Soul Urge: ${data.soulUrge}

Tone: Strategic, minimalist, authoritative, and focused on business/career logic.
Language: Simple, professional, accessible terminology.

Required Main Pages:
${isDeep 
  ? "Deep Life Path Analysis, Core Identity & Strengths, Primary Career Directions, Business Ownership vs Job Growth, Financial Blueprint, Current Personal Year Cycle, Professional Expression, Core Motivation, Networking & People Management, Managing Career Delays, Major Growth Milestones, Best Strategy for Next 2 Years, Scaling Your Career, 5-Year Master Strategy"
  : "Career Personality Overview, Business & Job Suitability, Core Professional Strengths, Money & Financial Behavior, Current Year Growth Path, Overcoming Career Blocks, Strategic 5-Step Action Plan"
}

Also generate a separate "Numerology Fundamentals" page explaining Life Path, Expression, Soul Urge, Personal Year.

Return JSON with:
{
  "pages": [...],
  "glossary": {...}
}
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                headline: { type: Type.STRING },
                paragraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                accentNote: { type: Type.STRING },
                numberDisplay: { type: Type.STRING }
              },
              required: ["title", "headline", "paragraphs"]
            }
          },
          glossary: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              headline: { type: Type.STRING },
              paragraphs: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              accentNote: { type: Type.STRING }
            },
            required: ["title", "headline", "paragraphs"]
          }
        },
        required: ["pages", "glossary"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate report content");
  }
};
