import axios from 'axios';
import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';

export const getBookById = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  const { id } = request.params as { id: string };

  if (!id) {
    return h.response({ message: 'Ingen bok-ID angiven' }).code(400);
  }

  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
    const book = response.data;

    const formattedBook = {
      id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || [],
      description: book.volumeInfo.description || 'Ingen beskrivning tillgänglig.',
      thumbnail: book.volumeInfo.imageLinks?.thumbnail || null,
    };

    return h.response(formattedBook).code(200);
  } catch (error: any) {
    console.error('Fel vid hämtning av bok:', error.message);
    return h.response({ message: 'Kunde inte hämta boken' }).code(500);
  }
};
