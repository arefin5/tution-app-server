const multer = require("multer");
const path = require("path");
const fs = require("fs");

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const avatarPath = `public/uploads/user/avatar`
    const coverPath = `public/uploads/user/cover`
    fs.mkdirSync(avatarPath, { recursive: true })
    fs.mkdirSync(coverPath, { recursive: true })
    if (file.fieldname == "avatar") {
      cb(null, avatarPath);
    } else if (file.fieldname == "cover") {
      cb(null, coverPath);
    }
  },
  filename: function (req, file, cb) {
    if (file.fieldname == "avatar") {
      const fileExt = path.extname(file.originalname);
      const name =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, name + fileExt);
    } else if (file.fieldname == "cover") {
      const fileExt = path.extname(file.originalname);
      const name =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, name + fileExt);
    }
  },
});

const sliderStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const sliderImgPath = `public/uploads/app/sliders`
    fs.mkdirSync(sliderImgPath, { recursive: true })
    cb(null, sliderImgPath);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const name =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();
    cb(null, name + fileExt);
  },
});
const serviceStore = multer.diskStorage({
  destination: function (req, file, cb) {
    const servicesImagePath = `public/uploads/app/service`
    fs.mkdirSync(servicesImagePath, { recursive: true })
    cb(null, servicesImagePath);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const name =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();
    cb(null, name + fileExt);
  },
});
const adsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const adsImgPath = `public/uploads/app/ads`
    fs.mkdirSync(adsImgPath, { recursive: true })
    cb(null, adsImgPath);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const name =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();
    cb(null, name + fileExt);
  },
});

const bookStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const imgPath = `public/uploads/app/books/img`
    const pdfPath = `public/uploads/app/books/pdf`
    fs.mkdirSync(imgPath, { recursive: true })
    fs.mkdirSync(pdfPath, { recursive: true })

    if (file.fieldname == "img") {
      cb(null, imgPath);
    } else if (file.fieldname == "pdf") {
      cb(null, pdfPath);
    }
  },
  filename: async function (req, file, cb) {
    if (file.fieldname == "img") {
      const fileExt = path.extname(file.originalname);
      const name =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, name + fileExt);
    } else if (file.fieldname == "pdf") {
      const fileExt = path.extname(file.originalname);
      const name =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, name + fileExt);
    }
  },
});
const heroStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const imgPath = `public/uploads/app/settings/img`

    fs.mkdirSync(imgPath, { recursive: true })

    cb(null, imgPath);

  },
  filename: async function (req, file, cb) {

    const fileExt = path.extname(file.originalname);
    const name =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();
    cb(null, name + fileExt);

  },
});

// Uploader middlewares--------------
const userUpload = multer({
  storage: userStorage,
  limits: {
    fileSize: 2000000,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

const sliderUpload = multer({
  storage: sliderStorage,
  limits: {
    fileSize: 2000000,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      console.log(req.body)
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
}).single("img");

const serviceUpload = multer({
  storage: serviceStore,
  limits: {
    fileSize: 2000000,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      console.log(req.body)
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
}).single("img");

const adsUpload = multer({
  storage: adsStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/gif" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
}).single("img");

const bookUpload = multer({
  storage: bookStorage,
  fileFilter: async (req, file, cb) => {
    if (file.fieldname == "img") {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    } else if (file.fieldname == "pdf") {
      if (file.mimetype == "application/pdf") {
        cb(null, true);
      } else {
        cb(null, false);
      }
    } else {
      cb(null, false);
    }
  },
}).fields([
  { name: "img", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

const heroUpload = multer({
  storage: heroStorage,
  fileFilter: async (req, file, cb) => {

    if (file.mimetype == "image/svg+xml") {
      cb(null, true);
    } else {
      cb(null, false);
    }

  },
}).fields([
  { name: "mobile", maxCount: 1 },
  { name: "desktop", maxCount: 1 },
  { name: "m", maxCount: 1 },
  { name: "d", maxCount: 1 },
]);

module.exports = {
  userUpload,
  sliderUpload,
  bookUpload,
  adsUpload,
  heroUpload,
  serviceUpload
  
};