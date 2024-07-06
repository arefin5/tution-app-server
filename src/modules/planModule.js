const Plan = require("../models/Plan");
const fs = require("fs");

//----------------------------------------------------------------
const getPlans = async (req, res) => {
  const settingsData = fs.readFileSync("./settingsData.json", "utf8");
  const settings = JSON.parse(settingsData);
  console.log(settings.payKeys.chargeForUpgrade)
  if (settings.payKeys.chargeForUpgrade == false) {
    const plans = [
      {
        _id: 1,
        title: 'Tutor',
        days: 90,
        amount: 0,
        desc: 'Become a tutor',
        type: 'tutor',
      },

      {
        _id: 2,
        title: 'Media',
        days: 90,
        amount: 0,
        desc: 'Become a media',
        type: 'media',
      },
      {
        _id: 3,
        title: 'Tutor',
        days: 90,
        amount: 0,
        desc: 'Become a tutor',
        type: 'tutor',
      },
      {
        _id: 4,
        title: 'Tutor',
        days: 90,
        amount: 0,
        desc: 'Become a tutor',
        type: 'tutor',
      },
    ];
    res.status(200).json({ msg: "success", plans });
  } else {
    const plans = await Plan.find();
    res.status(200).json({ msg: "success", plans });
  }
};
//----------------------------------------------------------------
const getAdminPlans = async (req, res) => {
  const plans = await Plan.find();
  res.status(200).json({ msg: "success", plans: plans });
};
//----------------------------------------------------------------
const createPlan = async (req, res) => {
  const plan = await new Plan({
    title: req.body.title,
    days: req.body.days,
    amount: req.body.amount,
    desc: req.body.desc,
    type: req.body.type,
  });
  await plan
    .save()
    .then(async () => {
      const plans = await Plan.find();
      res.status(200).json({ msg: "success", plans: plans });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "fail", err });
    });
};
//----------------------------------------------------------------
const updatePlan = async (req, res) => {
  const plan = await Plan.findOneAndUpdate(
    { _id: req.params.planId },
    {
      title: req.body.title,
      days: req.body.days,
      amount: req.body.amount,
      desc: req.body.desc,
      type: req.body.type,
    }
  );
  await plan
    .save()
    .then(() => {
      res.status(200).json({ msg: "success", });
    })
    .catch((err) => {
      res.status(500).json({ msg: "fail", err });
    });
};
//----------------------------------------------------------------
const deletePlan = async (req, res) => {
  try {
    await Plan.deleteOne({ _id: req.params.planId });
    res.status(200).json({ msg: 'success' });
  } catch (error) {
    res.status(400).json({ msg: 'fail' });

  }
};
//----------------------------------------------------------------
module.exports = {
  getPlans,
  getAdminPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
