import { User } from "../models/user.model.js";
import createUser from '../services/user.service.js'
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs'
import path from "path";
import { fileURLToPath } from 'url';

const generateRefreshTokenAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        throw new ApiError(400, "Validation failed", errors.array());
    }

    const {  email, password, role } = req.body;

    const isuserAlready = await User.findOne({ email });

    if (isuserAlready) {
        throw new ApiError(400, "User already exists");
    }


    const user = await createUser({
       role,
        email,
        password,
    });

    if (!user || !user._id) {
        throw new ApiError(500, "Failed to create user");
    }

    const createdUser = await User.findById(user?._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res, next) => {
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

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log(isPasswordValid)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid User Credentials.");
    }

    const { accessToken, refreshToken } = await generateRefreshTokenAccessToken(user._id);

    const LoggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    console.log("About to send response:", JSON.stringify({
        user: LoggedinUser,
        accessToken,
        refreshToken
    }));


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: LoggedinUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
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
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!IncomingRefreshToken) {
        throw new ApiError(401, "Refresh token not provided");
    }

    try {

        const decoded = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded?._id);

        if (!user || IncomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const TimeLeft = decoded.exp - currentTime;

        const newRefreshToken = IncomingRefreshToken;

        if (TimeLeft < 86400) {
            newRefreshToken = user.generateRefreshToken();
            user.refreshToken = newRefreshToken;
            user.save({ validateBeforeSave: false });
        }

        const accessToken = user.generateAccessToken();

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
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const otp = crypto.randomInt(100000, 999999);

        const otpToken = user.generateOTPToken(otp);

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

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset successfully")
        )

    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            throw new ApiError(400, "OTP expired");
        }
        throw new ApiError(501, "Server Error");
    }
})



export { registerUser, loginUser, logoutUser, refreshAccessToken, ForgetPassword, resetPassword }
