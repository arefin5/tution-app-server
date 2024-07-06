const mongoose = require("mongoose");
const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, 

     },
     image: {
      url: String,
      public_id: String,
    },
    coursedutration: { type: String, 

      },
        subject:{
          type:String
        },

         discountPrice:{
          type: String
         },
         content:{
          type:String
         },
         lecture:{
          type:String
         },
         project:{
          type: String
         },
         nameOfCourse:{
          type:String
         },
         sylebus:{
          type:String 
         },
         onlinePrice:{
          type:String 
         },
outcomes: {
      type: [String], // Array of strings
    },
        
          courseType:{
          type:String 
         },
         
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price:{
        type: String,
    },
     status: {
    type: String,
    enum: ['draft', 'published'], 
    default: 'draft', // Default value is 'draft'
  },  
   rating: [
      {
        ratings: String,
        created: { type: Date, default: Date.now },
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },

  
  { timestamps: true }
);
const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
