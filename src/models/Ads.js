const mongoose = require("mongoose");
const AdsSchema = new mongoose.Schema(
    {
        title: { type: String, default: "" },
        status: { type: Boolean, default: false },
        url: { type: String, default: "" },
        img: { type: String, default: "" },
        height: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        renders: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        lastRenderedAt: { type: Number, default: 0 },
        recentlyRendered: { type: Boolean, default: false }
    },
    { timestamps: true }
);
const Ads = mongoose.model("Ads", AdsSchema);
module.exports = Ads;
