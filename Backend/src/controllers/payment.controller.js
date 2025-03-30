import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/payment.model.js';
import { Order } from '../models/order.model.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a payment order
export const createPayment = async (req, res) => {
    try {
        const { orderId, amount, currency = "INR" } = req.body;

        const options = { amount: amount * 100, currency, receipt: `order_${orderId}` };
        const paymentResponse = await razorpay.orders.create(options);

        res.status(201).json({ success: true, orderId: paymentResponse.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify payment and update order status
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        await Payment.create({ userId: req.user._id, orderId, paymentId: razorpay_payment_id, amount: req.body.amount, status: "Paid" });

        await Order.findByIdAndUpdate(orderId, { paymentStatus: "Paid", status: "Confirmed" });

        res.status(200).json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
