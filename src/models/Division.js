const mongoose = require("mongoose");
const DivisionSchema = new mongoose.Schema({
  name: String,
});
const Division = mongoose.model("Division", DivisionSchema);
module.exports = Division;
