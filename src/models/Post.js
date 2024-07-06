const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  class: String,
  days: String,
  desc: String,
  lang: String,
  salary: { type: Number, default: 0 },
  subjects: String,
  division: String,
  district: String,
  area: String,
  showPhone: Boolean,
  lan: String,
  lon: String,
  phone: String,
  name: String,
  email: String,
  gender: String,
  type: { type: String, default: "user", enum: ['user', 'media'] },
  applied: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  liked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],


  approved: Boolean,
  negotiable: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 3600 * 24 * 365 * 5 },
  },
}
);
const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
