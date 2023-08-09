import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js"
import ErrorHandler from "../utils/error.js";
// import ErrorHandler from "../utils/error.js";
import { cookieOptions, sendEmail, sendToken } from "../utils/features.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary"

export const login = asyncError(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password }).select("+password");
    if (user) {
        sendToken(user, res, "Welcome Back", 200)
    }

    if (!password) return next(new ErrorHandler("Please Enter Password", 400))

    else {
        return next(new ErrorHandler("Incorrect Email or Password", 400))
    }

})
export const signUp = asyncError(async (req, res, next) => {

    const { name, email, password, address, city, country, pincode } = req.body;

    // req.file

    const file = getDataUri(req.file)


    // Add Cloudinary here

    const myCloud = await cloudinary.v2.uploader.upload(file.content)
    console.log(myCloud.secure_url)

    await User.create({
        name,
        email,
        password,
        address,
        city,
        country,
        pincode
    });
    res.status(201).json({
        success: true,
        message: "Registered successfully",
    })
});

export const logOut = asyncError(async (req, res, next) => {


    res.status(200).cookie("token", "", {
        ...cookieOptions,
        expires: new Date(Date.now())

    }).json({
        success: true,
        message: "Logged Out Successfully",
    })
});

export const getMyProfile = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    res.status(200).json({
        success: true,
        user,
    })
});
export const updateProfile = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)

    const { name, email, address, country, pincode, city } = req.body
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (pincode) user.pincode = pincode;
    if (country) user.country = country;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully"
    })
});
export const changePassword = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password")
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) return next(new ErrorHandler("Please Enter Old Password & New Password", 400))
    const isMatched = await user.comparePassword(oldPassword)
    if (!isMatched) return next(new ErrorHandler("Incorrect Old Password", 400))
    user.password = newPassword
    await user.save()
    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
});

export const updatePic = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    res.status(200).json({
        success: true,
        user,
    })
});


export const forgetpassword = asyncError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email })
    if (!user) return next(new ErrorHandler("Incorrect Email", 404))

    // max,min 2000,3000
    // math.random()*(max-min)+min

    const randomNumber = Math.random() * (999999 - 100000) + 100000
    const otp = Math.floor(randomNumber)
    const otp_expire = 15 * 60 * 1000
    user.otp = otp
    user.otp_expire = new Date(Date.now() + otp_expire)
    await user.save()

    const message = `Your OTP For Resetting Password is ${otp}.\n Please ignore if you Haven't requested this.`
    try {
        await sendEmail("OTP For Resetting Password", user.email, message)
    } catch (error) {
        user.otp = otp
        user.otp_expire = otp_expire
        await user.save()
        return next(error)
    }

    res.status(200).json({
        success: true,
        message: `Email Sent To ${user.email} `,
    })
});
export const resetpassword = asyncError(async (req, res, next) => {

    const { otp, password } = req.body

    const user = await User.findOne({
        otp,
        otp_expire: {
            $gt: Date.now()
        }
    })

    if (!user) return next(new ErrorHandler("Incorrect OTP or has been expired", 400))
    if (!password) return next(new ErrorHandler("Please Enter New Password", 400))

    user.password = password;
    user.otp = undefined;
    user.otp_expire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Change Successfully, You can login now"
    })
});