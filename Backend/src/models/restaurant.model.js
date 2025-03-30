import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: String,
    cuisine: String,
    rating: { type: Number, default: 0 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to user (restaurant owner)
    image: String,
}, { timestamps: true });

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
