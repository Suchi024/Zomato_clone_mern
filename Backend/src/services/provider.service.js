import { Provider } from "../models/provider.model.js";
import { ApiError } from "../utils/ApiError.js";

const createProvider = async ({ firstname, lastname, email, password, phoneNo }) => {
    if (!firstname || !email || !password || !phoneNo) {
        throw new ApiError(400, "All fields are necessary.");
    }

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
        throw new ApiError(400, "Provider with this email already exists.");
    }

    // Create the new provider
    const provider = await Provider.create({
        fullname: {
            firstname: firstname,
            lastname: lastname
        },
        email,
        password,
        phoneNo
    });

    return provider;
}

export default createProvider;