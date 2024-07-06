const Division = require("../models/Division");
const District = require("../models/District");
const Area = require("../models/Area");

const getDivisions = async (req, res) => {
  try {
    const divisions = await Division.find()
    res.status(200).json({ divisions: divisions });
  } catch (err) {
    res.status(500).json({ err: err });
  }
};
const getDistricts = async (req, res) => {
  try {
    const districts = await District.find({ division: req.params.division });
    res.status(200).json({ districts: districts });
  } catch (err) {
    res.status(500).json({ err: err });
  }

};
const getAreas = async (req, res) => {
  try {
    const areas = await Area.find({ district: req.params.district });
    res.status(200).json({ areas: areas });
  } catch (err) {
    res.status(500).json({ err: err });
  }
};

//-------------------
module.exports = {
  getDivisions,
  getDistricts,
  getAreas,
};
