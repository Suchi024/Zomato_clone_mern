import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } from '../controllers/restaurant.controller.js';

const router = express.Router();

router.post('/', authMiddleware, createRestaurant);
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.put('/:id', authMiddleware, updateRestaurant);
router.delete('/:id', authMiddleware, deleteRestaurant);

export default router;
