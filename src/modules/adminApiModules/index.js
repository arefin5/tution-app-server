const User = require("../../models/User");
const Post = require("../../models/Post");
const TRX = require("../../models/TRX");
const Book = require("../../models/Book");
const Slider = require("../../models/Slider");
const Notification = require("../../models/Notification");

//---------------

const dotenv = require("dotenv");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const moment = require("moment");
const fs = require("fs");
const appRoot = require("app-root-path");
const Report = require("../../models/Report");
const Contact = require("../../models/Contact");
const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const Application = require("../../models/Application");
const FAQ = require("../../models/FAQ");
const Testimonial = require("../../models/Testimonial");

//---------------
const jsonDB = new JsonDB(new Config("settingsData", true, false, "/"));
dotenv.config();


//--------------
const getFooterLinks = async (req, res) => {
  const json = fs.readFileSync("./settingsData.json", "utf8");
  const data = JSON.parse(json);
  try {
    res.status(200).json({ links: data.footerLinks });
  } catch (error) {
    res.status(400).json("404");
  }
};
const getTerms = async (req, res) => {
  const json = fs.readFileSync("./policiesData.json", "utf8");
  const data = JSON.parse(json);
  try {
    res.status(200).json({ html: data.terms });
  } catch (error) {
    res.status(400).json("404");
  }
};
const getPolicies = async (req, res) => {
  const json = fs.readFileSync("./policiesData.json", "utf8");
  const data = JSON.parse(json);

  try {
    res.status(200).json({ html: data.policies });
  } catch (error) {
    res.status(400).json("404");
  }
};
const getDisclaimers = async (req, res) => {
  const json = fs.readFileSync("./policiesData.json", "utf8");
  const data = JSON.parse(json);

  try {
    res.status(200).json({ html: data.disclaimers });
  } catch (error) {
    res.status(400).json("404");
  }
};
const getAbout = async (req, res) => {
  const json = fs.readFileSync("./policiesData.json", "utf8");
  const data = JSON.parse(json);

  try {
    res.status(200).json({ html: data.about });
  } catch (error) {
    res.status(400).json("404");
  }
};
const getPromote = async (req, res) => {
  const json = fs.readFileSync("./policiesData.json", "utf8");
  const data = JSON.parse(json);
  try {
    res.status(200).json({ html: data.promote });
  } catch (error) {
    res.status(400).json("404");
  }
};







const reportDelete = async (req, res) => {
  const reportId = req.params.reportId;
  try {
    await Report.findOneAndDelete({ _id: reportId });
    res.status(200).json({ msg: 'success' })
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};





const deleteAllStudents = async (req, res) => {
  const users = await User.find({ role: 'user' })
  if (users.length > 0) {

    users.forEach((user) => {
      if (user.avatarImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.avatarImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
      if (user.coverImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.coverImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
    })
    await User.deleteMany({ role: 'user' }).then(function () {
      res.status(200).json({ msg: 'success' })
    }).catch(function (error) {
      res.status(400).json({ err: error })
      console.log(error); // Failure
    });
  } else {
    res.status(200).json({ msg: 'success' })
  }
};
const deleteAllTutors = async (req, res) => {
  const users = await User.find({ role: 'tutor' })
  if (users.length > 0) {

    users.forEach((user) => {
      if (user.avatarImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.avatarImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
      if (user.coverImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.coverImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
    })
    await User.deleteMany({ role: 'tutor' }).then(function () {
      res.status(200).json({ msg: 'success' })
    }).catch(function (error) {
      res.status(400).json({ err: error })
      console.log(error); // Failure
    });
  } else {
    res.status(200).json({ msg: 'success' })
  }
};
const deleteAllMedias = async (req, res) => {
  const users = await User.find({ role: 'media' })
  if (users.length > 0) {

    users.forEach((user) => {
      if (user.avatarImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.avatarImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
      if (user.coverImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.coverImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
    })
    await User.deleteMany({ role: 'media' }).then(function () {
      res.status(200).json({ msg: 'success' })
    }).catch(function (error) {
      res.status(400).json({ err: error })
      console.log(error); // Failure
    });
  } else {
    res.status(200).json({ msg: 'success' })
  }
};
const deleteAllUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: 'super' } })
  if (users.length > 0) {

    users.forEach((user) => {
      if (user.avatarImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.avatarImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
      if (user.coverImg.length !== 0) {
        fs.unlink(
          appRoot +
          "/" +
          "public" +
          user.coverImg.replace("public", "").split("/").join("\\"),
          (err) => { }
        );
      }
    })
    await User.deleteMany({ role: { $ne: 'super' } }).then(function () {
      res.status(200).json({ msg: 'success' })
    }).catch(function (error) {
      res.status(400).json({ err: error })
      console.log(error); // Failure
    });
  } else {
    res.status(200).json({ msg: 'success' })
  }
};

const deleteAllPosts = async (req, res) => {
  await Post.deleteMany({}).then(function () {
    res.status(200).json({ msg: 'success' })
  }).catch(function (error) {
    res.status(400).json({ err: error })
    console.log(error); // Failure
  });
};
const deleteAllPending = async (req, res) => {
  await Post.deleteMany({ approved: false }).then(function () {
    res.status(200).json({ msg: 'success' })
  }).catch(function (error) {
    res.status(400).json({ err: error })
    console.log(error); // Failure
  });
};
const deleteAllChats = async (req, res) => {
  Chat.deleteMany({ approved: false }).then(function () {
    res.status(200).json({ msg: 'success' })
  }).catch(function (error) {
    res.status(400).json({ err: error })
    console.log(error); // Failure
  });
};
const deleteAllMessages = async (req, res) => {
  Message.deleteMany({ approved: false }).then(function () {
    res.status(200).json({ msg: 'success' })
  }).catch(function (error) {
    res.status(400).json({ err: error })
    console.log(error); // Failure
  });
};
const deleteAllNotification = async (req, res) => {
  Notification.deleteMany({ approved: false }).then(function () {
    res.status(200).json({ msg: 'success' })
  }).catch(function (error) {
    res.status(400).json({ err: error })
    console.log(error); // Failure
  });
};
const deleteAllTRX = async (req, res) => {
  Notification.deleteMany({ approved: false }).then(function () {
    res.status(200).json({ msg: 'success' })
  }).catch(function (error) {
    res.status(400).json({ err: error })
    console.log(error); // Failure
  });
};

// View controllers----------
const index = async (req, res) => {
  try {
    const trxs = await TRX.find({
      status: "Successful",
      createdAt: { $gte: new Date(moment(Date.now()).format("YYYY-MM")) },
    }).select("_id phone plan createdAt amount status");
    const jsonFile = fs.readFileSync("./dashboardData.json", "utf8");
    const data = JSON.parse(jsonFile);
    const totalUser = await User.count()
    const totalStudents = await User.count({ role: 'user' })
    const totalTutors = await User.count({ role: 'tutor' })
    const totalMedias = await User.count({ role: 'media' })
    const totalPending = await Post.count({ approved: false })
    const totalPosts = await Post.count()
    const totalLogin = data.login;
    const totalReg = data.reg;

    res.status(200).json({
      totalLogin: totalLogin,
      totalReg: totalReg,
      totalUsers: totalUser,
      totalStudents: totalStudents,
      totalTutors: totalTutors,
      totalPending: totalPending,
      totalPosts: totalPosts,
      totalMedias: totalMedias,
    });
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
};

//-----------------

const reportsView = async (req, res) => {
  try {
    const count = req.query.count
    const search = req.query.search?.toString() || ''
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await Report.countDocuments({
      $or: [
        { reason: { $regex: search, $options: "i" } },
      ],
    })
    const data = await Report.find({
      $or: [
        { reason: { $regex: search, $options: "i" } },

      ],
    })
      .sort({ _id: -1 })
      .select(
        "reason createdAt by type"
      )
      .limit(100)
      .skip(100 * (page - 1))
      .populate(
        "by",
        "avatarImg name phone role"
      );
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
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};
const reportView = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.reportId }).populate(
      "by",
      "avatarImg name phone role"
    );
    res.status(200).json({ report: report });
  } catch (error) {
    res.status(400).json("404");
  }
};

const trxView = async (req, res) => {
  const trxs = await TRX.find().select(
    "_id phone plan createdAt amount status"
  );
  res.render("trxs", { trxs: trxs });
};


const newContact = async (req, res) => {
  try {
    console.log(req.body)
    const contact = new Contact({
      name: req.body.name,
      company: req.body.company,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subjects,
      desc: req.body.desc,
      lan: req.body.lan,
      lon: req.body.lon,
    });
    contact.save();
    res.status(200).json({ msg: "success" });
  } catch (error) {
    res.status(400).json({ msg: "error" });
  }
};

const contactsView = async (req, res) => {
  try {
    const count = req.query.count
    const search = req.query.search?.toString() || ''
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await Contact.countDocuments({
      $or: [
        { subject: { $regex: search, $options: "i" } },
      ],
    })
    const data = await Contact.find({
      $or: [
        { subject: { $regex: search, $options: "i" } },

      ],
    })
      .sort({ _id: -1 })
      .select(
        "subject createdAt phone"
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
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};
const contactView = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.contactId });
    res.status(200).json({ msg: 'success', contact: contact });
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};
const contactDelete = async (req, res) => {
  const contactId = req.params.contactId;
  try {
    await Contact.findOneAndDelete({ _id: contactId });
    res.status(200).json({ msg: 'success' });
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};
//----------------------------------------------------------------
const applicationsView = async (req, res) => {
  try {
    const count = req.query.count
    const search = req.query.search?.toString() || ''
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await Application.countDocuments({
      $or: [
        { location: { $regex: search, $options: "i" } },
      ],
    })
    const data = await Application.find({
      $or: [
        { location: { $regex: search, $options: "i" } },

      ],
    })
      .sort({ _id: -1 })
      .select(
        "type _id createdAt status"
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
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};
const applicationView = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id }).populate(
      "userId",
      "avatarImg name phone role"
    );
    res.status(200).json({ msg: 'success', application: application });
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};
const applicationDelete = async (req, res) => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id });
    res.status(200).json({ msg: 'success' });
  } catch (error) {
    res.status(200).json({ msg: 'fail' })
  }
};
//----------------------------------------------------------------


const getSlides = async (req, res) => {
  try {
    const slides = await Slider.find().select("heading text img btn url");
    res.send({ slides: slides.reverse() });
  } catch (error) {
    res.status(400).json("404");
  }
};
const getStats = async (req, res) => {
  try {
    const settingsData = fs.readFileSync("./settingsData.json", "utf8");
    const settings = JSON.parse(settingsData);
    const faqs = await FAQ.find();
    const testimonials = await Testimonial.find();
    const postsArray = await Post.find({ approved: true }).limit(3).sort({ createdAt: -1 });
    const tutorsArray = await User.find({ role: 'tutor', premiumEnd: { $gte: Number(Date.now()) } }).limit(10).sort({ createdAt: -1 });
    const books = await Book.countDocuments();
    const students = await User.countDocuments();
    const tutors = await User.countDocuments({ role: "tutor" });
    const posts = await Post.countDocuments();
    res
      .status(200)
      .json({
        books: books,
        students: Number(students) + 100000,
        tutors: Number(tutors) + 6000,
        posts: posts,
        postsArray: postsArray,
        tutorsArray: tutorsArray,
        faqs: faqs,
        testimonials: testimonials,
        hero: {
          mobile: settings.hero.mobile,
          desktop: settings.hero.desktop,
          m: settings.hero.m,
          d: settings.hero.d
        }
      });
  } catch (error) {
    console.log(error)
    res.status(400).json("404");
  }
};


module.exports = {
  newContact,
  index,
  trxView,

  getSlides,
  getStats,
  reportsView,
  reportView,
  reportDelete,
  contactsView,
  contactView,
  contactDelete,
  applicationsView,
  applicationView,
  applicationDelete,


  deleteAllUsers,
  deleteAllStudents,
  deleteAllTutors,
  deleteAllMedias,
  deleteAllPosts,
  deleteAllPending,
  deleteAllChats,
  deleteAllMessages,
  deleteAllNotification,
  deleteAllTRX,
  getFooterLinks,
  getTerms,
  getPolicies,
  getDisclaimers,
  getAbout,
  getPromote,
};
