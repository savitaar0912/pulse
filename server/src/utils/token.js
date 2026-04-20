import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId) => {
    jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export const generateRefreshToken = (userId) => {
    jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '7d' });
}

export const setRefreshCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,     // JS cannot read this — XSS protection
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in ms
    })
}
