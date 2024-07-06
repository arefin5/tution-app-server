const mongoose = require("mongoose");
const NotificationSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  postId: { type: String, default: "" },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  to: { type: Array, default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 3600 * 24 * 30 },
  },
});
const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
