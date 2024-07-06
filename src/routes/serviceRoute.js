// // route/subscriberRoute.js
// const express = require("express");

// const {
//     guestOrAuth,
//     isAuth,
//     authVerify,
//     adminVerify,
//   } = require("../middleware/auth");
//   const {
//     serviceUpload
//   } =require("../middleware/fileUploader")
// const router = express.Router();

// // controllers
// const { CreateService,getAllServeice } = require("../modules/serviceControllar");

// router.post("/create-serveice",isAuth,serviceUpload, CreateService);
// // edit with authVerify 
// router.get('/getall-service', getAllServeice);
// // router.get('/service-rating', isAuth, addRatings);


// module.exports = router;
// route/subscriberRoute.js
const express = require("express");
const formidable = require("express-formidable")

const {
    guestOrAuth,
    isAuth,
    authVerify,
    adminVerify,
  } = require("../middleware/auth");
  const {
    serviceUpload
  } =require("../middleware/fileUploader")
const router = express.Router();

// controllers
const { CreateService,getAllServeice ,uploadImage,getSingleService} = require("../modules/serviceControllar");
router.post(
  "/upload-image-file",
  formidable({ maxFileSize: 5 * 1024 * 1024 }),
  uploadImage
);
router.post("/create-serveice",isAuth, CreateService);
// edit with authVerify 
router.get('/getall-service', getAllServeice);
// router.get('/service-rating', isAuth, addRatings);
router.get("/single-service/:id",getSingleService)

module.exports = router;
