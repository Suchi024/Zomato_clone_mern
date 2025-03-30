import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './src/db/index.js';
import { app } from './src/app.js';

// Load environment variables early
dotenv.config({ path: './.env' });

// Import Routes
import userRoutes from './src/routes/user.routes.js';
import providerRoutes from './src/routes/provider.routes.js';
import restaurantRoutes from './src/routes/restaurant.routes.js';
import foodRoutes from './src/routes/food.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import deliveryRoutes from './src/routes/delivery.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",  // Local frontend (Vite)
  "https://tomato-44sm.onrender.com"  // Deployed frontend
];

// ✅ Use CORS Middleware

app.use(cors({
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204

  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ CORS Blocked Request from:", origin);
    callback(new Error("Not allowed by CORS")); // Log the error for debugging

    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // ✅ Allow necessary methods
  credentials: true,  // ✅ Allow cookies and authentication
  allowedHeaders: ["Content-Type", "Authorization"],  // ✅ Allow necessary headers
}));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.options("*", cors());  // ✅ Allow all preflight (OPTIONS) requests


// ✅ API Routes
app.use('/api/user', userRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Connect to Database & Start Server
const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`⚙️ Server running on port: ${port}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed: ", err);
  });
