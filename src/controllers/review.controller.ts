import { Request, ResponseToolkit } from '@hapi/hapi';
import Review from '../models/review.model';

export const createReview = async (request: Request, h: ResponseToolkit) => {
  try {
    const { bookId, content, rating } = request.payload as {
      bookId: string;
      content: string;
      rating: number;
    };

       // Enkel manuell validering
       if (!bookId || typeof bookId !== 'string') {
        return h.response({ message: 'Ogiltigt eller saknat bok-ID' }).code(400);
      }
  
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return h.response({ message: 'Recensionstexten får inte vara tom' }).code(400);
      }
  
      if (
        typeof rating !== 'number' ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return h.response({ message: 'Betyget måste vara ett heltal mellan 1 och 5' }).code(400);
      }

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
    
  // Validering
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return h.response({ message: 'Recensionstexten får inte vara tom' }).code(400);
  }

  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return h.response({ message: 'Betyget måste vara ett heltal mellan 1 och 5' }).code(400);
  }

    try {
      const review = await Review.findById(id);
  
      if (!review) {
        return h.response({ message: 'Recension hittades inte' }).code(404);
      }
  
      if (review.userId.toString() !== userId) {
        return h.response({ message: 'Du har inte behörighet att uppdatera denna recension' }).code(403);
      }
  
      review.content = content;
      review.rating = rating;
      await review.save();
  
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
      const review = await Review.findById(id);
  
      if (!review) {
        return h.response({ message: 'Recension hittades inte' }).code(404);
      }
  
      if (review.userId.toString() !== userId) {
        return h.response({ message: 'Du har inte behörighet att ta bort denna recension' }).code(403);
      }
  
      await review.deleteOne();
      return h.response({ message: 'Recension borttagen' }).code(200);
    } catch (error) {
      console.error('Fel vid borttagning av recension:', error);
      return h.response({ message: 'Kunde inte ta bort recension' }).code(500);
    }
  };
  
  // Hämta alla recensioner
export const getAllReviews = async (request: Request, h: ResponseToolkit) => {
  try {
    const reviews = await Review.find().populate('userId', 'username');
    return h.response(reviews).code(200);
  } catch (error) {
    console.error('Fel vid hämtning av alla recensioner:', error);
    return h.response({ message: 'Kunde inte hämta recensioner' }).code(500);
  }
};

// Hämta recensioner skapade av inloggad användare
export const getMyReviews = async (request: Request, h: ResponseToolkit) => {
  const userId = (request.auth.credentials as any).id;

  try {
    const reviews = await Review.find({ userId }).populate('userId', 'username');
    return h.response(reviews).code(200);
  } catch (error) {
    console.error('Fel vid hämtning av användarens recensioner:', error);
    return h.response({ message: 'Kunde inte hämta recensioner' }).code(500);
  }
};

