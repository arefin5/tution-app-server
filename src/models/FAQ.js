const mongoose = require("mongoose");
const FAQSchema = new mongoose.Schema(
    {
        ques: { type: String, default: "" },
        ans: { type: String, default: "" },
    },
    { timestamps: true }
);
const FAQ = mongoose.model("FAQ", FAQSchema);
module.exports = FAQ;
