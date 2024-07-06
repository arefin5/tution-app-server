const mongoose = require("mongoose");
const AreaSchema = new mongoose.Schema({
    district: String,
    name: String,
});
const Area = mongoose.model("Area", AreaSchema);
module.exports = Area;
