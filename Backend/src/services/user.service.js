import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';

const createUser = async ({ role, email, password }) => {
    if ( !email || !password || !role) {
        throw new ApiError(400, "All fields are necessary.");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists.");
    }

    // Create the new user
    const user = await User.create({
        role,
        email,
        password
    });

    return user;
};

export default createUser;
