import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }, // Optional for food reviews
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }, // Optional for restaurant reviews
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema);
