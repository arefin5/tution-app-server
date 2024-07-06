const mongoose = require("mongoose");
const TRXSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, },
  email: { type: String, },
  phone: { type: String, required: true },
  plan: { type: String, required: true },
  days: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, required: true, default: "pending" },
  type: { type: String, required: true, default: "tutor", enum: ['tutor', 'media', 'verification', 'other'] },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 3600 * 24 * 60 },
  },
});
const TRX = mongoose.model("TRX", TRXSchema);
module.exports = TRX;
