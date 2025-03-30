import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log("MongoDB connected successfully")
    } catch (error) {
        console.log(`MongoDB connection error: `, error);
    }
}

export default connectDB;