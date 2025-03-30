import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String,
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }, // Link to restaurant
    image: String,
}, { timestamps: true });

export const FoodItem = mongoose.model('FoodItem', foodItemSchema);
