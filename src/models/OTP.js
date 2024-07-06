const mongoose = require("mongoose");
const OTPSchema = new mongoose.Schema({
    phone:      { type: String, required: true },
    otp:        { type: String, required: true },
    createdAt:  { type: Date, default: Date.now, index: { expires: 300 } }
  
},

);
const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;