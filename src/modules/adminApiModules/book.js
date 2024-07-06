const Book = require("../../models/Book");
const User = require("../../models/User");
const fs = require("fs");
const appRoot = require("app-root-path");

const getBooks = async (req, res) => {
    const count = req.query.count
    const search = req.query.search?.toString() || ''
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await Book.countDocuments({
        $or: [
            { title: { $regex: search, $options: "i" } },
        ],
    })
    const data = await Book.find({
        $or: [
            { title: { $regex: search, $options: "i" } },

        ],
    })
        .sort({ _id: -1 })
        .select(
            "img title pdf"
        ).limit(100)
        .skip(100 * (page - 1));
    const pages = ((totalRecs / count) | 0) + 1;
    if (data) {
        res.status(200).send({
            data: data,
            lastPage: (page * count) >= totalRecs ? true : false,
            pages: pages,
            current: page,
        });
    } else {
        res.status(400).send({ data: "No data found" });
    }
};

const getBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.bookId });
        res.status(200).send({ book: book });
    } catch (err) {
        res.status(500).json(err);
    }
};
const createBook = async (req, res) => {
    try {
        let imgPath = "";
        let pdfPath = "";
        if (req.files.img !== undefined) {
            imgPath = req.files.img[0].path.replace("public", "").split("\\").join("/");
        }
        if (req.files.pdf !== undefined) {
            pdfPath = req.files.pdf[0].path.replace("public", "").split("\\").join("/");
        }
        const user = await User.findOne({ _id: req.params.requesterId });
        const newBook = await new Book({
            userID: user._id,
            title: req.body.title,
            author: user.name,
            role: user.role,
            desc: req.body.desc,
            img: imgPath,
            pdf: pdfPath,
        });
        await newBook.save();
        res.status(200).json({ msg: 'success' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'fail' });
    }
};

const editBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.bookId });
        let imgPath = book.img;
        let pdfPath = book.pdf;
        if (req.files.img !== undefined) {
            if (book.img.length !== 0) {
                fs.unlink("./public" + book.img.replace("public", ""), (err) => { });
            }
            imgPath = req.files.img[0].path.replace("public", "").split("\\").join("/");
        }
        if (req.files.pdf !== undefined) {
            if (book.pdf.length !== 0) {
                fs.unlink("./public" + book.pdf, (err) => { });
            }
            pdfPath = req.files.pdf[0].path.replace("public", "").split("\\").join("/");
        }
        book.title = req.body.title;
        book.desc = req.body.desc;
        book.img = imgPath;
        book.pdf = pdfPath;
        await book.save();
        res.status(200).json({ msg: 'success' });
    } catch (error) {
        res.status(400).json({ msg: 'fail' });
    }
};
const deleteBook = async (req, res) => {
    const bookId = req.params.bookId;
    try {
        const book = await Book.findOne({ _id: bookId });
        if (book.img.length !== 0) {
            fs.unlink(
                appRoot +
                "/" +
                "public" +
                book.img.replace("public", "").split("/").join("\\"),
                (err) => { }
            );
        }
        if (book.pdf.length !== 0) {
            fs.unlink(
                appRoot +
                "/" +
                "public" +
                book.pdf.replace("public", "").split("/").join("\\"),
                (err) => { }
            );
        }
        await Book.findOneAndDelete({ _id: bookId });
        res.status(200).json({ msg: 'success' });
    } catch (error) {
        res.status(400).json({ msg: 'fail' });
    }
};

module.exports = {
    createBook,
    editBook,
    deleteBook,
    getBooks,
    getBook,
}