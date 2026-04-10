import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const verifyJwt = async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers['Authorization']?.replace("Bearer ", "")
    if (!token) {
        return res.status(403).json({ success: false, message: 'Token is missing' })
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

    const user = await User.findById(decodedToken._id)
    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid access token' })
    }

    req.user = user
    next()
}

export default verifyJwt;