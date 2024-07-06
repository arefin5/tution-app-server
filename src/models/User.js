const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    role: { type: String, required: true, default: "user", enum: ['user', 'tutor', 'media', 'admin', 'super'] },
    email: { type: String, default: "" },
    avatarImg: { type: String, default: "" },
    coverImg: { type: String, default: "" },
    name: { type: String, default: "" },
    age: { type: String, default: "" },
    gender: {
       type: String, default: "male"},
    bio: { type: String, default: "" },
    division: { type: String, default: "" },
    district: { type: String, default: "" },
    area: { type: String, default: "" },
    subjects: { type: String, default: "" },
    class: { type: String, default: "" },
    institute: { type: String, default: "" },
    department: { type: String, default: "" },
    days: { type: String, default: "" },
    premiumEnd: { type: Number, default: 0 },
    subEnd: { type: String, default: '' },
    refs: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    lastActive: { type: String },
    salary: { type: Number, default: 0, },
    areas: [{ type: String }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    followings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],

    edu: [{
      department: String,
      year: String,
      institute: String,

    }],
    experience: [{
      title: String,
      desc: String,
      year: String,

    }],
    social: [{
      icon: { type: String },
      link: { type: String }
    }],
  },

  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
