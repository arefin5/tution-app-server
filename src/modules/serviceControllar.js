const Service = require('../models/Service.js');
const cloudinary = require("cloudinary")
const dotenv = require("dotenv");

cloudinary.config({
  cloud_name : "deju4adhl",
  api_key : "685762217399297" ,
  api_secret : "GEuQhibkl5ygjpU5QROQ-J_YczA",
  APIenvironmentvariable:process.env.API_environment_variable
});

// Add a new subscriber
exports.CreateService = async (req, res) => {
  const {  
          title,
          price,
          image,
          courseD,
        discount,
          content,
          lecture,
          syllabus,
          id,
          courseType,
          outcomes,
          
  } = req.body;
// console.log(req.body.courseType)
// console.log(req.body.outcomes,);

  try {
    // Insert the new subscriber into the database
    const service = new Service({
       title:title,
      price:price ,
      image: image,
      discountPrice:discount,
      courseType,
      content:content ,
      lecture:lecture,
          sylebus:syllabus,
      coursedutration:courseD,
      postedBy:id ,
      outcomes,
     });
    await service.save();
    // console.log('service',service);
    return res.status(201).json({ message: 'gig  added successfully' });
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all subscribers
exports.getAllServeice = async (req, res) => {
  console.log("test start service geting ")
  try {
    // Get all subscribers from the database
    const service = await Service.find().populate('postedBy', 'name avatarImg _id').populate("rating.postedBy", "_id name avatarImg ")

    return res.status(200).json({ service })
    
  } catch (error) {
    console.error('Error getting service:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.getSingleService=async(req,res)=>{
  const { id } = req.params;
  console.log(id);
console.log("start single service finding ")
try {
    // Find the single blog by id
    const service = await Service.findById(id).populate('postedBy', 'name avatarImg _id').populate("rating.postedBy", "_id name avatarImg ")

    if (!service) {
        return res.status(404).json({ error: 'Service Not Found' });
    }

    res.status(200).json({ message: 'success', service });
} catch (error) {
    console.error('Error find Service status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}
}

exports.addRatings = async (req, res) => {
  try {
    const { serviceId, ratings } = req.body;
    const service = await Service.findByIdAndUpdate(
      serviceId,
      {
        $push: { ratings: { rating: ratings, postedBy: req.user._id } },
      },
      { new: true }
    )
      .populate("postedBy", "_id name image")
      .populate("comments.postedBy", "_id name image");
    res.json(service);
  } catch (err) {
    console.log(err);
  }
};
exports.uploadImage = async (req, res) => {
  // console.log("req files => ",req.files);
  try {
    const result = await cloudinary.uploader.upload(req.files.image.path);
    // console.log("uploaded image url => ", result);
    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.log(err);
  }
};