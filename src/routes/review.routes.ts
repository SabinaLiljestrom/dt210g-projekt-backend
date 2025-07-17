import { ServerRoute } from '@hapi/hapi';
import * as reviewController from '../controllers/review.controller';

const reviewRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/reviews',
    options: { auth: 'jwt' },
    handler: reviewController.createReview,
  },
  {
    method: 'GET',
    path: '/reviews/{bookId}',
    options: { auth: false }, // Öppen för alla att läsa
    handler: reviewController.getReviewsByBookId,
  },
];

export default reviewRoutes;
