// src/routes/book.routes.ts
import axios from "axios";
import type { ServerRoute } from "@hapi/hapi";
import { getBookById } from "../controllers/book.controller";

const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

const normalize = (item: any) => {
  const v = item.volumeInfo || {};
  return {
    id: item.id,
    title: v.title || "Okänd titel",
    authors: v.authors || [],
    description: v.description || "Ingen beskrivning.",
    thumbnail: v.imageLinks?.thumbnail || null,
  };
};

const bookRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/books",
    options: { auth: false },
    handler: async (request, h) => {
      // query-parametrar
      const search = (request.query.search as string) ?? "";      // tom → breda träffar
      const start = Number(request.query.start ?? 0);             // startIndex
      const limit = Math.max(1, Math.min(Number(request.query.limit ?? 20), 40)); // Google max 40
      const highlightExact = String(request.query.highlightExact ?? "false") === "true";

      // NYTT: möjliggör filtrering på titel, författare eller båda
      // by = "all" | "title" | "author"
      const by = String((request.query as any).by ?? "all");

      // Hjälpare för att bygga Google Books-frågan
      const buildQ = (term: string, mode: "title" | "author" | "raw") => {
        const t = term.trim();
        if (!t) return "a"; // Google kräver q – ge “a” om helt tomt för att få en bred lista
        if (mode === "title") return `intitle:"${t}"`;
        if (mode === "author") return `inauthor:"${t}"`;
        return t; // raw
      };

      try {
        // FALL 1: by=all → sök både i titel och författare och slå ihop resultaten
        if (by === "all" && search.trim()) {
          const [byTitle, byAuthor] = await Promise.all([
            axios.get(GOOGLE_BOOKS_API_URL, {
              params: {
                q: buildQ(search, "title"),
                startIndex: start,
                maxResults: limit,
                orderBy: "relevance",
                key: process.env.GOOGLE_API_KEY,
              },
            }),
            axios.get(GOOGLE_BOOKS_API_URL, {
              params: {
                q: buildQ(search, "author"),
                startIndex: start,
                maxResults: limit,
                orderBy: "relevance",
                key: process.env.GOOGLE_API_KEY,
              },
            }),
          ]);

          // slå ihop och deduplicera på id
          const itemsRawCombined = [
            ...(byTitle.data?.items ?? []),
            ...(byAuthor.data?.items ?? []),
          ];

          const dedupMap = new Map<string, any>();
          for (const it of itemsRawCombined) {
            if (it?.id) dedupMap.set(it.id, it);
          }
          // Normalisera
          const mergedItems = Array.from(dedupMap.values()).map(normalize);

          // (Valfritt) sortera lite efter relevans-liknande signaler – här låter vi Googles ordning stå,
          // men när vi slagit ihop två listor kan man behöva egen sort. Vi behåller ordningen nu.

          const totalItemsApprox = mergedItems.length;

          // Lyfta fram “exakt titel”-träff som primary (om efterfrågat)
          if (highlightExact && search.trim()) {
            const qLower = search.trim().toLowerCase();
            const exactIndex = mergedItems.findIndex(
              (b: any) => (b.title || "").toLowerCase() === qLower
            );
            if (exactIndex >= 0) {
              const primary = mergedItems[exactIndex];
              const related = mergedItems.filter((_: any, i: number) => i !== exactIndex);
              return h
                .response({ total: totalItemsApprox, primary, related })
                .code(200);
            }
          }

          // Standard-svar: total + platt lista
          return h.response({ total: totalItemsApprox, items: mergedItems }).code(200);
        }

        // FALL 2: by=title eller by=author → enkel en-fältssökning
        if ((by === "title" || by === "author") && search.trim()) {
          const q = buildQ(search, by === "title" ? "title" : "author");

          const { data } = await axios.get(GOOGLE_BOOKS_API_URL, {
            params: {
              q,
              startIndex: start,
              maxResults: limit,
              orderBy: "relevance",
              key: process.env.GOOGLE_API_KEY,
            },
          });

          const totalItems = data?.totalItems ?? 0;
          const itemsRaw = data?.items ?? [];
          const items = itemsRaw.map(normalize);

          // Lyfta fram “exakt titel”-träff som primary 
          if (highlightExact && search.trim()) {
            const qLower = search.trim().toLowerCase();
            const exactIndex = items.findIndex(
              (b: any) => (b.title || "").toLowerCase() === qLower
            );
            if (exactIndex >= 0) {
              const primary = items[exactIndex];
              const related = items.filter((_: any, i: number) => i !== exactIndex);
              return h
                .response({ total: totalItems, primary, related })
                .code(200);
            }
          }

          // Standard-svar: total + platt lista
          return h.response({ total: totalItems, items }).code(200);
        }

        // FALL 3: “rå” sökning (din gamla logik) – t.ex. när search är tomt eller by inte är satt
        // Google kräver q – ge “a” om helt tomt för att få en bred lista
        const qRaw = search.trim() === "" ? "a" : search.trim();

        const { data } = await axios.get(GOOGLE_BOOKS_API_URL, {
          params: {
            q: qRaw,
            startIndex: start,
            maxResults: limit,
            orderBy: "relevance",
            key: process.env.GOOGLE_API_KEY,
          },
        });

        const totalItems = data?.totalItems ?? 0;
        const itemsRaw = data?.items ?? [];
        const items = itemsRaw.map(normalize);

        // Lyfta fram “exakt titel”-träff som primary 
        if (highlightExact && search.trim()) {
          const qLower = search.trim().toLowerCase();
          const exactIndex = items.findIndex(
            (b: any) => (b.title || "").toLowerCase() === qLower
          );
          if (exactIndex >= 0) {
            const primary = items[exactIndex];
            const related = items.filter((_: any, i: number) => i !== exactIndex);
            return h
              .response({ total: totalItems, primary, related })
              .code(200);
          }
        }

        // Standard-svar: total + platt lista
        return h.response({ total: totalItems, items }).code(200);
      } catch (err) {
        console.error("Fel vid hämtning från Google Books:", err);
        return h.response({ message: "Kunde inte hämta böcker" }).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/books/{id}",
    options: { auth: false },
    handler: getBookById,
  },
];

export default bookRoutes;
