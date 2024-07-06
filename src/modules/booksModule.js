const Book = require("../models/Book");
const getBooks = async (req, res) => {
  const searchString = req.query.search.toString();

  try {
    const books = await Book.find({
      $or: [{ title: { $regex: searchString, $options: "i" } }],
    }).select("img title pdf");
    const page = parseInt(req.query.page) || 1;
    const pages = ((books.reverse().length / 20) | 0) + 1;
    const startIndex = (page - 1) * 20;
    const endIndex = page * 20;
    res.status(200).send({
      data: books.reverse().slice(startIndex, endIndex) || "No data found",
      lastPage: endIndex >= books.reverse().length ? true : false,
      pages: pages,
      current: page,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
const getBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId }).populate('userID', "avatarImg name phone role");
    res.status(200).send({ book: book,});
  } catch (err) {
    res.status(500).json(err);
  }
};
module.exports = {
  getBooks,
  getBook,
};
