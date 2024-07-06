const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  text: { type: String },
  image: { type: String },
  seen: { type: Boolean },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 3600 * 24 * 30 * 12 },
  },
});
const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
