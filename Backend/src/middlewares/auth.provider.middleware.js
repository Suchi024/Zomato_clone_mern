import { Provider } from "../models/provider.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authProvider = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Access token is required");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const provider = await Provider.findById(decodedToken._id).select("-password -refreshToken");
        if (!provider) {
            throw new ApiError(401, "Invalid Access Token");
        }

        if (decodedToken.role !== "provider") {
            throw new ApiError(403, "Unauthorized Access");
        }

        req.provider = provider;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
