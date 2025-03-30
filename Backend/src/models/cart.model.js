import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);
