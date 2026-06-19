/**
 * Faseyeon Search API
 *
 * POST /api/search — takes a fashion item query and returns
 * price comparison results across all major platforms, generated
 * via the LLM scaffold to simulate real-world aggregation.
 */

import axios, { AxiosError } from "axios";
import { Router, type Request, type Response } from "express";
import { createLogger } from "~/lib/logger";

const logger = createLogger("SearchRoutes");
const router = Router();

const AGENTIC_SERVICE_URL = "https://api-micro-agentic.quantumbyte.ai";

function keyspace() {
  return process.env._KEYSPACE ?? "";
}

function authHeaders(): Record<string, string> {
  const auth = process.env.QB_SCAFFOLDER_KEY;
  return auth ? { Authentication: auth } : {};
}

const PLATFORMS = [
  "ASOS",
  "Farfetch",
  "Zalando",
  "Net-a-Porter",
  "Zara",
  "H&M",
  "Brand Site",
];

const SEARCH_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          platform: { type: "string" },
          itemName: { type: "string" },
          variant: { type: "string" },
          price: { type: "number" },
          currency: { type: "string" },
          availability: { type: "string" },
          isExclusiveDrop: { type: "boolean" },
          buyUrl: { type: "string" },
        },
        required: [
          "platform",
          "itemName",
          "variant",
          "price",
          "currency",
          "availability",
          "isExclusiveDrop",
          "buyUrl",
        ],
      },
    },
    totalDrops: { type: "number" },
    searchedItem: { type: "string" },
  },
  required: ["results", "totalDrops", "searchedItem"],
};

const SYSTEM_PROMPT = `You are Faseyeon's fashion price intelligence engine. When given a fashion item search query, you simulate realistic price comparison data across major fashion retail platforms.

Rules:
- Generate results for 6-10 platforms from: ASOS, Farfetch, Zalando, Net-a-Porter, Zara, H&M, Brand Site
- Prices must be realistic and vary meaningfully across platforms (10-40% spread is natural)
- Currency: USD. Prices should feel authentic (e.g. $89, $124.99, $340)
- itemName: the specific item name as it would appear on that platform (may slightly differ per platform)
- variant: color or size variant (e.g. "Midnight Black / S", "Ivory / M")
- availability: one of "In Stock", "Low Stock", "Out of Stock"
- isExclusiveDrop: true only for 0-2 results where the item is a limited/exclusive drop on that platform
- buyUrl: a realistic-looking but fictional URL to that platform's product page
- searchedItem: the cleaned/normalized name of what was searched
- Sort results: exclusive drops first, then by price ascending
- Return exactly the JSON schema shape requested`;

router.post("/search", async (req: Request, res: Response) => {
  const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: "query must be at least 2 characters",
    });
  }

  if (query.length > 200) {
    return res.status(400).json({
      success: false,
      message: "query too long (max 200 chars)",
    });
  }

  const ks = keyspace();

  try {
    const form = new FormData();
    form.set(
      "message",
      `Search for fashion item: "${query}". Generate realistic price comparison results across major fashion retail platforms.`,
    );
    form.set("schema", JSON.stringify(SEARCH_SCHEMA));
    form.set("system_prompt", SYSTEM_PROMPT);

    const response = await axios.post(`${AGENTIC_SERVICE_URL}/api/llm`, form, {
      headers: {
        "x-id-keyspace": ks,
        ...authHeaders(),
      },
      timeout: 30_000,
    });

    const llmData = response.data;
    const parsed =
      llmData?.response ?? llmData?.data?.response ?? llmData?.data ?? null;

    if (!parsed || !Array.isArray(parsed.results)) {
      logger.error("Unexpected LLM response shape", { llmData });
      return res.status(502).json({
        success: false,
        message: "Unexpected response from search engine",
      });
    }

    return res.json({
      success: true,
      data: {
        results: parsed.results,
        totalDrops: parsed.totalDrops ?? 0,
        searchedItem: parsed.searchedItem ?? query,
      },
    });
  } catch (error) {
    const ax = error as AxiosError<{ detail?: unknown; message?: string }>;
    const detail =
      ax.response?.data?.detail ??
      ax.response?.data?.message ??
      ax.message ??
      "Search failed";
    logger.error("Search LLM dispatch failed", error, {
      query,
      statusCode: ax.response?.status,
    });
    return res.status(ax.response?.status ?? 502).json({
      success: false,
      message: typeof detail === "string" ? detail : JSON.stringify(detail),
    });
  }
});

export default router;
