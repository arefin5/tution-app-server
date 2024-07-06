const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      to: { $in: req.body.userId },
    })
      .select("title postId createdAt")
      .populate("author", "avatarImg _id name");
    const page = parseInt(req.query.page) || 1;
    const pages = ((notifications.length / 20) | 0) + 1;
    const startIndex = (page - 1) * 20;
    const endIndex = page * 20;
    res.status(200).send({
      notifications:
        notifications.reverse().slice(startIndex, endIndex) ||
        "No notifications found",
      lastPage: endIndex >= notifications.length ? true : false,
      pages: pages,
      current: page,
    });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

module.exports = {
  getNotifications,
};
