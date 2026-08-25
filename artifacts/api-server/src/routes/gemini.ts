import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface AnimalWildlifeData {
  scientificName?: string;
  weight?: string;
  speed?: string;
  height?: string;
  length?: string;
  conservationStatus?: string;
  population?: string;
  family?: string;
  taxonomicClass?: string;
  order?: string;
  behaviour?: string[];
  humanBehaviour?: string[];
  distribution?: string[];
  threats?: string[];
  funFacts?: string[];
}

/**
 * POST /api/wildlife/generate
 * Body: { animalName, category, habitat, diet, lifespan, region }
 * Returns: structured wildlife data from Gemini
 */
router.post("/wildlife/generate", async (req: Request, res: Response) => {
  if (!GEMINI_API_KEY) {
    res.status(503).json({ error: "Gemini API key not configured" });
    return;
  }

  const { animalName, category, habitat, diet, lifespan, region } = req.body as {
    animalName?: string;
    category?: string;
    habitat?: string;
    diet?: string;
    lifespan?: string;
    region?: string;
  };

  if (!animalName) {
    res.status(400).json({ error: "animalName is required" });
    return;
  }

  const prompt = `You are a wildlife biologist. Provide accurate, factual wildlife data for the ${category || "animal"} known as "${animalName}".
Known info: habitat=${habitat || "unknown"}, diet=${diet || "unknown"}, lifespan=${lifespan || "unknown"}, region=${region || "unknown"}.

Return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "scientificName": "Genus species",
  "weight": "e.g. 150–250 kg (male), 100–180 kg (female)",
  "speed": "e.g. 60 km/h (sprint)",
  "height": "e.g. 1.2 m at shoulder",
  "length": "e.g. 2.4–3.1 m body length",
  "conservationStatus": "one of: Least Concern, Near Threatened, Vulnerable, Endangered, Critically Endangered, Extinct in the Wild, Extinct, Data Deficient",
  "population": "e.g. ~25,000 (estimated)",
  "family": "e.g. Felidae",
  "taxonomicClass": "e.g. Mammalia",
  "order": "e.g. Carnivora",
  "behaviour": ["2–5 short behaviour descriptors, e.g. Solitary, Nocturnal, Territorial"],
  "humanBehaviour": ["1–3 descriptors, e.g. Dangerous, Usually avoids humans"],
  "distribution": ["2–6 geographic regions, e.g. Sub-Saharan Africa, South Asia"],
  "threats": ["3–5 main threats, e.g. Habitat loss, Poaching, Climate change"],
  "funFacts": ["3–5 interesting facts about this animal, each 1–2 sentences"]
}

Rules:
- Use real, scientifically accurate data only.
- If the animal is a tree or plant (category=Nature or Trees), set taxonomicClass to "Plantae" and adjust fields accordingly.
- For aquatic invertebrates, set taxonomicClass accordingly (e.g. "Cephalopoda").
- If a field is truly unknown for this species, use null.
- Always return valid JSON.`;

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      req.log.error({ status: geminiRes.status, err }, "Gemini API error");
      res.status(502).json({ error: "Gemini API request failed", detail: err });
      return;
    }

    const geminiData = await geminiRes.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let parsed: AnimalWildlifeData;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      req.log.error({ rawText }, "Failed to parse Gemini JSON response");
      res.status(502).json({ error: "Could not parse Gemini response as JSON", raw: rawText });
      return;
    }

    res.json({ data: parsed });
  } catch (error) {
    req.log.error({ err: error }, "Error calling Gemini API");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/wildlife/generate-batch
 * Body: { animals: [{ id, animalName, category, habitat, diet, lifespan, region }] }
 * Returns: { results: [{ id, data }] }
 */
router.post("/wildlife/generate-batch", async (req: Request, res: Response) => {
  if (!GEMINI_API_KEY) {
    res.status(503).json({ error: "Gemini API key not configured" });
    return;
  }

  const { animals } = req.body as {
    animals?: Array<{
      id: number;
      animalName: string;
      category?: string;
      habitat?: string;
      diet?: string;
      lifespan?: string;
      region?: string;
    }>;
  };

  if (!animals || !Array.isArray(animals) || animals.length === 0) {
    res.status(400).json({ error: "animals array is required" });
    return;
  }

  if (animals.length > 20) {
    res.status(400).json({ error: "Maximum 20 animals per batch" });
    return;
  }

  const animalList = animals
    .map((a) => `- ID ${a.id}: "${a.animalName}" (${a.category || "unknown"}, habitat: ${a.habitat || "?"}, diet: ${a.diet || "?"})`)
    .join("\n");

  const prompt = `You are a wildlife biologist. Provide accurate, factual wildlife data for each of these animals.

Animals:
${animalList}

Return ONLY a valid JSON array (no markdown, no explanation) where each element corresponds to one animal in order:
[
  {
    "id": <same id as input>,
    "scientificName": "Genus species",
    "weight": "e.g. 150–250 kg",
    "speed": "e.g. 60 km/h (sprint)",
    "height": "e.g. 1.2 m",
    "length": "e.g. 2.4–3.1 m",
    "conservationStatus": "one of: Least Concern, Near Threatened, Vulnerable, Endangered, Critically Endangered, Extinct in the Wild, Extinct, Data Deficient",
    "population": "e.g. ~25,000 estimated",
    "family": "e.g. Felidae",
    "taxonomicClass": "e.g. Mammalia",
    "order": "e.g. Carnivora",
    "behaviour": ["2–4 short descriptors"],
    "humanBehaviour": ["1–3 descriptors"],
    "distribution": ["2–5 geographic regions"],
    "threats": ["2–4 main threats"],
    "funFacts": ["2–3 interesting facts, each 1 sentence"]
  }
]

Rules:
- Use scientifically accurate data only.
- For plants/trees set taxonomicClass to "Plantae".
- Use null for truly unknown fields.
- Always return valid JSON array with exactly ${animals.length} elements.`;

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      res.status(502).json({ error: "Gemini API request failed", detail: err });
      return;
    }

    const geminiData = await geminiRes.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let parsed: Array<{ id: number } & AnimalWildlifeData>;
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
    } catch {
      res.status(502).json({ error: "Could not parse Gemini response as JSON array", raw: rawText });
      return;
    }

    res.json({ results: parsed });
  } catch (error) {
    req.log.error({ err: error }, "Error in batch generate");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
