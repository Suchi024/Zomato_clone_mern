import { Restaurant } from '../models/restaurant.model.js';

// Create a new restaurant
export const createRestaurant = async (req, res) => {
    try {
        const { name, location, cuisine, image } = req.body;
        const ownerId = req.user._id; // Extract from JWT token

        const restaurant = new Restaurant({ name, location, cuisine, image, ownerId });
        await restaurant.save();

        res.status(201).json({ success: true, message: "Restaurant created successfully", restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json({ success: true, restaurants });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single restaurant by ID
export const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

        res.status(200).json({ success: true, restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update restaurant details
export const updateRestaurant = async (req, res) => {
    try {
        const { name, location, cuisine, image } = req.body;
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, 
            { name, location, cuisine, image }, { new: true });

        if (!updatedRestaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

        res.status(200).json({ success: true, message: "Restaurant updated successfully", updatedRestaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a restaurant
export const deleteRestaurant = async (req, res) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Restaurant deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
