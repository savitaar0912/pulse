import User from "../models/User.js"
import Notification from "../models/Notification.js"
import { AppError } from "../middleware/errorHandler.js"
import Follow from "../models/Follow.js"
import Post from "../models/Post.js"


export const getProfile = async (req, res, next) => {
    try {
        const user = User.findOne({ username: req.params.username });
        if (!user) throw new AppError("User Not Found", 404)

        return res.status(200).res.json({ user })
    } catch (error) {
        next(error)
    }
}
export const editProfile = async (req, res, next) => {
    try {
        const { displayName, bio } = req.body
        const updates = { displayName, bio }

        // Only update avatar if a new image was uploaded
        if (req.file) {
            const user = User.findById(req.userId)

            // Delete old avatar from Cloudinary if exists
            if (user.avatarPublicId) {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            }

            updates.avatarUrl = req.file.path;
            updates.avatarPublicId = req.file.filename;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true }     // return the updated document, not the old one
        );

        res.status(200).json({ user })
    } catch (error) {
        next(error)
    }
}
export const getUserPosts = async (req, res, next) => {
    try {
        const { cursor, limit = 10 } = req.query;
        const query = {
            userId: req.params.id,
            ...(cursor && { _id: { $lt: cursor } })   // spread cursor only if it exists
        };

        const posts = await Post.find(query)
            .sort({ _id: -1 })
            .limit(Number(limit) + 1)
            .populate('userId', 'username displayName avatarUrl');

        const hasMore = posts.length > limit;
        if (hasMore) posts.pop();

        res.json({ posts, nextCursor: hasMore ? posts[posts.length - 1]._id : null, hasMore });
    } catch (error) {
        next(error)
    }
}
export const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ users: [] });

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { displayName: { $regex: q, $options: 'i' } },
            ]
        }).limit(10).select('username displayName avatarUrl followersCount');

        res.json({ users });
    } catch (error) {
        next(error)
    }
}