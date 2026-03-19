import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { XMLParser } from "fast-xml-parser";
import { rateLimit } from "express-rate-limit";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Muitas requisições. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", nodeEnv: process.env.NODE_ENV });
});

// Cache da adega (persiste na memória enquanto a instância viver)
let cachedWines: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora
const WINE_FEED_URL =
  "https://feeds.app.bagypro.com/33560/qQUsulhJnmvLPRYJn2p2elIS2mTmHnM7ssxB";

app.get("/api/wines", async (_req, res) => {
  try {
    if (cachedWines.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
      res.json(cachedWines);
      return;
    }

    const response = await fetch(WINE_FEED_URL);
    if (!response.ok) throw new Error("Falha ao buscar XML da adega");
    const xmlText = await response.text();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const result = parser.parse(xmlText);

    const items = result.rss?.channel?.item || [];
    const wines = (Array.isArray(items) ? items : [items])
      .map((item: any) => ({
        id: String(item["g:id"]),
        title: item.title,
        description: item.description,
        link: item.link,
        image_link: item["g:image_link"],
        price: String(item["g:price"]),
        sale_price: item["g:sale_price"] ? String(item["g:sale_price"]) : undefined,
        brand: item["g:brand"],
      }))
      .filter((w: any) => w.id && w.title);

    cachedWines = wines;
    lastFetchTime = Date.now();
    res.json(cachedWines);
  } catch (error) {
    console.error("Erro na rota /api/wines:", error);
    res.status(500).json({ error: "Erro ao buscar vinhos" });
  }
});

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) console.warn("GEMINI_API_KEY não definida.");
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

app.post("/api/pairings", async (req, res) => {
  try {
    const { dish, excludedWineIds = [] } = req.body;
    if (!dish) { res.status(400).json({ error: "Prato não informado." }); return; }

    const cleanDish = String(dish).replace(/[<>{}[\]\\]/g, "").slice(0, 200);

    if (cachedWines.length === 0) {
      res.status(500).json({ error: "Adega não carregada ainda. Tente novamente." });
      return;
    }

    const ai = getAI();
    const wineListForPrompt = cachedWines
      .filter((w: any) => !excludedWineIds?.includes(w.id))
      .map((w: any) => ({ wineId: w.id, title: w.title, description: w.description }))
      .slice(0, 150);

    const systemInstruction = `Você é um Sommelier de IA especializado em gastronomia.
REGRAS:
1. Retorne EXATAMENTE 3 sugestões de harmonização (estilos diferentes).
2. Para CADA sugestão, forneça em 'dishDescription' uma descrição BREVE e CRIATIVA do prato.
3. Para CADA sugestão, selecione EXATAMENTE 4 vinhos da lista fornecida.
4. Use APENAS os IDs de vinhos da lista.
5. Retorne JSON válido.`;

    const prompt = `Analise e sugira 3 harmonizações para o prato: "${cleanDish}".
Lista de vinhos: ${JSON.stringify(wineListForPrompt)}`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              wineIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              dishDescription: { type: Type.STRING },
              recommendedWineType: { type: Type.STRING },
              recommendedGrape: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["wineIds", "dishDescription", "recommendedWineType", "recommendedGrape", "reasoning"],
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error) {
    console.error("Erro na rota /api/pairings:", error);
    res.status(500).json({ error: "Ocorreu um erro ao buscar harmonizações." });
  }
});

const CATEGORY_CACHE: Record<string, string> = {};

const FOOD_LIBRARY: Record<string, string[]> = {
  meat: [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800",
    "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=800",
    "https://images.unsplash.com/photo-1529692236671-61f9ad78a621?q=80&w=800",
  ],
  pasta: [
    "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800",
    "https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=800",
    "https://images.unsplash.com/photo-1484156811273-e615b5b7ca15?q=80&w=800",
  ],
  sushi: [
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800",
    "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=800",
    "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800",
    "https://images.unsplash.com/photo-1563612116625-3012372fccbc?q=80&w=800",
  ],
  seafood: [
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
    "https://images.unsplash.com/photo-1534080564607-31726bd7432b?q=80&w=800",
    "https://images.unsplash.com/photo-1534604973900-c41ab4c5e636?q=80&w=800",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800",
  ],
  salad: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800",
    "https://images.unsplash.com/photo-1546793665-c74683c3f38d?q=80&w=800",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800",
  ],
  dessert: [
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800",
  ],
  default: [
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800",
    "https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7df?q=80&w=800",
    "https://images.unsplash.com/photo-1474722883353-2309adad3c0c?q=80&w=800",
  ],
};

app.post("/api/images", async (req, res) => {
  try {
    const { dishName } = req.body;
    let category = "default";
    const normalizedDish = dishName.toLowerCase();

    if (normalizedDish.includes("sushi") || normalizedDish.includes("sashimi")) {
      category = "sushi";
    } else if (["peixe", "fish", "frutos do mar", "camarão", "salmão", "bacalhau"].some(k => normalizedDish.includes(k))) {
      category = "seafood";
    } else if (["pasta", "massa", "pesto", "lasanha"].some(k => normalizedDish.includes(k))) {
      category = "pasta";
    } else if (["carne", "picanha", "bife", "steak", "hambúrguer"].some(k => normalizedDish.includes(k))) {
      category = "meat";
    } else if (["salada", "folhas"].some(k => normalizedDish.includes(k))) {
      category = "salad";
    } else if (["doce", "sobremesa", "chocolate"].some(k => normalizedDish.includes(k))) {
      category = "dessert";
    } else if (CATEGORY_CACHE[normalizedDish]) {
      category = CATEGORY_CACHE[normalizedDish];
    } else {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: `Analyze "${dishName}" and categorize it. Categories: meat, pasta, sushi, seafood, salad, dessert. Return only the word.`,
        });
        const aiCategory = response.text.trim().toLowerCase();
        if (FOOD_LIBRARY[aiCategory]) {
          category = aiCategory;
          CATEGORY_CACHE[normalizedDish] = category;
        }
      } catch {
        console.warn("Falha na categorização AI.");
      }
    }

    const pool = FOOD_LIBRARY[category];
    const charSum = dishName.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const resultImages: string[] = [];

    for (let i = 0; i < 3; i++) {
      const url = pool[(charSum + i) % pool.length] + "?auto=format&fit=crop&q=80";
      if (!resultImages.includes(url)) resultImages.push(url);
    }

    for (const img of pool) {
      if (resultImages.length >= 3) break;
      const url = img + "?auto=format&fit=crop&q=80";
      if (!resultImages.includes(url)) resultImages.push(url);
    }

    res.json(resultImages);
  } catch (error) {
    console.error("Erro na rota /api/images:", error);
    res.json([
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800",
    ]);
  }
});

export default app;
