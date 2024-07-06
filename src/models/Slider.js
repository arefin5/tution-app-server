const mongoose = require("mongoose");
const SliderSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    heading: { type: String, default: "" },
    text: { type: String, default: "" },
    // btn:     { type: String, default: ''},
    url: { type: String, default: "" },
    img: { type: String, default: "" },
  },
  { timestamps: true }
);
const Slider = mongoose.model("Slider", SliderSchema);
module.exports = Slider;
