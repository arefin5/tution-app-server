const User = require("../models/User");
const TRX = require("../models/TRX");
const Plan = require("../models/Plan");

//------------------
const axios = require("axios").default;
const dotenv = require("dotenv");
const moment = require("moment");
var request = require('request');
const fs = require("fs");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const Application = require("../models/Application");

dotenv.config();
// const appUrl = 'http://127.0.0.1:5000';
const appUrl = process.env.APP_URL;

//------------------

const payment = async (req, res) => {
  const settingsFile = fs.readFileSync("./settingsData.json", "utf8");
  const settings = JSON.parse(settingsFile);

  const signatureKey = settings.payKeys.signKey;
  const storeId = settings.payKeys.storeId;
  const mode = settings.payKeys.mode;
  const returnUrl = settings.payKeys.returnUrl;
  const chargeForUpgrade = settings.payKeys.chargeForUpgrade;
  // console.log(settings.payKeys)
  const { requesterId, planId } = req.body;
  try {
    const user = await User.findOne({ _id: requesterId });
    if (user.role == "admin" || user.role == "super") {
      res
        .status(200)
        .json({
          status: "failed",
          msg: "You are an author.you can not be a tutor or media",
        });
    } else {
      // if (chargeForUpgrade == true) {

      try {
        const plan = await Plan.findOne({ _id: planId });
        if (plan) {
          if (Number(plan?.amount) !== 0) {
            const newTRX = await new TRX({
              userId: user._id,
              name: user.name || 'Mr user',
              email: user.email || 'user@tuitionappbd.com',
              phone: user.phone,
              plan: plan.title,
              days: plan.days,
              amount: plan.amount,
              type: plan.type,
            });
            await newTRX.save();
            //----------------------------------------------------------------
            var reqConfig = {
              method: 'POST',
              // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
              url: (mode == "secure") ? "https://secure.aamarpay.com/jsonpost.php" : "https://sandbox.aamarpay.com/jsonpost.php",
              headers: {
                "Content-Type": "application/json",
                accept: "application/json"
              },
              data: JSON.stringify({
                store_id: (mode == "secure") ? storeId : 'aamarpaytest',
                signature_key: (mode == "secure") ? signatureKey : 'dbb74894e82415a2f7ff0ec3a97e4183',
                cus_name: "Mr User",
                cus_email: "user@tuitionappbd.com",
                cus_phone: user.phone,
                cus_add1: 'Dhaka, Bangladesh',
                cus_add2: `Dhaka`,
                cus_city: `Dhaka`,
                cus_country: "Bangladesh",
                amount: newTRX.amount,
                tran_id: newTRX._id,
                currency: "BDT",
                success_url: `${appUrl}/api/callback`,
                fail_url: `${appUrl}/api/callback`,
                cancel_url: returnUrl,
                desc: plan.desc,
                type: "json",
              }),
            };

            await axios.request(reqConfig)
              .then((response) => {
                console.log(response.data);
                if (response.data.result == "true") {
                  return res
                    .status(200)
                    .json({ status: "success", url: response.data.payment_url });
                } else if (response.data.result !== "true") {
                  return res
                    .status(200)
                    .json({
                      status: "failed",
                      type: "gateway",
                      msg: "Something went wrong in the payment processor.Please contact with us",
                    });
                }
              })
              .catch((err => {
                console.error(err)
                return res
                  .status(200)
                  .json({
                    status: "failed",
                    type: "gateway",
                    msg: "Something went wrong in the payment processor.Please contact with us",
                  });
              }));

            // var options = {
            //   'method': 'POST',
            //   'url': (mode == "secure") ? "https://secure.aamarpay.com/jsonpost.php" : "https://sandbox.aamarpay.com/jsonpost.php",
            //   'headers': {
            //     "Content-Type": "application/json",
            //     accept: "application/json"
            //   },
            //   body: JSON.stringify({
            //     "store_id": (mode == "secure") ? storeId : 'aamarpaytest',
            //     "signature_key": (mode == "secure") ? signatureKey : 'dbb74894e82415a2f7ff0ec3a97e4183',
            //     "cus_name": "Mr User",
            //     "cus_email": "user@tuitionappbd.com",
            //     "cus_phone": user.phone,
            //     "cus_add1": "Dhaka, Bangladesh",
            //     "cus_add2": "Dhaka",
            //     "cus_city": "Dhaka",
            //     "cus_country": "Bangladesh",
            //     "amount": newTRX.amount,
            //     "tran_id": newTRX._id,
            //     "currency": "BDT",
            //     "success_url": `${appUrl}/api/callback`,
            //     "fail_url": `${appUrl}/api/callback`,
            //     "cancel_url": returnUrl,
            //     "desc": plan.desc,
            //     "type": "json"
            //   })

            // };

            // await request(options, async (error, response) => {
            //   if (error) {
            //     console.log(error)
            //     return res
            //       .status(200)
            //       .json({
            //         status: "failed",
            //         type: "gateway",
            //         msg: "Something went wrong in the payment processor.Please contact with us",
            //       });
            //   };
            //   const result = JSON.parse(response.body);
            //   console.log(JSON.parse(response.body));
            //   if (result.result == "true") {
            //     return res
            //       .status(200)
            //       .json({ status: "success", url: result.payment_url });
            //   } else if (result.result !== "true") {
            //     return res
            //       .status(200)
            //       .json({
            //         status: "failed",
            //         type: "gateway",
            //         msg: "Something went wrong in the payment processor.Please contact with us",
            //       });
            //   }
            // });




          } else {
            const expDate = moment(Date.now())
              .add(Number(plan.days), "days")
              .format("YYYY-MM-DD");
            user.role = plan?.type || 'tutor';
            user.subEnd = expDate;
            await user.save()
            return res
              .status(200)
              .json({ status: "success", url: returnUrl });
          }
        }
      } catch (error) {
        console.log(error);
        res.status(200).json({ status: "failed", msg: "Please try again" });
      }

      // } else {
      //   const expDate = moment(Date.now())
      //     .add(90, "days")
      //     .format("YYYY-MM-DD");
      //   user.role = planId == 1 ? 'tutor' : planId == 2 ? 'media' : 'tutor';
      //   user.subEnd = expDate;
      //   await user.save()
      //   return res
      //     .status(200)
      //     .json({ status: "success", url: returnUrl });
      // }
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({ status: "failed", msg: "Please login again" });
  }
};
const verify = async (req, res) => {
  const settingsFile = fs.readFileSync("./settingsData.json", "utf8");
  const settings = JSON.parse(settingsFile);

  const signatureKey = settings.payKeys.signKey;
  const storeId = settings.payKeys.storeId;
  const mode = settings.payKeys.mode;
  const returnUrl = settings.payKeys.returnUrl;
  const verificationFees = settings.payKeys.verificationFees;
  const tutorVerificationFees = settings.payKeys.tutorVerificationFees;
  const mediaVerificationFees = settings.payKeys.mediaVerificationFees;

  const { requesterId, requesterRole } = req.body;

  try {
    const user = await User.findOne({ _id: requesterId });
    if (user.role == "admin" || user.role == "super") {
      res
        .status(200)
        .json({
          status: "failed",
          msg: "You do not nee any verification",
        });
    } else {

      if (
        user.name.length == 0 ||
        user.email.length == 0 ||
        user.phone.length == 0 ||
        user.phone.union == 0 ||
        user.division.length == 0
      ) {
        res
          .status(200)
          .json({
            status: "failed",
            type: "details",
            msg: "Fill up your details first",
          });
      } else {
        try {
          const newApplication = await new Application({
            userId: user._id,
            photo: req.body.photo,
            nid: req.body.nid,
            student: req.body.student,
            office: req.body.office,
            location: req.body.location,
            type: requesterRole,
            status: "pending",
          });
          await newApplication.save();
          var fData = JSON.stringify({
            store_id: storeId,
            signature_key: signatureKey,
            cus_name: user.name || "Mr User",
            cus_email: user.email || "user@tuitionappbd.com",
            cus_phone: user.phone,
            cus_add1: `${user.area || ""}, ${user.district || ""}, ${user.division || ""
              }`,
            cus_add2: `${user.district || "Dhaka"}`,
            cus_city: `${user.division || "Dhaka"}`,
            cus_country: "Bangladesh",
            amount: user.role == 'tutor' ? tutorVerificationFees : user.role == 'media' ? mediaVerificationFees : verificationFees,
            tran_id: newApplication._id,
            currency: "BDT",
            success_url: `${appUrl}/api/verify/callback`,
            fail_url: `${appUrl}/api/verify/callback`,
            cancel_url: returnUrl,
            desc: 'Verification',
            type: "json",
          });
          var reqConfig = {
            method: "post",
            url: (mode == "secure") ? "https://secure.aamarpay.com/jsonpost.php" : "https://sandbox.aamarpay.com/jsonpost.php",
            headers: {
              "Content-Type": "application/json",
            },
            data: fData,
          };
          // @ts-ignore
          axios.request(reqConfig).then(function (response) {
            console.log(response.data.payment_url);
            if (response.data.result == "true") {
              console.log(response.data.payment_url);
              return res
                .status(200)
                .json({ status: "success", url: response.data.payment_url });
            } else if (response.data.result !== "true") {
              return res
                .status(200)
                .json({
                  status: "failed",
                  type: "gateway",
                  msg: "Something went wrong.Please contact with us",
                });
            }
          });

          // var options = {
          //   'method': 'POST',
          //   'url': (mode == "secure") ? "https://secure.aamarpay.com/jsonpost.php" : "https://sandbox.aamarpay.com/jsonpost.php",
          //   'headers': {
          //     "Content-Type": "application/json",
          //     accept: "application/json"
          //   },
          //   body: JSON.stringify({
          //     "store_id": (mode == "secure") ? storeId : 'aamarpaytest',
          //     "signature_key": (mode == "secure") ? signatureKey : 'dbb74894e82415a2f7ff0ec3a97e4183',
          //     "cus_name": user.name || "Mr User",
          //     "cus_email": user.email || "user@tuitionappbd.com",
          //     "cus_phone": user.phone,
          //     "cus_add1": `${user.area || ""}, ${user.district || ""}, ${user.division || ""
          //       }`,
          //     "cus_add2": `${user.district || "Dhaka"}`,
          //     "cus_city": `${user.division || "Dhaka"}`,
          //     "cus_country": "Bangladesh",
          //     "amount": user.role == 'tutor' ? tutorVerificationFees : user.role == 'media' ? mediaVerificationFees : verificationFees,
          //     "tran_id": newApplication._id,
          //     "currency": "BDT",
          //     "success_url": `${appUrl}/api/callback`,
          //     "fail_url": `${appUrl}/api/callback`,
          //     "cancel_url": returnUrl,
          //     "desc": 'Verification',
          //     "type": "json"
          //   })

          // };
          // await request(options, async (error, response) => {
          //   if (error) {
          //     console.error(error)
          //     return res
          //       .status(200)
          //       .json({
          //         status: "failed",
          //         type: "gateway",
          //         msg: "Something went wrong in the payment processor.Please contact with us",
          //       });
          //   };
          //   const result = JSON.parse(response.body);
          //   if (result.result == "true") {
          //     return res
          //       .status(200)
          //       .json({ status: "success", url: result.payment_url });
          //   } else if (result.result !== "true") {
          //     return res
          //       .status(200)
          //       .json({
          //         status: "failed",
          //         type: "gateway",
          //         msg: "Something went wrong in the payment processor.Please contact with us",
          //       });
          //   }
          // });

        } catch (error) {
          console.log(error);
          res.status(200).json({ status: "failed", msg: "Please try again" });
        }
      }

    }
  } catch (error) {
    console.log(error);
    res.status(200).json({ status: "failed", msg: "Please login again" });
  }
};
//---------------------

const callBack = async (req, res) => {
  var dashboardDB = new JsonDB(new Config("dashboardData", true, false, "/"));
  const dashboardDataFile = fs.readFileSync("./dashboardData.json", "utf8");
  const data = JSON.parse(dashboardDataFile);
  const totalIncome = data.income;
  const totalUp = data.upgrade;

  const settingsFile = fs.readFileSync("./settingsData.json", "utf8");
  const settings = JSON.parse(settingsFile);
  const returnUrl = settings.payKeys.returnUrl;

  const { pay_status, mer_txnid } = req.body;
  try {
    const trx = await TRX.findOne({ _id: mer_txnid });
    if (pay_status == "Successful") {
      const expDate = moment(Date.now())
        .add(trx.days, "days");
      try {
        const user = await User.findOne({ _id: trx.userId });
        user.premiumEnd = expDate.valueOf();
        user.role = 'tutor';
        user.subEnd = expDate.format('YYYY-MM-DD');
        trx.status = "Successful";
        await trx.save();
        await user.save();
        res.redirect(returnUrl);
      } catch (error) {
        trx.status = "Failed";
        trx.save();
        res.redirect(returnUrl);
      }
      try {
        dashboardDB.push("/income", Number(totalIncome) + Number(trx.amount));
        dashboardDB.push("/upgrade", Number(totalUp) + 1);
      } catch { }
    } else {
      trx.status = "Failed";
      trx.save();
      res.redirect(returnUrl);
    }
  } catch (error) {
    res.redirect(returnUrl);
  }
};
const verification = async (req, res) => {
  const settingsFile = fs.readFileSync("./settingsData.json", "utf8");
  const settings = JSON.parse(settingsFile);
  const returnUrl = settings.payKeys.returnUrl;

  const { pay_status, mer_txnid } = req.body;
  try {
    const application = await Application.findOne({ _id: mer_txnid });
    if (pay_status == "Successful") {
      try {
        application.status = "paid";
        await application.save();
        res.redirect(returnUrl);
      } catch (error) {
        await Application.deleteMany({ _id: mer_txnid });
        res.redirect(returnUrl);
      }
    } else {
      // application.status = "failed";
      // application.save();
      await Application.deleteMany({ _id: mer_txnid });
      res.redirect(returnUrl);
    }
  } catch (error) {
    res.redirect(returnUrl);
  }
};
//---------------------
module.exports = {
  payment,
  callBack,
  verification,
  verify,
};
