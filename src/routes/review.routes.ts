import { ServerRoute } from '@hapi/hapi';
import * as reviewController from '../controllers/review.controller';

const reviewRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/reviews',
    options: {
      auth: 'jwt', // Endast inloggade får posta
    },
    handler: reviewController.createReview,
  },
  {
    method: 'PUT',
    path: '/reviews/{id}',
    options: {
      auth: 'jwt', // Endast inloggade får uppdatera
    },
    handler: reviewController.updateReview,
  },
  {
    method: 'DELETE',
    path: '/reviews/{id}',
    options: {
      auth: 'jwt', // Endast inloggade får ta bort
    },
    handler: reviewController.deleteReview,
  },
  {
    method: 'GET',
    path: '/reviews/{bookId}',
    options: {
      auth: false, // Öppen för alla att läsa
    },
    handler: reviewController.getReviewsByBookId,
  },{
    method: 'GET',
    path: '/reviews',
    options: { auth: false }, // Öppen för alla
    handler: reviewController.getAllReviews,
  },
  {
    method: 'GET',
    path: '/my-reviews',
    options: { auth: 'jwt' }, // Endast inloggad användare
    handler: reviewController.getMyReviews,
  },
  
];

export default reviewRoutes;
