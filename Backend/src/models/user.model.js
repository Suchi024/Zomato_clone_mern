// import mongoose from 'mongoose'
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'

// const userSchema = new mongoose.Schema({
//     role: {
//         type: String,
//         enum: ['User', 'Delivery Partner', 'Restaurant']
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Please use a valid Gmail address'],
//     },
//     password: {
//         type: String,
//         required: true,

//     },
//     phoneNo: {
//         type: String, 
//     },
//     address: {
//         town: { type: String },
//         city: { type: String },
//         state: { type: String },
//         pinCode: { type: Number },
//     },
//     refreshToken: {
//         type: String,
//         default: null
//     },
//     currentLocation: {
//         latitude: { type: Number },
//         longitude: { type: Number },
//     },
//     isProfileComplete: {
//         type: Boolean,
//         default: false,
//     }
// }, { timestamps: true })


// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();

//     this.password =  await bcrypt.hash(this.password, 10)
//     next()
// })


// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password)
// }

// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign({
//         _id: this._id,
//         role: this.role,
//         email: this.email
//     },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// }

// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign({
//         _id: this._id,
//     },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }

// userSchema.methods.generateOTPToken = function(otp) {
//     return jwt.sign({
//         otp: otp,
//         email: this.email
//     },
//         process.env.OTP_TOKEN_SECRET,
//         {
//             expiresIn: process.env.OTP_TOKEN_EXPIRY
//         }
//     )

// }

// export const User = mongoose.model("User", userSchema);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'Delivery Partner', 'Restaurant']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Please use a valid Gmail address'],
    },
    password: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: String, 
    },
    address: {
        town: { type: String },
        city: { type: String },
        state: { type: String },
        pinCode: { type: Number },
    },
    refreshToken: {
        type: String,
        default: null
    },
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    isProfileComplete: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            role: this.role,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateOTPToken = function(otp) {
    return jwt.sign(
        {
            otp: otp,
            email: this.email
        },
        process.env.OTP_TOKEN_SECRET,
        {
            expiresIn: process.env.OTP_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);