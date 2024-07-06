const express = require("express");
const router = express.Router();
const {
  trxView,
  reportView,
  reportsView,
  reportDelete,
  contactsView,
  contactView,
  contactDelete,
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
  getStats,
  index,
  applicationsView,
  applicationView,
  applicationDelete,

} = require("../../modules/adminApiModules");
const {
  createUser,

  editUser,
  getUsers,
  getAdmins,
  getTutors,
  getMedias,
  deleteUser,
  getUserData,
} = require("../../modules/adminApiModules/users");
const {
  loginVerify, getProfile, updateProfile,
} = require("../../modules/adminApiModules/account");
//-------------

const {
  isAuth,
  authVerify,
  adminVerify,
  superAdminVerify,
} = require("./../../middleware/adminAuth");
const {
  bookUpload,
  userUpload,
  heroUpload,
  sliderUpload,
  adsUpload,
} = require("./../../middleware/fileUploader");
const { getDivisions, getDistricts, getAreas } = require("../../modules/locationModule");
const { getPosts, createPost, postDetails, getPendingPosts, editPost, approvePost, deletePost } = require("../../modules/adminApiModules/post");
const { createArea, createDistrict, createDivision, updateSettings, getSettings, getSliders, updateSlider, newSlider, deleteSlider, getPolicyPages, updatePolicyPages, init, deleteDivision, deleteDistrict, deleteArea, getTestimonials, newTestimonial, updateTestimonial, deleteTestimonial, getFAQs, newFAQ, updateFAQ, deleteFAQ } = require("../../modules/adminApiModules/settings");
const { getAdminPlans, updatePlan, deletePlan, createPlan } = require("../../modules/planModule");
const { getBooks, createBook, getBook, editBook, deleteBook } = require("../../modules/adminApiModules/book");
const { getAdsSingle, getAds, createAds, editAds, deleteAds } = require("../../modules/adminApiModules/ads");

//-------------

router.post("/login/", loginVerify);
router.get("/profile", adminVerify, getProfile);
router.post("/profile", adminVerify, userUpload, updateProfile);
//--------Settings---
router.get("/", adminVerify, index);

router.delete("/users", superAdminVerify, deleteAllUsers);
router.delete("/students", superAdminVerify, deleteAllStudents);
router.delete("/tutors", superAdminVerify, deleteAllTutors);
router.delete("/medias", superAdminVerify, deleteAllMedias);
router.delete("/posts", superAdminVerify, deleteAllPosts);
router.delete("/pending", superAdminVerify, deleteAllPending);
router.delete("/chats", superAdminVerify, deleteAllChats);
router.delete("/messages", superAdminVerify, deleteAllMessages);
router.delete("/notifications", superAdminVerify, deleteAllNotification);
router.delete("/trx", superAdminVerify, deleteAllTRX);



router.get("/settings", adminVerify, getSettings);
router.get("/settings/pages", superAdminVerify, getPolicyPages);
router.get("/settings/init", superAdminVerify, init);
router.post("/settings", superAdminVerify, heroUpload, updateSettings);
router.post("/settings/pages", superAdminVerify, updatePolicyPages);
router.post("/settings/division", adminVerify, createDivision);
router.post("/settings/district", adminVerify, createDistrict);
router.post("/settings/area", adminVerify, createArea);

router.get("/settings/plans", getAdminPlans);
router.post("/settings/plans", adminVerify, createPlan);
router.post("/settings/plan/:planId", adminVerify, updatePlan);
router.delete("/settings/plan/:planId", adminVerify, deletePlan);


//---------Posts-------
router.get("/posts", adminVerify, getPosts);
router.get("/pending", adminVerify, getPendingPosts);
router.post("/posts", adminVerify, createPost);
router.get("/post/:postId", adminVerify, postDetails);
router.post("/post/:postId", authVerify, adminVerify, editPost);
router.post("/approve/:postId", authVerify, adminVerify, approvePost);
router.delete("/post/:postId/", authVerify, adminVerify, deletePost);
//---------Sliders-------
router.get("/sliders", adminVerify, getSliders);
router.post("/sliders", adminVerify, sliderUpload, newSlider);
router.post("/slider/:sliderId", adminVerify, sliderUpload, updateSlider);
router.delete("/slider/:sliderId", adminVerify, deleteSlider);
//---------Testimonials-------
router.get("/testimonials", adminVerify, getTestimonials);
router.post("/testimonials", adminVerify, newTestimonial);
router.post("/testimonial/:testimonialId", adminVerify, updateTestimonial);
router.delete("/testimonial/:testimonialId", adminVerify, deleteTestimonial);
//---------FAQs-------
router.get("/faqs", adminVerify, getFAQs);
router.post("/faqs", adminVerify, newFAQ);
router.post("/faq/:faqId", adminVerify, updateFAQ);
router.delete("/faq/:faqId", adminVerify, deleteFAQ);

//---------Books-------
router.get("/books", adminVerify, getBooks);
router.post("/books", adminVerify, bookUpload, createBook);
router.get("/book/:bookId", adminVerify, getBook);
router.post("/book/:bookId", authVerify, adminVerify, bookUpload, editBook);
router.delete("/book/:bookId/", authVerify, adminVerify, deleteBook);

//--------Ads------------
router.get("/ads", adminVerify, getAds);
router.post("/ads", adminVerify, adsUpload, createAds);
router.get("/ads/:adsId", getAdsSingle);
router.post("/ads/:adsId", adminVerify, adsUpload, editAds);
router.delete("/ads/:adsId/", adminVerify, deleteAds);
//---------Users-------
router.get("/users", adminVerify, getUsers);
router.get("/medias", adminVerify, getMedias);
router.get("/admins", adminVerify, getAdmins);
router.get("/tutors", adminVerify, getTutors);
router.get("/user/:userId", adminVerify, getUserData);
router.post("/users", adminVerify, userUpload, createUser);
router.post("/user/:userId", authVerify, adminVerify, userUpload, editUser);
router.delete("/user/:userId/", authVerify, adminVerify, deleteUser);
//---------Others--------
router.get("/trxs", adminVerify, trxView);
router.get("/reports", adminVerify, reportsView);
router.get("/report/:reportId", adminVerify, reportView);
router.delete("/report/:reportId/", adminVerify, reportDelete);

router.get("/contacts", adminVerify, contactsView);
router.get("/contact/:contactId", adminVerify, contactView);
router.delete("/contact/:contactId/", adminVerify, contactDelete);

router.get("/applications", adminVerify, applicationsView);
router.get("/application/:id", adminVerify, applicationView);
router.delete("/application/:id/", adminVerify, applicationDelete);

router.get("/divisions", getDivisions);
router.get("/districts/:division", getDistricts);
router.get("/areas/:district", getAreas);

router.get("/stats", getStats);
router.post("/divisions", createDivision);
router.post("/districts", createDistrict);
router.post("/areas", createArea);
router.delete("/division/:id", deleteDivision);
router.delete("/district/:id", deleteDistrict);
router.delete("/area/:id", deleteArea);
module.exports = router;
