import User from "../models/user.model.js";

import jwt from 'jsonwebtoken'
import asyncHandler from "../utils/asynHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    const existUser = await User.findOne({ email })
    if (existUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' })
    }

    const user = await User.create({ name, email, password, role })
    const userObj = user.toObject()
    delete userObj.password

    return res.status(201).json({ success: true, message: 'User register successfully', user: userObj })
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const existUser = await User.findOne({ email })
    if (!existUser) {
        return res.status(404).json({ success: false, message: 'User doest not exists' })
    }


    const isValidPassword = await existUser.isPasswordCorrect(password)
    if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Password is incorrect' })
    }

    const accessToken = await existUser.generateAccessToken()
    const refreshToken = await existUser.generateRefreshToken()
    existUser.refreshToken = refreshToken
    await existUser.save()

    const userObj = existUser.toObject()
    delete userObj.password

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json({ success: true, message: 'User logged in successfully', user: userObj })
})

const logutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    await User.findByIdAndUpdate(userId, {
        $set: {
            refreshToken: null
        }
    })

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json({ success: true, message: 'User logout successfully' })

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        return res.status(401).json({ success: false, message: 'Unauthorized request' })
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' })
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        await User.findByIdAndUpdate(user._id, {
            $set: {
                refreshToken: null
            }
        })

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }

        return res
            .status(401)
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .json({ success: false, message: 'Refresh token reuse detected. logged out from all devices' })
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json({ success: true, message: 'Access token refresh successfully' })
})

const getUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const user = await User.findById(userId)

    return res.status(200).json({ success: true, message: 'User fetched successfully', user })
})

export { registerUser, loginUser, logutUser, refreshAccessToken, getUser }