import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceType: {
        type: String,
        required: true,
        enum: ['Plumbing', 'Electrical', 'Mechanics', 'Tutoring', 'Medical', 'Other'], 
    },
    serviceName: {
        type: String,
        required: true, 
    },
    bookedSlot: {
        type: String,
        required: true,
    },
    bookingDate: {
        type: Date,
        required: true, 
    },
    bookingStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending', 
    },
    price: {
        type: Number,
        required: true, 
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending', 
    },
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);
