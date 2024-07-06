const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema(
  {
    desc: { type: String, default: "" },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 3600 * 24 * 30 * 6 },
    }
  },

);
const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
