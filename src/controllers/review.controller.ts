import { Request, ResponseToolkit } from '@hapi/hapi';
import Review from '../models/review.model';

export const createReview = async (request: Request, h: ResponseToolkit) => {
  try {
    const { bookId, content, rating } = request.payload as {
      bookId: string;
      content: string;
      rating: number;
    };

    const userId = (request.auth.credentials as any).id;

    const review = new Review({
      bookId,
      userId,
      content,
      rating,
    });

    await review.save();
    return h.response({ message: 'Recension skapad' }).code(201);
  } catch (error) {
    console.error('Fel vid skapande av recension:', error);
    return h.response({ message: 'Kunde inte skapa recension' }).code(500);
  }
};

export const getReviewsByBookId = async (request: Request, h: ResponseToolkit) => {
  const { bookId } = request.params;

  try {
    const reviews = await Review.find({ bookId }).populate('userId', 'username');
    return h.response(reviews).code(200);
  } catch (error) {
    console.error('Fel vid hämtning av recensioner:', error);
    return h.response({ message: 'Kunde inte hämta recensioner' }).code(500);
  }
};
