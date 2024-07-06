const mongoose = require("mongoose");
const ApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    photo: { type: String },
    nid: { type: String },
    student: { type: String },
    office: { type: String },
    location: { type: String },
    type: { type: String, enum: ['tutor', 'media'], default: 'tutor' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: "pending" },
    date: { type: Date, default: new Date() },
},
    {
        timestamps: true
    }
);
const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
