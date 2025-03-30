import express from 'express';
import { addFoodItem, getFoodByRestaurant, updateFoodItem, deleteFoodItem } from '../controllers/food.controller.js';

const router = express.Router();

router.post('/', addFoodItem);
router.get('/:restaurantId', getFoodByRestaurant);
router.put('/:id', updateFoodItem);
router.delete('/:id', deleteFoodItem);

export default router;
