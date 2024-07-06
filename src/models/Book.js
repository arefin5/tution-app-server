const mongoose = require("mongoose");
const BookSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true },
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
    pdf: { type: String, default: "" },
    author: { type: String, default: "" },
    role: { type: String, default: "" },
    img: { type: String, default: "" },
    published: { type: String, default: "" },
  },
  { timestamps: true }
);
const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
