const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
  fcmToken: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 3600 * 24 * 30 * 6 },
  },
});
const Device = mongoose.model("Device", DeviceSchema);
module.exports = Device;
