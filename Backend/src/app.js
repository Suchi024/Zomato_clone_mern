import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import UserRoutes from './routes/user.routes.js'
import ProviderRoutes from './routes/provider.routes.js'
import { ApiError } from './utils/ApiError.js'

const app = express();

//Middlewares
app.use(cors({
    origin: ['https://tomato-y8pa.onrender.com'],

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser());

//routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/users', UserRoutes);


app.use((err, req, res, next) => {


    if (err instanceof ApiError) {
        console.log("Original Error:", err);
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors || []
        });
    }
    if (err.errors && Array.isArray(err.errors)) {
        const apiError = new ApiError(400, err.message || "Validation failed", err.errors);
        return res.status(apiError.statusCode).json({
            success: apiError.success,
            message: apiError.message,
            errors: apiError.errors
        });
    }

    // For any other error, create a generic ApiError
    const apiError = new ApiError(
        err.statusCode || 500,
        err.message || "Internal Server Error",
        err.errors || []
    );

    return res.status(apiError.statusCode).json({
        success: apiError.success,
        message: apiError.message,
        errors: apiError.errors
    });
});








export { app }
