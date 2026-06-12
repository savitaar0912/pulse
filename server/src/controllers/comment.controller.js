import { AppError } from "../middleware/errorHandler.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import { sendToUser } from "../services/sseService.js";

export const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw new AppError("Post Not Found", 404);

    const comment = await Comment.create({
      userId: req.userId,
      postId: post._id,
      content: req.body.comment,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });

    if (post.userId.toString() !== req.userId) {
      await Notification.create({
        type: "comment",
        recipientId: post.userId, // the post author gets notified
        actorId: req.userId, // the person who liked
        postId: post._id,
      });

      sendToUser(post.userId, "new_comment", {
        type: "comment",
        postId: post._id,
        actorId: req.userId,
      });
    }

    return res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) throw new AppError("Comment Not Found", 404);

    if (comment.userId.toString() !== req.userId) {
      throw new AppError("Not Authorized to Delete", 403);
    }

    if (comment.userId.toString() === req.userId) {
      await Comment.findByIdAndDelete(req.params.commentId);
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentsCount: -1 },
      });
    }

    return res.json({ message: "Comment Deleted" });
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }).populate('userId');
    return res.json({ comments });
  } catch (err) {
    next(err);
  }
};
