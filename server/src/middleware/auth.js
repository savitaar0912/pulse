import jwt from 'jsonwebtoken'
import { AppError } from "./errorHandler.js"

export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1] // "Bearer <token>"
    if (!token) return next(new AppError("Not Authenticated", 401))

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.userId = decoded.userId
        next()
    } catch (error) {
        next(new AppError('Token invalid or expired', 401));
    }
}
