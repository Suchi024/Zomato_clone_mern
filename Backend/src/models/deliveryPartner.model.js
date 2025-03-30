import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String, enum: ['Bike', 'Car', 'Bicycle'], required: true },
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

export const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
