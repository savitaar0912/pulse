import Post from '../models/Post.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { cloudinary } from '../config/cloudinary.js';

export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;

    // req.file is populated by multer — it's undefined if no image was uploaded
    const imageUrl      = req.file?.path || '';
    const imagePublicId = req.file?.filename || '';

    const post = await Post.create({
      userId:  req.userId,    // set by protect middleware — never trust client for this
      content,
      imageUrl,
      imagePublicId,
    });

    // Increment user's post count — denormalized counter we designed in Phase 1
    await User.findByIdAndUpdate(req.userId, { $inc: { postsCount: 1 } });

    // Populate userId so frontend gets author info in the same response
    await post.populate('userId', 'username displayName avatarUrl');

    res.status(201).json({ post });
  } catch (err) {
    // If MongoDB save fails after Cloudinary upload, clean up the orphaned image
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
    }
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw new AppError('Post not found', 404);

    // Authorization check — only the author can delete
    if (post.userId.toString() !== req.userId) {
      throw new AppError('Not authorized', 403);
    }

    // Delete image from Cloudinary first
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    await post.deleteOne();
    await User.findByIdAndUpdate(req.userId, { $inc: { postsCount: -1 } });

    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const { cursor, limit = 10 } = req.query;

    // cursor-based pagination — cursor is the _id of the last post we saw
    const query = cursor ? { _id: { $lt: cursor } } : {};

    const posts = await Post.find(query)
      .sort({ _id: -1 })                    // newest first — _id contains timestamp
      .limit(Number(limit) + 1)             // fetch one extra to know if there's a next page
      .populate('userId', 'username displayName avatarUrl');

    // If we got limit+1 results, there are more pages
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();              // remove the extra one before sending

    const nextCursor = hasMore ? posts[posts.length - 1]._id : null;

    res.json({ posts, nextCursor, hasMore });
  } catch (err) {
    next(err);
  }
};

export const getSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username displayName avatarUrl');
    if (!post) throw new AppError('Post not found', 404);
    res.json({ post });
  } catch (err) {
    next(err);
  }
};
