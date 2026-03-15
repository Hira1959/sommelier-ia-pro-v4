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
2. Para CADA uma das 3 sugestões, forneça em 'dishDescription' uma descrição BREVE e CRIATIVA do prato, focando em sabores, texturas e apelo gastronômico (ex: "Massa al dente envolvida em um pesto aromático de manjericão fresco e nozes"). NUNCA apenas repita o título.
3. Para CADA uma das 3 sugestões, selecione EXATAMENTE 4 vinhos da lista fornecida.
4. Use APENAS os IDs de vinhos da lista.
5. Retorne JSON válido.`;

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

const CATEGORY_CACHE: Record<string, string> = {};

const FOOD_LIBRARY: Record<string, string[]> = {
  meat: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800'
  ],
  pasta: [
    'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800'
  ],
  sushi: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800'
  ],
  seafood: [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800'
  ],
  salad: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800'
  ],
  dessert: [
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800'
  ],
  default: [
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800',
    'https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7df?q=80&w=800'
  ]
};

app.post("/api/images", async (req, res) => {
  try {
    const { dishName } = req.body;
    let category = 'default';
    const normalizedDish = dishName.toLowerCase();
    
    // 1. Verificação rápida por palavras-chave
    if (normalizedDish.includes('sushi') || normalizedDish.includes('sashimi') || normalizedDish.includes('naguiri')) {
      category = 'sushi';
    } else if (normalizedDish.includes('peixe') || normalizedDish.includes('fish') || normalizedDish.includes('frutos do mar') || normalizedDish.includes('camarão') || normalizedDish.includes('salmão') || normalizedDish.includes('bacalhau')) {
      category = 'seafood';
    } else if (normalizedDish.includes('pasta') || normalizedDish.includes('massa') || normalizedDish.includes('pesto') || normalizedDish.includes('lasanha')) {
      category = 'pasta';
    } else if (normalizedDish.includes('carne') || normalizedDish.includes('picanha') || normalizedDish.includes('bife') || normalizedDish.includes('steak') || normalizedDish.includes('hambúrguer') || normalizedDish.includes('burguer')) {
      category = 'meat';
    } else if (normalizedDish.includes('salada') || normalizedDish.includes('folhas')) {
      category = 'salad';
    } else if (normalizedDish.includes('doce') || normalizedDish.includes('sobremesa') || normalizedDish.includes('chocolate')) {
      category = 'dessert';
    } else if (CATEGORY_CACHE[normalizedDish]) {
      category = CATEGORY_CACHE[normalizedDish];
    } else {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: `Analyze the dish "${dishName}" and categorize it for a SOMMELIER HERO IMAGE. Categories: meat, pasta, sushi, seafood, salad, dessert. Return only the word.`,
        });
        const aiCategory = response.text.trim().toLowerCase();
        if (FOOD_LIBRARY[aiCategory]) {
          category = aiCategory;
          CATEGORY_CACHE[normalizedDish] = category;
        }
      } catch (e) {
        console.warn("Falha na categorização AI.");
      }
    }
    
    const pool = FOOD_LIBRARY[category];
    const charSum = dishName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const heroImage = pool[charSum % pool.length];

    console.log(`Hero image selecionada para "${dishName}": ${heroImage}`);
    res.json([heroImage]); // Retorna como array de 1 para manter compatibilidade básica se necessário
  } catch (error) {
    console.error("Erro na rota /api/images:", error);
    res.json([FOOD_LIBRARY.default[0]]);
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
