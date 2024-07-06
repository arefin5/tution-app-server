// @ts-nocheck
const User = require("./../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Post = require("../models/Post");
const Service=require("../models/Service")
dotenv.config();
const jwt_secret = process.env.JWT_SECRET;

//--------------
const guestOrAuth = async (req, res, next) => {
  const token = req.headers.token || req.cookies.token || req.query.token;
  let Id;
  try {
    jwt.verify(token, jwt_secret, (err, decoded) => {

      Id = decoded.userId;
    });
    try {
      const user = await User.findOne({ _id: Id });
      req.body.requesterId = user._id;
      req.body.requesterRole = user.role;
      req.params.requesterId = user._id;
      req.params.requesterRole = user.role;
      req.query.requesterId = user._id;
      req.query.requesterRole = user.role;
      next();
    } catch {
      next();
    }
  } catch {
    next();
  }
};
const isAuth = async (req, res, next) => {
  const token = req.headers.token || req.cookies.token || req.query.token;
  let Id;
  try {
    jwt.verify(token, jwt_secret, (err, decoded) => {

      Id = decoded.userId;
    });
    try {
      const user = await User.findOne({ _id: Id });
      req.body.requesterId = user._id;
      req.body.requesterRole = user.role;
      req.params.requesterId = user._id;
      req.params.requesterRole = user.role;
      req.query.requesterId = user._id;
      req.query.requesterRole = user.role;
      next();
    } catch (error) {
      res.status(200).json({ mag: "Invalid token. Please login" });
    }
  } catch {
    res.status(406).json({ mag: "Invalid token. Please login" });
  }
};
//---------------
const authVerify = async (req, res, next) => {
  const token = req.headers.token || req.cookies.token || req.query.token;
  const postId = req.params.postId;
  const tId = req.params.userId;
  const serviceId=req.params.userId
  let Id;
  try {
    jwt.verify(token, jwt_secret, (err, decoded) => {

      Id = decoded.userId;
    });
    const user = await User.findOne({ _id: Id });
    try {
      if (tId) {
        try {
          const tUser = await User.findOne({ _id: tId });

          if (
            tUser.role == "super" &&
            tUser._id.toString() == user._id.toString()
          ) {
    
            req.body.requesterId = user._id;
            req.body.requesterRole = user.role;
            req.params.requesterId = user._id;
            req.params.requesterRole = user.role;
            req.query.requesterId = user._id;
            req.query.requesterRole = user.role;
            next();
          } else if (tUser.role == "admin") {
            if (
              tUser.role == "admin" &&
              tUser._id.toString() == user._id.toString()
            ) {
      
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else if (tUser.role == "admin" && user.role == "super") {
      
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else {
              res.status(401).json({ msg: "UnAuthorized" });
            }
          } else if (tUser.role == "user" || tUser.role == "tutor" || tUser.role == "media") {
            if (
              tId == user._id.toString() ||
              user.role == "admin" ||
              user.role == "super"
            ) {
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else {
              res.status(401).json({ msg: "UnAuthorized" });
            }
          } else {
            res.status(401).json({ msg: "UnAuthorized" });
          }
        } catch (error) {
          res.status(404).json({ msg: "User account not found" });
        }
      } else if (postId) {
        try {
          const tPost = await Post.findOne({ userID: user._id });
          const postOwner = await User.findOne({
            _id: tPost.userID.toString(),
          });
          
          if (
            postOwner.role == "super" &&
            tPost.userID.toString() == user._id.toString()
          ) {
    
            req.body.requesterId = user._id;
            req.body.requesterRole = user.role;
            req.params.requesterId = user._id;
            req.params.requesterRole = user.role;
            req.query.requesterId = user._id;
            req.query.requesterRole = user.role;
            next();
          } else if (postOwner.role == "admin") {
            if (
              postOwner.role == "admin" &&
              tPost.userID.toString() == user._id.toString()
            ) {
      
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else if (postOwner.role == "admin" && user.role == "super") {
      
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else {
              res.status(400).json({ msg: "UnAuthorized" });
            }
          } else if (postOwner.role == "user" || postOwner.role == "tutor" || postOwner.role == "media") {
            if (
              tPost.userID.toString() == user._id.toString() ||
              user.role == "admin" ||
              user.role == "super"
            ) {
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else {
              res.status(400).json({ msg: "UnAuthorized" });
            }
          } else {
            res.status(400).json({ msg: "UnAuthorized" });
          }
        } catch (error) {
          res.status(400).json({ msg: "Post not found" });
        }
      }else if (serviceId) {
        try {
          const tService = await Service.findOne({ postedBy: user._id });
          const postOwner = await User.findOne({
            _id: tService.postedBy.toString(),
          });
          
          if (
            postOwner.role == "super" &&
            tService.postedBy.toString() == user._id.toString()
          ) {
    
            req.body.requesterId = user._id;
            req.body.requesterRole = user.role;
            req.params.requesterId = user._id;
            req.params.requesterRole = user.role;
            req.query.requesterId = user._id;
            req.query.requesterRole = user.role;
            next();
          } else if (postOwner.role == "admin") {
            if (
              postOwner.role == "admin" &&
              tService.postedBy.toString() == user._id.toString()
            ) {
      
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else if (postOwner.role == "admin" && user.role == "super") {
      
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else {
              res.status(400).json({ msg: "UnAuthorized" });
            }
          } else if (postOwner.role == "user" || postOwner.role == "tutor" || postOwner.role == "media") {
            if (
              tService.postedBy.toString() == user._id.toString() ||
              user.role == "admin" ||
              user.role == "super"
            ) {
              req.body.requesterId = user._id;
              req.body.requesterRole = user.role;
              req.params.requesterId = user._id;
              req.params.requesterRole = user.role;
              req.query.requesterId = user._id;
              req.query.requesterRole = user.role;
              next();
            } else {
              res.status(400).json({ msg: "UnAuthorized" });
            }
          } else {
            res.status(400).json({ msg: "UnAuthorized" });
          }
        } catch (error) {
          res.status(400).json({ msg: "Post not found" });
        }
      } else {
        res.status(406).json({ mag: "Invalid Params. Please login" });
      }
    } catch {
      res.status(406).json({ mag: "Invalid token. Please login" });
    }
  } catch {
    res.status(406).json({ mag: "Invalid token. Please login" });
  }
};
//---------------
const superAdminVerify = async (req, res, next) => {
  const token = req.headers.token || req.cookies.token || req.query.token;
  let Id;
  try {
    jwt.verify(token, jwt_secret, (err, decoded) => {

      Id = decoded.userId;
    });
    try {
      const user = await User.findOne({ _id: Id });
      if (user.role == "super") {

        req.body.requesterId = user._id;
        req.body.requesterRole = user.role;
        req.params.requesterId = user._id;
        req.params.requesterRole = user.role;
        req.query.requesterId = user._id;
        req.query.requesterRole = user.role;

        next();
      } else {
        res.status(406).redirect("/login?msg=NotSuperAdmin");
      }
    } catch (error) {
      res.status(406).redirect("/login?msg=NotSuperAdmin");
    }
  } catch {
    res.status(406).redirect("/login?msg=NotSuperAdmin");
  }
};
const adminVerify = async (req, res, next) => {
  const token = req.headers.token || req.cookies.token || req.query.token;
  let Id;
  try {
    jwt.verify(token, jwt_secret, (err, decoded) => {

      Id = decoded.userId;
    });
    try {
      const user = await User.findOne({ _id: Id });
      if (user.role == "admin" || user.role == "super") {

        req.body.requesterId = user._id;
        req.body.requesterRole = user.role;
        req.params.requesterId = user._id;
        req.params.requesterRole = user.role;
        req.query.requesterId = user._id;
        req.query.requesterRole = user.role;
        next();
      } else {
        res.status(401).redirect("/login?msg=NotAdmin");
      }
    } catch {
      res.status(406).redirect("/login?msg=NotAdmin");
    }
  } catch {
    res.status(401).redirect("/login?msg=NotAdmin");
  }
};

module.exports = {
  guestOrAuth,
  isAuth,
  authVerify,
  adminVerify,
  superAdminVerify,
};
