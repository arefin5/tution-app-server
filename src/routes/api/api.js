//------------------Modules-----------
const api = require("express").Router();

//------------------modules-------
const {
  getUser,
  LoginOrCreateUser,
  updateUser,
  deleteUser,
  getTutors,
  getTutorsMyLoc,
  userFollow,
  followingUsers,
  userRate,
  getMyProfileData,
  reportUser,
  getMedia,
  getMedias,
  deleteRating,
  getLoginType,
  LoginOrCreateUserSMS,
  sendOTP,
  becomeTutor,
} = require("../../modules/userModule");
const {
  getPosts,
  createPosts,
  updatePosts,
  deletePosts,
  getPostsMyLoc,
  likePost,
  postsLiked,
  reportPost,
  getPost,
  getMediaPost,
  applyForPost,
  comment,
  deleteComment,
  postsApplied,
} = require("../../modules/postModule");
const {
  getDivisions,
  getDistricts,
  getAreas,
} = require("../../modules/locationModule");
const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../../modules/planModule");
const { payment, callBack, verification, verify } = require("../../modules/paymentModule");
const {
  getSlides,
  getStats,
  getFooterLinks,
  getTerms,
  getPolicies,
  getDisclaimers,
  getAbout,
  newContact,
  getPromote,

} = require("../../modules/adminApiModules");
const {
  comeToInbox,
  getChats,
  newMessage,
  getMessage,
  deleteChat,
} = require("../../modules/inboxModule");

//------------------middlewares-------
const {
  guestOrAuth,
  isAuth,
  authVerify,
  adminVerify,
} = require("../../middleware/auth");
const { userUpload } = require("../../middleware/fileUploader");
const { getNotifications } = require("../../modules/notificationModule");
const { getBooks, getBook } = require("../../modules/booksModule");
const {
  regFcm,
  deleteFcm,
  sendToAllUsers,
  sendToOneUsers,
} = require("../../modules/FCMModule");
const { getAdsPublic, clickAds } = require("../../modules/adminApiModules/ads");
const { getRecaptcha } = require("../../modules/recaptchaModule");

//------------------Routes------------
// User account creation & login related
api.get("/tutors", getTutors);
api.get("/medias", getMedias);
api.get("/media/:phone", guestOrAuth, getMedia);
api.get("/tutors/my-area", isAuth, getTutorsMyLoc);
api.get("/user/:userId", guestOrAuth, getUser);
api.get("/users/followings", isAuth, followingUsers);

api.get("/login", getLoginType);
api.post("/login-otp", sendOTP);
api.post("/login-verify", LoginOrCreateUserSMS);
api.post("/login", LoginOrCreateUser);
api.post("/report/user/:userId", isAuth, reportUser);
api.post("/user/follow/", isAuth, userFollow);
api.post("/user/rate/:userId", isAuth, userRate);
api.delete("/user/rate/:ratingsId", isAuth, deleteRating);
api.post("/user/become/tutor", isAuth, becomeTutor);
api.post("/user/edit/:userId", authVerify, userUpload, updateUser);
api.delete("/user/:userId", authVerify, deleteUser);
api.get("/my-profile", isAuth, getMyProfileData);
api.get("/my-profile/notifications", isAuth, getNotifications);

// Payment routes
api.post("/pay", isAuth, payment); //req by user
api.post("/callback", callBack); //req by payment gateway server
api.post("/verify", isAuth, verify); //req by user
api.post("/verify/callback", verification); //req by payment gateway server

// Plan routes
api.get("/plans", getPlans);
// Post related routes
api.get("/posts", getPosts);
api.get("/posts/:postId", guestOrAuth, getPost);
api.get("/media/post/:postId", guestOrAuth, getMediaPost);
api.get("/posts-my-area", isAuth, getPostsMyLoc);
api.get("/liked-posts", isAuth, postsLiked);
api.get("/applied-posts", isAuth, postsApplied);
api.post("/posts", isAuth, createPosts);
api.post("/report/post/:postId", isAuth, reportPost);
api.post("/post-edit/:postId", authVerify, updatePosts);
api.post("/posts/like/:postId", isAuth, likePost);
api.post("/posts/apply/:postId", isAuth, applyForPost);
api.post("/posts/comment/:postId", isAuth, comment);
api.delete("/posts/comment/:id", isAuth, deleteComment);
api.delete("/posts/:postId", authVerify, deletePosts);
// Post related routes
api.get("/slides", getSlides);

api.get("/divisions", getDivisions);
api.get("/districts/:division", getDistricts);
api.get("/areas/:district", getAreas);
api.get("/stats", getStats);
api.get("/footer-links", getFooterLinks);
api.get("/terms", getTerms);
api.get("/policies", getPolicies);
api.get("/disclaimers", getDisclaimers);
api.get("/about", getAbout);
api.get("/promote", getPromote);
api.post("/contact", newContact);

api.post("/inbox/", isAuth, comeToInbox);
api.get("/chats/", isAuth, getChats);
api.delete("/chat/:chatId", isAuth, deleteChat);
api.get("/messages/:chatId", isAuth, getMessage);
api.post("/message/", isAuth, newMessage);

api.post("/reg-fcm/", regFcm);
api.post("/del-fcm/", deleteFcm);
api.post("/send-to-all/", adminVerify, sendToAllUsers);
api.post("/send-to-one/", adminVerify, sendToOneUsers);

api.get("/ads", getAdsPublic);
api.get("/ads/:adsId", clickAds);

api.get("/books", getBooks);
api.get("/book/:bookId", getBook);

api.get("/recaptcha", getRecaptcha);

module.exports = api;
