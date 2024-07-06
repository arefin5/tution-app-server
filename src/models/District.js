const mongoose = require("mongoose");
const DistrictSchema = new mongoose.Schema({
  division: String,
  name: String,
});
const District = mongoose.model("District", DistrictSchema);
module.exports = District;
