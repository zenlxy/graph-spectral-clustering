/* global process */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in server/.env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
          },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            minItems: 4,
            maxItems: 4,
          },
          answer: {
            type: Type.STRING,
          },
          explanation: {
            type: Type.STRING,
          },
        },
        required: ["question", "options", "answer", "explanation"],
      },
      minItems: 4,
      maxItems: 4,
    },
  },
  required: ["questions"],
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Quiz server is running" });
});

app.post("/api/generate-quiz", async (req, res) => {
  try {
    const {
      topic = "Graph Spectral Clustering",
      graphSummary = "No graph context provided.",
    } = req.body ?? {};

    const prompt = `
You are generating quiz questions for undergraduate computing students learning graph spectral clustering.

Topic:
${topic}

Graph context:
${graphSummary}

Generate exactly 5 multiple-choice questions.

Rules:
- At least 4 out of the 5 questions must require using the graph shown on the left.
- Phrase questions in a user-facing way, such as:
  - "Based on the graph on the left..."
  - "Referring to the graph on the left..."
  - "Using the graph on the left..."
- Do NOT use phrases like "graph context" in the final questions.
- Prefer questions that require reasoning from the graph, such as:
  - degree of a specific node
  - whether two nodes are directly connected
  - how many connected components the graph has
  - how many zero eigenvalues the Laplacian should have
  - whether a specific adjacency / degree / Laplacian entry is zero or non-zero
  - which nodes are in the same connected component or cluster
  - how Lᵏ influence behaves for the current graph
- Use mathematical notation with superscripts where appropriate:
  - use Lᵏ instead of L^k
  - use L¹, L², L³, etc instead of L^1, L^2, L^3
- Avoid overly general definition questions unless needed for variety.
- Each question must have exactly 4 options.
- The answer must match one option exactly.
- Include a short explanation.
- Return only valid JSON matching the schema.
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const text = response.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned an empty response.",
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed to parse Gemini JSON:", text);
      return res.status(500).json({
        error: "Gemini response was not valid JSON.",
      });
    }

    if (!data.questions || !Array.isArray(data.questions)) {
      return res.status(500).json({
        error: "Gemini response did not contain a valid questions array.",
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Quiz generation failed:", error);

    res.status(500).json({
      error: "Failed to generate quiz.",
      details: error?.message || "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Quiz server running on port ${PORT}`);
});