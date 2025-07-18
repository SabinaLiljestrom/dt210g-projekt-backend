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

export const updateReview = async (request: Request, h: ResponseToolkit) => {
  const { id } = request.params;
  const { content, rating } = request.payload as { content: string; rating: number };
  const userId = (request.auth.credentials as any).id;

  try {
    const existingReview = await Review.findById(id);
    if (!existingReview) {
      return h.response({ message: 'Recensionen hittades inte' }).code(404);
    }

    if (existingReview.userId.toString() !== userId) {
      return h.response({ message: 'Du har inte behörighet att ändra denna recension' }).code(403);
    }

    existingReview.content = content;
    existingReview.rating = rating;
    await existingReview.save();

    return h.response({ message: 'Recension uppdaterad' }).code(200);
  } catch (error) {
    console.error('Fel vid uppdatering av recension:', error);
    return h.response({ message: 'Kunde inte uppdatera recension' }).code(500);
  }
};

export const deleteReview = async (request: Request, h: ResponseToolkit) => {
  const { id } = request.params;
  const userId = (request.auth.credentials as any).id;

  try {
    const existingReview = await Review.findById(id);
    if (!existingReview) {
      return h.response({ message: 'Recensionen hittades inte' }).code(404);
    }

    if (existingReview.userId.toString() !== userId) {
      return h.response({ message: 'Du har inte behörighet att ta bort denna recension' }).code(403);
    }

    await existingReview.deleteOne();
    return h.response({ message: 'Recension borttagen' }).code(200);
  } catch (error) {
    console.error('Fel vid borttagning av recension:', error);
    return h.response({ message: 'Kunde inte ta bort recension' }).code(500);
  }
};
