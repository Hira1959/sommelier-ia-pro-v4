import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { XMLParser } from "fast-xml-parser";
import { rateLimit } from "express-rate-limit";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate Limiter: 100 requisições por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Muitas requisições. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Rota de teste para verificar se o servidor está vivo
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor Sommelier está ativo",
    nodeEnv: process.env.NODE_ENV
  });
});

// Middleware de Log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Cache da adega
let cachedWines: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora
const WINE_FEED_URL = 'https://feeds.app.bagypro.com/33560/qQUsulhJnmvLPRYJn2p2elIS2mTmHnM7ssxB';

app.get("/api/wines", async (req, res) => {
  try {
    if (cachedWines.length > 0 && (Date.now() - lastFetchTime) < CACHE_DURATION) {
      res.json(cachedWines);
      return;
    }

    const response = await fetch(WINE_FEED_URL);
    if (!response.ok) throw new Error("Falha ao buscar XML da adega");
    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const result = parser.parse(xmlText);

    const items = result.rss?.channel?.item || [];
    const wines = (Array.isArray(items) ? items : [items]).map((item: any) => ({
      id: String(item['g:id']),
      title: item.title,
      description: item.description,
      link: item.link,
      image_link: item['g:image_link'],
      price: String(item['g:price']),
      sale_price: item['g:sale_price'] ? String(item['g:sale_price']) : undefined,
      brand: item['g:brand']
    })).filter((w: any) => w.id && w.title);

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
  if (!apiKey) {
    console.warn("Nenhuma GEMINI_API_KEY no .env, requisições falharão.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

app.post("/api/pairings", async (req, res) => {
  try {
    const { dish, excludedWineIds = [] } = req.body;
    if (!dish) return res.status(400).json({ error: "Prato não informado." });

    // Higienização de input para evitar Prompt Injection básico
    const cleanDish = String(dish)
      .replace(/[<>{}[]\\]/g, "") // Remove caracteres de estruturação
      .slice(0, 200); // Limita o tamanho do prato

    if (cachedWines.length === 0) {
      return res.status(500).json({ error: "Adega não carregada ainda. Tente novamente." });
    }

    const ai = getAI();
    const wineListForPrompt = cachedWines
      .filter((w: any) => !excludedWineIds?.includes(w.id))
      .map((w: any) => ({
        wineId: w.id,
        title: w.title,
        description: w.description
      })).slice(0, 150);

    const systemInstruction = `Você é um Sommelier de IA especializado em gastronomia.
Sugerir harmonizações perfeitas.
REGRAS:
1. Retorne EXATAMENTE 3 sugestões de harmonização (estilos diferentes).
2. Para CADA uma das 3 sugestões, selecione EXATAMENTE 4 vinhos da lista fornecida.
3. Use APENAS os IDs de vinhos da lista.
4. Retorne JSON válido.`;

    const prompt = `Analise e sugira 3 harmonizações diferentes para o prato: "${cleanDish}".
 Para cada harmonização, escolha 4 vinhos da lista.
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
              wineIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs de vinhos" },
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
  } catch (error: any) {
    console.error("Erro na rota /api/pairings:", error);
    res.status(500).json({ error: "Ocorreu um erro ao buscar harmonizações." });
  }
});

const PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop'
];

app.post("/api/images", async (req, res) => {
  try {
    const { dishName, count = 3 } = req.body;
    const ai = getAI();
    const prompt = `Professional food photography of '${dishName}', gourmet plating, high-end restaurant style, dramatic lighting, 4k.`;

    const imagePromises = Array.from({ length: count }).map(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } } as any,
      })
    );

    const results = await Promise.allSettled(imagePromises);
    const images = results.map(result => {
      if (result.status === 'fulfilled') {
        const part = result.value.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return "";
    }).filter(img => img !== "");

    res.json(images.length > 0 ? images : PLACEHOLDERS);
  } catch (error) {
    console.error("Erro na rota /api/images:", error);
    res.json(PLACEHOLDERS);
  }
});

// Integração com o Vite (Middleware)
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
