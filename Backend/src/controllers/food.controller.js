import { FoodItem } from '../models/food.model.js';

// Add a food item
export const addFoodItem = async (req, res) => {
    try {
        const { name, price, category, restaurantId, image } = req.body;
        const foodItem = new FoodItem({ name, price, category, restaurantId, image });
        await foodItem.save();

        res.status(201).json({ success: true, message: "Food item added successfully", foodItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get food items for a restaurant
export const getFoodByRestaurant = async (req, res) => {
    try {
        const foodItems = await FoodItem.find({ restaurantId: req.params.restaurantId });
        res.status(200).json({ success: true, foodItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a food item
export const updateFoodItem = async (req, res) => {
    try {
        const { name, price, category, image } = req.body;
        const updatedFoodItem = await FoodItem.findByIdAndUpdate(req.params.id, 
            { name, price, category, image }, { new: true });

        if (!updatedFoodItem) return res.status(404).json({ success: false, message: "Food item not found" });

        res.status(200).json({ success: true, message: "Food item updated successfully", updatedFoodItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a food item
export const deleteFoodItem = async (req, res) => {
    try {
        await FoodItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Food item deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
