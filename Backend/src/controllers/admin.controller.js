import { User } from '../models/user.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Order } from '../models/order.model.js';

// Middleware to check if user is Admin
export const isAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Access denied" });
    next();
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Block or Unblock a user
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.status = user.status === "Blocked" ? "Active" : "Blocked";
        await user.save();

        res.status(200).json({ message: `User ${user.status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all restaurants (Pending & Approved)
export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve a restaurant
export const approveRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        restaurant.status = "Approved";
        await restaurant.save();

        res.status(200).json({ message: "Restaurant approved successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'email').populate('restaurantId', 'name');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
