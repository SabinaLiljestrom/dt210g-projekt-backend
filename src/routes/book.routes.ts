import axios from 'axios';
import { ServerRoute } from '@hapi/hapi';
import { getBookById } from '../controllers/book.controller';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

const bookRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/books',
    options: { auth: false },
    handler: async (request, h) => {
      const query = request.query.q as string;

      if (!query) {
        return h.response({ message: 'Ingen sökterm angiven' }).code(400);
      }

      try {
        const response = await axios.get(GOOGLE_BOOKS_API_URL, {
          params: {
            q: query,
            maxResults: 10,
            key: process.env.GOOGLE_API_KEY,
          },
        });

        const books = response.data.items.map((item: any) => {
          const volume = item.volumeInfo;
          return {
            id: item.id,
            title: volume.title,
            authors: volume.authors || [],
            description: volume.description,
            thumbnail: volume.imageLinks?.thumbnail || null,
          };
        });

        return h.response(books).code(200);
      } catch (error) {
        console.error('Fel vid hämtning från Google Books:', error);
        return h.response({ message: 'Kunde inte hämta böcker' }).code(500);
      }
    },
  },
  {
    method: 'GET',
    path: '/books/{id}',
    options: { auth: false },
    handler: getBookById,
  },
];

export default bookRoutes;
