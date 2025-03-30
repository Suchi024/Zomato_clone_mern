import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { addReview, getRestaurantReviews, getFoodReviews, updateReview, deleteReview } from '../controllers/review.controller.js';

const router = express.Router();

router.post('/', authMiddleware, addReview); // Add a review
router.get('/restaurant/:restaurantId', getRestaurantReviews); // Get restaurant reviews
router.get('/food/:foodId', getFoodReviews); // Get food item reviews
router.put('/:reviewId', authMiddleware, updateReview); // Update review
router.delete('/:reviewId', authMiddleware, deleteReview); // Delete review

export default router;
