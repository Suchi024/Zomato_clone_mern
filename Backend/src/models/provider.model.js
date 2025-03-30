import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const providerSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long'],
        },
        lastname: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long'],
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: String,
        unique: true,
        sparse: true,
        required: true,
    },
    serviceTypes: [
        {
            serviceName: {
                type: String,
                enum: ['Plumbing', 'Electrical', 'Mechanics', 'Carpenter', 'Medical', 'Other'],
            },
            expertiseLevel: {
                type: String,
                enum: ['Beginner', 'Intermediate', 'Expert'],
            },
            hourlyRate: {
                type: Number,
            },
        },
    ],
    address: {
        town: { type: String },
        city: { type: String },
        state: { type: String },
        pinCode: { type: Number },
    },
    experience: {
        type: Number,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    isProfileComplete: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
        default: null
    },
    availability: {
        isAvailable: {
            type: Boolean,
            default: true,
        },
        availableFrom: {
            type: Date,
        },
        availableUntil: {
            type: Date,
        },
        availableSlots: [
            {
                day: String,
                slots: [
                    {
                        time: String,
                        isBooked: { type: Boolean, default: false },
                    },
                ],
            },
        ],
    },

    profilepic: {
        type: String
    },

    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        }
    ],
}, { timestamps: true });

providerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

providerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

providerSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        role: 'provider',
        email: this.email,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

providerSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

providerSchema.methods.generateOTPToken = function (otp) {
    return jwt.sign({
        otp: otp,
        email: this.email,
    },
        process.env.OTP_TOKEN_SECRET,
        {
            expiresIn: process.env.OTP_TOKEN_EXPIRY,
        }
    );
};

export const Provider = mongoose.model('Provider', providerSchema);
