import Notification from "../models/Notification.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.userId })
      .sort({ _id: -1 })
      .limit(20)
      .populate("actorId", "username displayName avatarUrl");

    return res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recepientId: req.userId, isRead: false },
      {
        $set: { isRead: true },
      },
    );

    return res.json({ message: "Notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
