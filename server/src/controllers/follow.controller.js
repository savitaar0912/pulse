import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { AppError } from "../middleware/errorHandler.js";
import Follow from "../models/Follow.js";
import { sendToUser } from "../services/sseService.js";

export const followUser = async (req, res, next) => {
  try {
    // check if user exists
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User Not Found", 404);

    //  check if already followed
    const existing = await Follow.findOne({
      followerId: req.userId,
      followingId: user._id,
    });
    if (existing) throw new AppError("Already Follow", 409);

    const follow = await Follow.create({
      followerId: req.userId,
      followingId: user._id,
    });

    await Promise.all([
      // who follows
      User.findByIdAndUpdate(req.userId, { $inc: { followingCount: 1 } }),

      // who gets followed
      User.findByIdAndUpdate(user._id, { $inc: { followersCount: 1 } }),
    ]);

    if (user._id.toString() != req.userId) {
      await Notification.create({
        type: "follow",
        recipientId: user._id, // the user gets follow request notiiffication
        actorId: req.userId, // the person who follow
      });

      sendToUser(follow._id, "new_follow", {
        type: "follow",
        recipientId: user._id, // the user gets follow request notiiffication
        actorId: req.userId, // the person who follow
      });
    }

    return res.status(201).json({ follow });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User Not Found", 404);

    const follow = await Follow.findOneAndDelete({
      followerId: req.userId,
      followingId: user._id,
    });
    if (!follow) throw new AppError("Not Following the user", 409);

    await Promise.all([
      User.findByIdAndUpdate(req.userId, { $inc: { followingCount: -1 } }),
      User.findByIdAndUpdate(user._id, { $inc: { followersCount: -1 } }),
    ]);

    return res.status(200).json({ message: "Unfollowed" });
  } catch (error) {
    next(error);
  }
};
