const User = require("../models/User");
const Post = require("../models/Post");
const Rating = require("../models/Rating");
const OTPModel = require('./../models/OTP');
//-------------------------------
const jwt = require("jsonwebtoken");
const request = require('request');
const axios = require("axios").default;
const dotenv = require("dotenv");
const otpGenerator = require('otp-generator');
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
//---------------
var dashboardDB = new JsonDB(new Config("dashboardData", true, false, "/"));
const bcrypt = require("bcrypt");
const fs = require("fs");
const Report = require("../models/Report");
const appRoot = require("app-root-path");
//-------------------------------
dotenv.config();
const jwt_secret = process.env.JWT_SECRET;
const { firebaseAdmin } = require("../utils/firebase");
const { default: moment } = require("moment");

//-------------------------------
const getLoginType = async (req, res) => {
  const settingsFile = fs.readFileSync("./settingsData.json", "utf8");
  const settings = JSON.parse(settingsFile)
  const loginType = settings.sms.loginType;
  return res.status(200).send({ type: loginType });


}
const sendOTP = async (req, res) => {
  const phone = req.body.phone;
  const settingsFile = fs.readFileSync("./settingsData.json", "utf8");
  const settings = JSON.parse(settingsFile)

  const smsAPIToken = settings.sms.smsToken;
  const smsId = settings.sms.smsId;
  if (phone.length == 13) {
    const OTP = otpGenerator.generate(6, {
      digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
    });
    console.log(OTP);
    if (smsAPIToken.length !== 0) {
      var nocOptions = {
        'method': 'POST',
        'url': 'https://app.smsnoc.com/api/v3/sms/send',
        'headers': {
          'Authorization': `Bearer ${smsAPIToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "recipient": `${phone}`,
          "sender_id": `${smsId}`,
          "type": "plain",
          "message": `Your TuitionApp OTP Code is ${OTP}, Do not share to anybody`
        })
      };
      request(nocOptions, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        return res.status(500).send({ msg: "Something Went wrong", ref: refUser });
      });
    } else {
      console.log(OTP);
    }
    const refUser = req.query.ref
    const hashOTP = await bcrypt.hash(OTP, 10);
    const otp = new OTPModel({ phone: phone, otp: hashOTP });
    await otp.save();
    return res.status(200).send({ msg: "We\'ve sent an OTP to your phone number.Please provide it bellow", ref: refUser });
  } else {
    return res.status(400).send({ msg: "Send an valid phone number (must include 88)" });
  }

}
const LoginOrCreateUserSMS = async (req, res) => {
  let reqPhone = req.body.phone;
  let reqOTP = req.body.otp;
  const dashboardDataFile = fs.readFileSync("./dashboardData.json", "utf8");
  const data = JSON.parse(dashboardDataFile)
  const totalLogin = data.login;
  const totalReg = data.reg;
  if (reqPhone && reqOTP) {
    try {
      const otpHolder = await OTPModel.find({ phone: reqPhone });
      if (otpHolder.length === 0) {
        return res.status(400).send("You use an Expired OTP!");
      } else {
        const rightOtpFind = otpHolder[otpHolder.length - 1];
        const validOTP = await bcrypt.compare(reqOTP, rightOtpFind.otp);
        const user = await User.findOne({ phone: reqPhone });
        if (user && rightOtpFind.phone === req.body.phone && validOTP) {
          const payload = {
            userId: user._id
          }
          try {
            dashboardDB.push('/login', Number(totalLogin) + 1);
          } catch { }
          // @ts-ignore
          const token = jwt.sign(payload, jwt_secret, { expiresIn: 60 * 60 * 24 * 30 });
          await OTPModel.deleteMany({ phone: rightOtpFind.phone });
          return res.status(200).json({ authType: "login", token: token, user: user })
        } else if (rightOtpFind.phone === req.body.phone && validOTP) {
          const newUser = await new User({ phone: reqPhone, refs: 0, role: 'user' })
          await newUser.save();
          const payload = {
            userId: newUser._id
          }
          // @ts-ignore
          const token = jwt.sign(payload, jwt_secret, { expiresIn: 60 * 60 * 24 * 30 });
          await OTPModel.deleteMany({ phone: rightOtpFind.phone });
          try {
            dashboardDB.push('/reg', Number(totalReg) + 1);
          } catch { }
          try {
            const refUser = await User.findOne({ _id: req.query.ref });
            refUser.refs = Number(refUser.refs) + 1;
            refUser.save();
          } catch { }
          return res.status(200).json({ authType: "registration", token: token, user: newUser })
        } else {
          return res.status(200).send({ msg: "You use an Expired OTP!" });
        }
      }
    } catch (error) {
      return res.status(200).send({ msg: "You use an Expired OTP!" });

    }
  } else {
    res.status(200).send({ msg: "You didn\'t send valid data" });
  }
}
const LoginOrCreateUser = async (req, res) => {
  let idToken = req.body.idToken;
  const dashboardDataFile = fs.readFileSync("./dashboardData.json", "utf8");
  const data = JSON.parse(dashboardDataFile);
  const totalLogin = data.login;
  const totalReg = data.reg;
  if (idToken) {
    try {
      await firebaseAdmin.auth().verifyIdToken(idToken).then(async (dec) => {
        const query = Number(dec.phone_number).toString();
        const user = await User.findOne({ phone: query });
        if (user) {
          const payload = {
            userId: user._id,
          };
          dashboardDB.push("/login", Number(totalLogin) + 1);
          // @ts-ignore
          const token = jwt.sign(payload, jwt_secret, {
            expiresIn: 60 * 60 * 24 * 30 * 6,
          });
          res.status(200).json({ authType: "login", token: token, user: user });
        } else {
          const newUser = await new User({
            phone: query,
            refs: 0,
            role: "user",
            gender: "male",
          });
          await newUser.save();
          const payload = {
            userId: newUser._id,
          };
          // @ts-ignore
          const token = jwt.sign(payload, jwt_secret, {
            expiresIn: 60 * 60 * 24 * 30 * 6,
          });
          dashboardDB.push("/reg", Number(totalReg) + 1);
          res
            .status(200)
            .json({ authType: "registration", token: token, user: newUser });
        }
      })
    } catch (error) {
      return res.status(200).send({ msg: "You use an Expired OTP!" });
    }
  } else {
    res.status(200).send({ msg: "You didn't send valid data" });
  }
};

const updateUser = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ _id: req.params.userId });
  } catch {
    res.status(400).send({ msg: "Not found" });
  }
  let avatarImgPath = user.avatarImg;
  let coverImgPath = user.coverImg;
  const social = JSON.parse(req.body.social);
  let newSocials = [];
  for (let x = 0; x < social.length; x++) {
    var obj = social[x];
    if (obj.link == "") {
    } else {
      var newObj = {
        icon: obj.icon,
        link: obj.link.startsWith("http") ? obj.link : "https://" + obj.link,
      };
      newSocials = [...newSocials, newObj];
    }
  }

  if (req.files.avatar !== undefined) {
    if (user.avatarImg.length !== 0) {
      fs.unlink("./public" + user.avatarImg, (err) => {
        console.log(err);
      });
    }
    avatarImgPath = req.files.avatar[0].path
      .replace("public", "")
      .split("\\")
      .join("/");
  }
  if (req.files.cover !== undefined) {
    if (user.coverImg.length !== 0) {
      fs.unlink("./public" + user.coverImg, (err) => {
        console.log(err);
      });
    }
    coverImgPath = req.files.cover[0].path
      .replace("public", "")
      .split("\\")
      .join("/");
  }
  user.name = req.body.name;
  user.age = req.body.age;
  user.email = req.body.email;
  user.gender = req.body.gender == '' ? 'male' : (req.body.gender).toLowerCase();
  user.bio = req.body.bio;
  user.division = req.body.division;
  user.district = req.body.district;
  user.areas = JSON.parse(req.body.areas);
  user.area = req.body.area;
  user.subjects = req.body.subjects;
  user.class = req.body.class;
  user.institute = req.body.institute;
  user.department = req.body.department;
  user.days = req.body.days;
  user.edu = JSON.parse(req.body.edu);
  user.experience = JSON.parse(req.body.experience);
  user.salary = Number(req.body.salary) || 0;
  user.social = newSocials;
  user.avatarImg = avatarImgPath;
  user.coverImg = coverImgPath;
  await user.save();
  res.status(200).send({ user: user });
};
const becomeTutor = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.requesterId });
    user.role = "tutor";
    await user.save();
    res.status(200).send({ user: user });
  } catch (e) {
    console.log(e)
    res.status(400).send({ msg: "Not found" });
  }

};
const getMedias = async (req, res) => {
  const { div, dis, upo, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const searchString = search.toString();
  const Model = User;
  //---
  const match = (div.length !== 0 && dis.length !== 0 && upo.length !== 0) ?
    {
      role: "media",
      division: div,
      district: dis,
      areas: { $in: [upo] },
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { institute: { $regex: searchString, $options: "i" } },
        { department: { $regex: searchString, $options: "i" } },
      ],

    } : (div.length !== 0 && dis.length !== 0) ?
      {
        role: "media",
        division: div,
        district: dis,
        $or: [
          { name: { $regex: searchString, $options: "i" } },
          { institute: { $regex: searchString, $options: "i" } },
          { department: { $regex: searchString, $options: "i" } },
        ],
      } : (div.length !== 0) ?
        {
          role: "media",
          division: div,
          $or: [
            { name: { $regex: searchString, $options: "i" } },
            { institute: { $regex: searchString, $options: "i" } },
            { department: { $regex: searchString, $options: "i" } },
          ],
        } :
        {
          role: "media",
          $or: [
            { name: { $regex: searchString, $options: "i" } },
            { institute: { $regex: searchString, $options: "i" } },
            { department: { $regex: searchString, $options: "i" } },
          ],
        }
  //---
  const data = await Model.aggregate([
    {
      $match: match
    },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'to',
        as: 'ratings'
      }
    },
    {
      $addFields: {
        starsCount: { $sum: '$ratings.stars' },
        followersCount: { $size: '$followers' },
        ratingsCount: { $size: '$ratings' },
      }
    },
    {
      $sort: { followersCount: -1 }
    },
    {
      $skip: (page - 1) * 34
    },
    {
      $limit: 34
    },
    {
      $project: {
        ratings: 0,
        education: 0,
        followers: 0,

      }
    },
    {
      $project: {
        starsCount: 1,
        department: 1,
        institute: 1,
        ratingsCount: 1,
        name: 1,
        avatarImg: 1,
        verified: 1,
        gender: 1,
        phone: 1,
        bio: 1,
      }
    }
  ]);
  const totalDocs = await Model.countDocuments(match);
  const pages = Math.ceil(totalDocs / 24)
  if (data) {
    res.status(200).send({
      data: data,
      lastPage: page * 24 >= data.length ? true : false,
      pages: pages,
      current: page,
    });
  } else {
    res.status(400).send({ data: "No data found" });
  }
};
const getTutors = async (req, res) => {
  try {

    const { div = '', dis = '', upo = '', gender = 'all', search = '', premium = '0', min, max } = req.query;
    const page = parseInt(req.query.page) || 1;
    const searchString = search.toString();
    const Model = User;
    //---
    const query = {
      role: "tutor",
      gender: { $regex: gender == "all" ? "" : gender || "", $options: "i" },
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { institute: { $regex: searchString, $options: "i" } },
        { department: { $regex: searchString, $options: "i" } },
      ],
    };
    if (div.length !== 0) {
      query.division = div;
    }

    if (dis.length !== 0) {
      query.district = dis;
    }

    if (upo.length !== 0) {
      query.areas = { $in: [upo] };
    }
    if (premium == '1' || premium == 1) {
      query.premiumEnd = { $gte: Number(Date.now()) };
    }
    if (min && max) {
      query.salary = { $gte: Number(min) - 1 || 0, $lte: Number(max) + 1 || 9999999 };
    }
    //---
    console.log(query);
    const premiumArray = (premium == '1' || premium == 1) ? [] : await Model.aggregate([
      {
        $match: {
          role: "tutor",
          gender: { $regex: gender == "all" ? "" : gender || "", $options: "i" },
          premiumEnd: { $gte: Number(Date.now()) }
        }
      },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'to',
          as: 'ratings'
        }
      },
      {
        $addFields: {
          starsCount: { $sum: '$ratings.stars' },
          followersCount: { $size: '$followers' },
          ratingsCount: { $size: '$ratings' },
          lastActiveDate: { $toLong: "$lastActive" }
        }
      },

      {
        $sort: {
          status: -1,
          followersCount: -1,
          lastActiveDate: -1,
        }
      },
      {
        $skip: (page - 1) * 10
      },
      {
        $limit: 10
      },
      {
        $project: {
          ratings: 0,
          education: 0,
          followers: 0,

        }
      },
      {
        $project: {
          starsCount: 1,
          department: 1,
          institute: 1,
          status: 1,
          edu: 1,
          premiumEnd: 1,
          ratingsCount: 1,
          name: 1,
          avatarImg: 1,
          verified: 1,
          gender: 1
        }
      }
    ]);

    const data = await Model.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'to',
          as: 'ratings'
        }
      },
      {
        $addFields: {
          starsCount: { $sum: '$ratings.stars' },
          followersCount: { $size: '$followers' },
          ratingsCount: { $size: '$ratings' },
          lastActiveDate: { $toLong: "$lastActive" }
        }
      },

      {
        $sort: {
          status: -1,
          followersCount: -1,
          lastActiveDate: -1,
        }
      },
      {
        $skip: (page - 1) * 34
      },
      {
        $limit: 34
      },
      {
        $project: {
          ratings: 0,
          education: 0,
          followers: 0,

        }
      },
      {
        $project: {
          starsCount: 1,
          department: 1,
          institute: 1,
          ratingsCount: 1,
          name: 1,
          status: 1,
          edu: 1,
          premiumEnd: 1,
          avatarImg: 1,
          verified: 1,
          gender: 1
        }
      }
    ]);
    const totalDocs = await Model.countDocuments(query);
    const pages = Math.ceil(totalDocs / 34)
    if (data) {
      res.status(200).send({
        data: data,
        premium: premiumArray,
        lastPage: page * 24 >= data.length ? true : false,
        pages: pages,
        current: page,
      });
    } else {
      res.status(400).send({ data: "No data found" });
    }
  } catch (error) {
    console.log(error)
    res.status(400).send({ data: "No data found" });
  }
};
///----------------------------------------------------------------
///----------------------------------------------------------------
const getTutorsMyLoc = async (req, res) => {
  const user = await User.findOne({ _id: req.body.requesterId });
  const searchString = req.query.search.toString();
  const Model = User;
  const page = parseInt(req.query.page) || 1;

  //---
  const match = (
    user.division.length !== 0 &&
    user.district.length !== 0 &&
    user.areas.length !== 0
  ) ?
    {
      role: "tutor",
      division: user.division,
      district: user.district,
      areas: { $in: [user.area] },
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { institute: { $regex: searchString, $options: "i" } },
        { department: { $regex: searchString, $options: "i" } },
      ],
    } : (user.division.length !== 0 && user.district.length !== 0) ?
      {
        role: "tutor",
        division: user.division,
        district: user.district,
        $or: [
          { name: { $regex: searchString, $options: "i" } },
          { institute: { $regex: searchString, $options: "i" } },
          { department: { $regex: searchString, $options: "i" } },
        ],
      } : (user.division.length !== 0) ?
        {
          role: "tutor",
          division: user.division,
          $or: [
            { name: { $regex: searchString, $options: "i" } },
            { institute: { $regex: searchString, $options: "i" } },
            { department: { $regex: searchString, $options: "i" } },
          ],
        } :
        {
          role: "tutor",
          $or: [
            { name: { $regex: searchString, $options: "i" } },
            { institute: { $regex: searchString, $options: "i" } },
            { department: { $regex: searchString, $options: "i" } },
          ],
        }
  //---
  const data = await Model.aggregate([
    {
      $match: match
    },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'to',
        as: 'ratings'
      }
    },
    {
      $addFields: {
        starsCount: { $sum: '$ratings.stars' },
        followersCount: { $size: '$followers' },
        ratingsCount: { $size: '$ratings' },
      }
    },
    {
      $sort: { followersCount: -1 }
    },
    {
      $skip: (page - 1) * 34
    },
    {
      $limit: 34
    },
    {
      $project: {
        ratings: 0,
        education: 0,
        followers: 0,

      }
    },
    {
      $project: {
        starsCount: 1,
        department: 1,
        institute: 1,
        ratingsCount: 1,
        name: 1,
        avatarImg: 1,
        verified: 1,
        gender: 1
      }
    }
  ]);
  const totalDocs = await Model.countDocuments(match);
  const pages = Math.ceil(totalDocs / 34)
  if (data) {
    res.status(200).send({
      data: data,
      lastPage: page * 34 >= totalDocs ? true : false,
      pages: pages,
      current: page,
    });
  } else {
    res.status(400).send({
      data: [],
      lastPage: true,
      pages: 1,
      current: 1,
    });
  }
};
const getUser = async (req, res) => {
  try {
    const u = await User.findOne({ _id: req.params.userId })
    const user = await User.findOne({ _id: req.params.userId }).populate(
      'followers', 'avatarImg'
    );
    const ratings = await Rating.find({ to: user._id }).populate(
      "postedBy",
      "avatarImg _id name gender"
    );
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * 34;
    const endIndex = page * 34;
    const reqUserRole = req.body.role;
    const reqUserId = req.body.requesterId;
    let posts = [],
      pages = 0;
    const social = user.social;
    let newSocials = [];
    for (let x = 0; x < social.length; x++) {
      var obj = social[x];
      if (obj.link == "") {
      } else {
        var newObj = {
          icon: obj.icon,
          link: obj.link.startsWith("http") ? obj.link : "https://" + obj.link,
        };
        newSocials = [...newSocials, newObj];
      }
    }

    if (user) {
      posts = await Post.find({ userID: user._id });
      pages = ((posts.length / 34) | 0) + 1;
    }

    if (user.role == "user") {
      const resData = {
        _id: user._id,
        name: user.name,
        phone:
          reqUserRole == "tutor" ||
            reqUserRole == "super" ||
            reqUserRole == "admin"
            ? user.phone
            : null,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        institute: user.institute,
        department: user.department,
        followers: user.followers.length,
        followersArray: user.followers.slice(-5),
        posts: posts.slice(startIndex, endIndex),
        lastPage: endIndex >= posts.length ? true : false,
        ratings: ratings,
        avatarImg: user.avatarImg,
        isFollowed: req.body.requesterId
          ? u.followers.includes(req.body.requesterId)
          : false,
      };
      res.status(200).json(resData);
    } else if (user.role == "tutor") {
      const resData = {
        _id: user._id,
        avatarImg: user.avatarImg,
        coverImg: user.coverImg,
        phone: user.phone,
        role: user.role,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        division: user.division || user.divission,
        district: user.district,
        area: user.area,
        areas: user.areas,
        subjects: user.subjects,
        class: user.class,
        institute: user.institute,
        department: user.department,
        verified: user.verified,
        days: user.days,
        followers: user.followers.length,
        premiumEnd: user.premiumEnd,
        education: [],
        followersArray: user.followers.slice(-5),
        edu: user.edu.filter((a) => a.department != "" && a.year != "" && a.institute != ""),
        experience: user.experience.filter((a) => a.title != "" && a.desc != "" && a.year != ""),
        social: newSocials,
        salary: user.salary,
        isFollowed: req.body.requesterId
          ? u.followers.includes(req.body.requesterId)
          : false,
        ratings: ratings.reverse(),
        posts: posts.reverse().slice(startIndex, endIndex),
        lastPage: endIndex >= posts.length ? true : false,
        pages: pages,
      };
      res.status(200).json(resData);
    } else if (user.role == "admin" || user.role == "super") {
      const resData = {
        _id: user._id,
        avatarImg: user.avatarImg,
        phone:
          reqUserRole == "super" || reqUserRole == "admin" ? user.phone : null,
        name: user.name,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        division: user.division || user.divission,
        district: user.district,
        areas: user.areas,
        followers: user.followers.length,
        followersArray: user.followers.slice(-5),
        isFollowed: req.body.requesterId
          ? u.followers.includes(req.body.requesterId)
          : false,
        ratings: ratings.reverse(),
        posts: posts.reverse().slice(startIndex, endIndex),
        lastPage: endIndex >= posts.length ? true : false,
        pages: pages,
      };
      res.status(200).json(resData);
    } else {
      res.status(400).json("No tutor found");
    }
  } catch (error) {
    res.status(400).json("No tutor found 2 ");
  }
};
const getMedia = async (req, res) => {
  try {
    const u = await User.findOne({ phone: req.params.phone, role: 'media' })
    const user = await User.findOne({ phone: req.params.phone, role: 'media' }).populate(
      'followers', 'avatarImg'
    );
    const page = parseInt(req.query.page) || 1;
    const ratings = await Rating.find({ to: user._id }).populate(
      "postedBy",
      "avatarImg _id name gender"
    )
    const social = user.social;
    let newSocials = [];
    for (let x = 0; x < social.length; x++) {
      var obj = social[x];
      if (obj.link.length > 0 && obj.icon !== "") {
        var newObj = {
          icon: obj.icon,
          link: obj.link.startsWith("http") ? obj.link : "https://" + obj.link,
        };
        newSocials = [...newSocials, newObj];

      }

    }
    const p = await Post.find({ userID: user._id, approved: true })
    const posts = await Post.find({ userID: user._id, approved: true }).sort({ _id: -1 })
      .select(
        "days _id subjects approved class type desc lang division district area salary negotiable gender createdAt "
      )

      .limit(34)
      .skip(34 * (page - 1))
      .sort({ _id: -1 })
      .populate(
        "userID",
        "avatarImg name phone "
      );
    const pages = ((p.length / 34) | 0) + 1;
    const resData = {
      _id: user._id,
      avatarImg: user.avatarImg,
      coverImg: user.coverImg,
      phone: user.phone,
      email: user.email,
      name: user.name,
      bio: user.bio,
      division: user.division || user.divission,
      district: user.district,
      areas: user.areas,
      followers: user.followers.length,
      social: newSocials,
      institute: user.institute,
      department: user.department,
      followersArray: user.followers.slice(-5),
      verified: user.verified,
      isFollowed: req.body.requesterId
        ? u.followers.includes(req.body.requesterId)
        : false,
      ratings: ratings.reverse(),
      posts: posts,
      lastPage: (page * 34) >= p.length ? true : false,
      pages: pages,
      current: page,
    };

    res.status(200).json(resData);
  } catch (error) {
    res.status(400).json("No tutor found");
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (user.avatarImg.length !== 0) {
      fs.unlink("./public" + user.avatarImg, (err) => {
        console.log(err);
      });
    }
    if (user.coverImg.length !== 0) {
      fs.unlink("./public" + user.coverImg, (err) => {
        console.log(err);
      });
    }
    await Post.deleteMany({ userID: req.params.userId });
    await User.deleteOne({ _id: req.params.userId });
    res.status(200).send({ msg: "success" });
  } catch (error) {
    res.status(400).send({ err: "error" });
  }
};

const userFollow = async (req, res) => {
  try {
    const user = await User.findById(req.body.followId);
    const currentUser = await User.findById(req.body.requesterId);
    if (currentUser._id?.toString() !== user?._id.toString()) {
      if (!user.followers.includes(currentUser?._id.toString())) {
        user.followers.push(currentUser._id);
        currentUser.followings.push(user._id);
        user.save()
        currentUser.save()
        res
          .status(200)
          .json({ type: "Followed", msg: "user has been followed" });
      } else {
        user.followers.pull(currentUser._id);
        currentUser.followings.pull(user._id);
        user.save()
        currentUser.save()
        res
          .status(200)
          .json({ type: "Unfollowed", msg: "user has been Unfollowed" });
      }
    } else {
      res.status(433).json({ msg: "you cant follow yourself" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
const followingUsers = async (req, res) => {
  const searchString = req.query.search.toString();
  try {
    const users = await User.find({
      followers: { $in: req.body.requesterId.toString() },
      role: "tutor",
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { institute: { $regex: searchString, $options: "i" } },
        { department: { $regex: searchString, $options: "i" } },
      ],
    });
    const page = parseInt(req.query.page) || 1;
    const pages = ((users.length / 34) | 0) + 1;
    const startIndex = (page - 1) * 34;
    const endIndex = page * 34;
    res.status(200).send({
      data: users.reverse().slice(startIndex, endIndex) || "No data found",
      lastPage: endIndex >= users.length ? true : false,
      pages: pages,
      current: page,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const userRate = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      to: req.params.userId,
      postedBy: req.body.requesterId,
    });
    rating.stars = req.body.stars;
    rating.desc = req.body.desc;
    rating.save();
    res.status(200).json({ msg: "User rating updated successfully" });
  } catch {
    const rating = await new Rating({
      to: req.params.userId,
      postedBy: req.body.requesterId,
      stars: req.body.stars,
      desc: req.body.desc,
    });
    rating.save();
    res.status(200).json({ msg: "User rated successfully" });
  }
};
const deleteRating = async (req, res) => {
  try {
    await Rating.findOneAndDelete({
      _id: req.params.ratingsId,
      postedBy: req.body.requesterId,
    });

    res.status(200).json({ msg: "User rating deleted successfully" });
  } catch {
    const rating = await new Rating({
      to: req.params.userId,
      postedBy: req.body.requesterId,
      stars: req.body.stars,
      desc: req.body.desc,
    });
    rating.save();
    res.status(200).json({ msg: "User rated successfully" });
  }
};
const getMyProfileData = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.requesterId });
    const posts = await Post.find({ userID: user._id });
    const ratings = await Rating.find({ to: user._id }).select("stars");
    const settingsData = fs.readFileSync("./settingsData.json", "utf8");
    const settings = JSON.parse(settingsData);
    const resData = {
      _id: user._id,
      phone: user.phone,
      role: user.role,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      division: user.division || user.divission,
      district: user.district,
      area: user.area,
      areas: user.areas,
      verified: user.verified,
      subjects: user.subjects,
      class: user.class,
      institute: user.institute,
      department: user.department,
      days: user.days,
      education: [],
      followers: user.followers.length,
      edu: user.edu,
      experience: user.experience,
      salary: user.salary,
      avatarImg: user.avatarImg,
      coverImg: user.coverImg,
      social: user.social,
      refs: user.refs,
      posts: posts,
      ratings: ratings,
    };

    res.status(200).json({
      user: resData,
      isPaid: settings.payKeys.chargeForUpgrade,
      verificationFees: settings.payKeys.verificationFees,
      tutorVerificationFees: settings.payKeys.tutorVerificationFees,
      mediaVerificationFees: settings.payKeys.mediaVerificationFees
    });
  } catch (err) {
    console.log(err)
    res.status(200).json({ err: "not found" });
  }
};
const reportUser = async (req, res) => {
  try {
    const report = await new Report({
      by: req.body.requesterId,
      reported: req.params.userId,
      type: "user",
      reason: req.body.reason,
      desc: req.body.desc,
    });
    report.save();
    res.status(200).json({ msg: "Reported successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
module.exports = {
  getLoginType,
  getUser,
  deleteRating,
  getMedia,
  LoginOrCreateUser,
  sendOTP,
  LoginOrCreateUserSMS,
  updateUser,
  deleteUser,
  getTutors,
  getTutorsMyLoc,
  userFollow,
  getMedias,
  userRate,
  followingUsers,
  getMyProfileData,
  reportUser,
  becomeTutor,
};
