import User from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";
import { generateAccessToken, generateRefreshToken, setRefreshCookie } from "../utils/token.js";
import jwt from 'jsonwebtoken'

export const register = async (req, res, next) => {
    try {
        const { username, email, password, displayName } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        })

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            throw new AppError(`That ${field} is already taken`, 409)
        }

        const newUser = await User.create({
            username,
            email,
            passwordHash: password,             // schema pre-save hook hashes this
            displayName: displayName || username
        })

        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);
        setRefreshCookie(res, refreshToken);

        res.status(201).json({ accessToken, newUser });
    } catch (error) {
        next(error);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user || !(await user.comparePassword(password))) {
            throw new AppError(`Invalid Credentials`, 401)
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        setRefreshCookie(res, refreshToken);

        res.json({ accessToken, user });

    } catch (error) {
        next(error)
    }
}

export const refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken
        if (!token) throw new AppError('No refresh token', 401)

        console.log("cookies:", req.cookies);
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.userId);
        if (!user) throw new AppError('User not found', 401);

        const accessToken = generateAccessToken(user._id);
        res.json({ accessToken });
    } catch {
        next(new AppError('Refresh token invalid', 401))
    }
}

export const logout = (req, res) => {
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged Out' })
}

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) throw new AppError('User not found', 404);
        res.json({ user });
    } catch (err) {
        next(err);
    }
};