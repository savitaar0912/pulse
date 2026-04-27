import Post from "../models/Post.js"
import Like from "../models/Like.js"
import Notification from "../models/Notification.js"
import { AppError } from "../middleware/errorHandler.js"

export const likePost = async (req, res, next) => {
    try {

        const post = await Post.findById(req.params.id)
        if (!post) throw new AppError('Post Not Found', 404)

        // Check if already liked — our DB index prevents duplicates too, but
        // checking here gives a cleaner error message than a MongoDB duplicate key error
        const existing = await Like.findOne({ userId: req.userId, postId: post._id });
        if (existing) throw new AppError('Already liked', 409);

        const like = await Like.create({
            userId: req.userId,
            postId: post._id
        })

        // Increment user's like count — denormalized counter we designed in Phase 1
        await Post.findByIdAndUpdate(req.postId, { $inc: { likesCount: 1 } });

        if (post.userId.toString() !== req.userId) {
            await Notification.create({
                type: 'like',
                recipientId: post.userId,   // the post author gets notified
                actorId: req.userId,        // the person who liked
                postId: post._id,
            });
        }

        return res.status(201).json({ like })
    } catch (error) {
        next(error)
    }
}

export const unlikePost = async (req, res, next) => {
    try {

        const post = await Post.findById(req.params.id)
        if (!post) throw new AppError('Post Not Found', 404)

        const like = await Like.findOneAndDelete({ userId: req.userId, postId: post._id });
        if (!like) throw new AppError('You have not liked this post', 404);

        // Decr user's like count — denormalized counter we designed in Phase 1
        await Post.findByIdAndUpdate(req.postId, { $inc: { likesCount: -1 } });

        return res.status(201).json({ message: 'Unliked' })
    } catch (error) {
        next(error)
    }
}