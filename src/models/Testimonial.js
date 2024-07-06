const mongoose = require("mongoose");
const TestimonialSchema = new mongoose.Schema(
    {
        quote: { type: String, default: "" },
        desc: { type: String, default: "" },
        name: { type: String, default: "" },
        stars: { type: Number, default:0 },
        from: { type: String, default: "" },
    },
    { timestamps: true }
);
const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
module.exports = Testimonial;
