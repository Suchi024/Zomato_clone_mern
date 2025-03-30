import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin, getAllUsers, toggleUserStatus, getAllRestaurants, approveRestaurant, getAllOrders } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.put('/users/:userId/status', authMiddleware, isAdmin, toggleUserStatus);

router.get('/restaurants', authMiddleware, isAdmin, getAllRestaurants);
router.put('/restaurants/:restaurantId/approve', authMiddleware, isAdmin, approveRestaurant);

router.get('/orders', authMiddleware, isAdmin, getAllOrders);

export default router;
