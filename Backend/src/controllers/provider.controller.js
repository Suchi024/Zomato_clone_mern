import { ApiError } from '../utils/ApiError.js';
import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Provider } from '../models/provider.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs'
import path from "path";
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
import createProvider from '../services/provider.service.js';

const generateRefreshTokenAccessToken = async (userId) => {
    try {
        const provider = await Provider.findById(userId);
        const refreshToken = provider.generateRefreshToken();
        const accessToken = provider.generateAccessToken();
        provider.refreshToken = refreshToken;

        await provider.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token for provider")
    }
}

const registerProvider = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new ApiError(400, "Validation failed", errors.array());
    }

    const { fullname, email, password, phoneNo } = req.body;

    console.log(req.body);
    const phoneNoString = String(phoneNo);
    const isValidPhone = phoneNoString.match(/^[6-9]\d{9}$/);
    if (!isValidPhone) {
        throw new ApiError(400, "Invalid phone number");
    }
    const isProviderAlready = await Provider.findOne({ email });

    if (isProviderAlready) {
        throw new ApiError(400, "Provider already exists");
    }


    const provider = await createProvider({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password,
        phoneNo
    });

    if (!provider || !provider._id) {
        throw new ApiError(500, "Failed to create Provider");
    }

    const createdProvider = await Provider.findById(provider?._id).select(
        "-password -refreshToken"
    )

    if (!createdProvider) {
        throw new ApiError(500, "Something went wrong while registering the Provider")
    }

    return res.status(201).json(
        new ApiResponse(200, createdProvider, "Provider registered Successfully")
    )
})

const loginProvider = asyncHandler(async (req, res, next) => {
    /*
        Input Validation 
        Take data from req.body
        Check if email and password is send
        check for the user with the given email in database
        check for correct credentials(password)
        generate refresh and access token
        send a respone in that response send the user and the provided token for successful login 
    */

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new ApiError(400, "Validation failed", errors.array());
    }

    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email or Password not provided.", errors.array());
    }

    const provider = await Provider.findOne({ email });

    if (!provider) {
        throw new ApiError(400, "Provider does not exist");
    }

    const isPasswordValid = await provider.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Provider Credentials.");
    }

    const { accessToken, refreshToken } = await generateRefreshTokenAccessToken(provider._id);

    const LoggedinProvider = await Provider
        .findById(provider._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    provider: LoggedinProvider, accessToken, refreshToken
                },
                "Provider logged In Successfully"
            )
        )

})

const logoutProvider = asyncHandler(async (req, res, next) => {
    await Provider.findByIdAndUpdate(
        req.provider._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Provider logged Out"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!IncomingRefreshToken) {
        throw new ApiError(401, "Refresh token not provided");
    }

    try {

        const decoded = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const provider = await Provider.findById(decoded?._id);

        if (!provider || IncomingRefreshToken !== provider.refreshToken) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const TimeLeft = decoded.exp - currentTime;

        const newRefreshToken = IncomingRefreshToken;

        if (TimeLeft < 86400) {
            newRefreshToken = provider.generateRefreshToken();
            provider.refreshToken = newRefreshToken;
            provider.save({ validateBeforeSave: false });
        }

        const accessToken = provider.generateAccessToken();

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

})


const ForgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        const provider = await Provider.findOne({ email });
        if (!provider) {
            throw new ApiError(404, "User not found");
        }

        const otp = crypto.randomInt(100000, 999999);

        const otpToken = provider.generateOTPToken(otp);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);


        const templatepath = path.join(__dirname, '../emailTemplates/resetPassword.html');
        let emailTemplate = fs.readFileSync(templatepath, 'utf8');

        emailTemplate = emailTemplate.replace('{{OTP}}', otp);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Reset Password OTP',
            html: emailTemplate
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json(
            new ApiResponse(200, { otpToken }, "OTP sent successfully")
        )

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while sending OTP")
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, otpToken, newPassword } = req.body;

    try {

        const decoded = jwt.verify(otpToken, process.env.OTP_TOKEN_SECRET);

        if (decoded.otp.toString() !== otp.toString() ||
            decoded.email !== email) {
            throw new ApiError(400, "Invalid OTP or email");
        }

        const provider = await Provider.findOne({ email });
        if (!provider) {
            throw new ApiError(404, "Provprovider not found");
        }

        provider.password = newPassword;
        await provider.save({ validateBeforeSave: false });

        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset successfully")
        )

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(400, "OTP expired");
        }
        throw new ApiError(501, "Server Error");
    }
})
export { registerProvider, loginProvider, logoutProvider, refreshAccessToken, ForgetPassword, resetPassword };