const mongoose = require("mongoose");
const PlanSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    days: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    desc: { type: String, default: "" },
    type: { type: String, default: "tutor", enum: ['tutor', 'media',] },
  },
  { timestamps: true }
);
const Plan = mongoose.model("Plan", PlanSchema);
module.exports = Plan;
