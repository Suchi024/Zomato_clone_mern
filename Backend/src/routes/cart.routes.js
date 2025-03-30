import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getCart, addToCart, removeFromCart } from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/', authMiddleware, addToCart);
router.delete('/:foodId', authMiddleware, removeFromCart);

export default router;
