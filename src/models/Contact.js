const mongoose = require("mongoose");
const ContactSchema = new mongoose.Schema({
  name: String,
  company: String,
  phone: String,
  email: String,
  subject: String,
  desc: String,
  lan: String,
  lon: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 3600 * 24 * 30 },
  },
});
const Contact = mongoose.model("Contact", ContactSchema);
module.exports = Contact;
