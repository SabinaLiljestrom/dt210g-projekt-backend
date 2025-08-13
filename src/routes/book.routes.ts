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

      try {
        // Google kräver q – ge “a” om helt tomt för att få en bred lista
        const q = search.trim() === "" ? "a" : search.trim();

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
            const related = items.filter((_: any, i: any) => i !== exactIndex);
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
