// import express from 'express';
// const router = express.Router();

// // Sample Delivery Route
// router.get('/', (req, res) => {
//     res.status(200).json({ message: "Delivery route working!" });
// });

// export default router;
import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { assignDeliveryPartner, getAvailablePartners, updateDeliveryStatus } from '../controllers/delivery.controller.js';

const router = express.Router();

router.get('/partners', authMiddleware, getAvailablePartners); // Get all delivery partners
router.post('/assign', authMiddleware, assignDeliveryPartner); // Assign a partner to an order
router.put('/order/:orderId/status', authMiddleware, updateDeliveryStatus); // Update order status

export default router;
