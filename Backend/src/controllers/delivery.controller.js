import { DeliveryPartner } from '../models/deliveryPartner.model.js';
import { Order } from '../models/order.model.js';

// Assign delivery partner to an order
export const assignDeliveryPartner = async (req, res) => {
    try {
        const { orderId, partnerId } = req.body;
        const order = await Order.findById(orderId);
        const partner = await DeliveryPartner.findById(partnerId);

        if (!order || !partner) return res.status(404).json({ message: "Order or Delivery Partner not found" });

        order.deliveryPartnerId = partnerId;
        order.status = "Out for Delivery";
        await order.save();

        partner.assignedOrders.push(orderId);
        await partner.save();

        res.status(200).json({ message: "Delivery partner assigned successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all available delivery partners
export const getAvailablePartners = async (req, res) => {
    try {
        const partners = await DeliveryPartner.find();
        res.status(200).json(partners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order delivery status
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.status = status;
        await order.save();

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
