import { Cart } from '../models/cart.model.js';

// Get user's cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.foodId');
        res.status(200).json(cart || { userId: req.user._id, items: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) cart = new Cart({ userId: req.user._id, items: [] });

        const existingItem = cart.items.find(item => item.foodId.toString() === foodId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ foodId, quantity });
        }

        await cart.save();
        res.status(200).json({ message: "Item added to cart", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { foodId } = req.params;
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
        await cart.save();

        res.status(200).json({ message: "Item removed from cart", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear cart after order placement
export const clearCart = async (userId) => {
    await Cart.findOneAndDelete({ userId });
};
