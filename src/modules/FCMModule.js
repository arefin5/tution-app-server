// const Device = require("../models/Device");
// const dotenv = require("dotenv");
// dotenv.config();
// var { firebaseAdmin } = require('./../utils/firebase');
// const { default: axios } = require("axios");
// const User = require("../models/User");

// const sendToSpecificUsers = async (userIds, post, screen, head, text) => {
//   const fcmArray = [];
//   for (const userId of userIds) {
//     const fcmDocs = await Device.find({ userId });
//     for (const fcmDoc of fcmDocs) {
//       fcmArray.push(fcmDoc.fcmToken);
//     }
//   }
//   if (fcmArray.length === 0) {
//     return;
//   }
//   const message = {
//     notification: {
//       sound: "default",
//       title: head,
//       body: text,
//       data: {
//         screen: screen,
//         dataObj: post,
//       }
//     },
//     tokens: fcmArray,
//   };
//   try {
//     const response = await firebaseAdmin.messaging().sendMulticast(message);
//     console.log(`${response.successCount} messages were sent successfully`);
//   } catch (error) {
//     console.error('Error sending message:', error);
//   }
//   return;
// };

// const sendToAllUsers = async (req, res) => {
//   const fcmArray = [];
//   const fcmDocs = await Device.find();
//   for (const fcmDoc of fcmDocs) {
//     fcmArray.push(fcmDoc.fcmToken);
//   }
//   if (fcmArray.length === 0) {
//     return;
//   }
//   const message = {
//     notification: {
//       sound: "default",
//       title: req.body.title,
//       body: req.body.text,
//     },
//     tokens: fcmArray,
//   };
//   try {
//     const response = await firebaseAdmin.messaging().sendMulticast(message);
//     console.log(`${response.successCount} messages were sent successfully`);
//   } catch (error) {
//     console.error('Error sending message:', error);
//   }
//   return res.status(200).json({ msg: 'success' })
// };


// const sendToOneUsers = async (req, res) => {
//   const fcmArray = [];
//   const fcmDocs = await Device.find({ userId: req.body.userId });
//   for (const fcmDoc of fcmDocs) {
//     fcmArray.push(fcmDoc.fcmToken);
//   }
//   if (fcmArray.length === 0) {
//     return;
//   }
//   const message = {
//     notification: {
//       sound: "default",
//       title: req.body.title,
//       body: req.body.text,
//     },
//     tokens: fcmArray,
//   };
//   try {
//     const response = await firebaseAdmin.messaging().sendMulticast(message);
//     console.log(`${response.successCount} messages were sent successfully`);
//   } catch (error) {
//     console.error('Error sending message:', error);
//   }
//   return res.status(200).json({ msg: 'success' })
// };


// const chatNotifyToOneUser = async (sender, receiverId, chatId, text, image) => {
//   const senderUser = await User.findOne({ _id: sender }).select(
//     "name avatarImg "
//   );

//   const fcmArray = [];
//   const fcmDocs = await Device.find({ receiverId });
//   for (const fcmDoc of fcmDocs) {
//     fcmArray.push(fcmDoc.fcmToken);
//   }
//   if (fcmArray.length === 0) {
//     return;
//   }
//   const message = {
//     notification: {
//       sound: "default",
//       title: senderUser.name,
//       body: image ? "Sent a photo" : text ? text : "Empty message",
//       data: {
//         screen: "Chat",
//         dataObj: {
//           userData: senderUser,
//           chatId: chatId,
//         },
//       },
//     },
//     tokens: fcmArray,
//   };
//   try {
//     const response = await firebaseAdmin.messaging().sendMulticast(message);
//     console.log(`${response.successCount} messages were sent successfully`);
//   } catch (error) {
//     console.error('Error sending message:', error);
//   }
//   return;
// };
// const regFcm = async (req, res) => {
//   try {
//     const device = await Device.find({
//       fcmToken: req.body.fcmToken,
//       userId: req.body.userId,
//     });
//     if (device.length == 0) {
//       const newDevice = await new Device({
//         fcmToken: req.body.fcmToken,
//         userId: req.body.userId,
//       });
//       newDevice.save();
//       return res.status(200).json({ msg: "Registered" });
//     } else {
//       return res.status(200).json({ msg: "successful" });
//     }
//   } catch (error) {
//     return res.status(200).json({ msg: "Something went wrong" });
//   }
// };
// const deleteFcm = async (req, res) => {
//   try {
//     await Device.deleteOne({
//       fcmToken: req.body.fcmToken,
//     });
//     return res.status(200).json({ msg: "Successfully deleted" });
//   } catch (error) {
//     return res.status(200).json({ msg: "Oops" });
//   }
// };
// module.exports = {
//   sendToSpecificUsers,
//   sendToAllUsers,
//   sendToOneUsers,
//   chatNotifyToOneUser,
//   regFcm,
//   deleteFcm,
// };



const Device = require('./../models/Device')
const dotenv = require("dotenv");
dotenv.config();
// var FCM = require('fcm-node');
const { default: axios } = require('axios');
const User = require('../models/User');
// const { reportView } = require('./adminPanelController');
// var serverKey = process.env.FCM_SERVER_KEY; //put your server key here


const sendToSpecificUsers = async (userIds, post, screen, head, text) => {
  let fcmTokens = []
  const devices = await Device.find();
  for (let x = 0; x < userIds.length; x++) {
    let devicesForOneUser = await devices.filter((el) => { return el.userId == userIds[x] });
    for (let i = 0; i < devicesForOneUser.length; i++) {
      fcmTokens = [...fcmTokens, devicesForOneUser[i].fcmToken]
    }
  }
  const callAPI = async (data) => {
    const res = await axios(data)
      .then(async (r) => {
        let response = r.data.data
        for (let x = 0; x < response.length; x++) {
          if (response[x] && response[x].status == 'error') {
            try {
              await Device.deleteOne({
                fcmToken: response[x].details.expoPushToken
              });
            } catch (error) { }
          };
        }
      }).catch(e => { });
  }

  let promises = [];

  const message = {
    to: fcmTokens.slice(0, 500),
    sound: 'default',
    title: head,
    body: text,
    data: {
      screen: screen,
      dataObj: post
    },
  };
  const options = {
    url: 'https://exp.host/--/api/v2/push/send',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    data: message
  };
  promises.push(callAPI(options));

  const result = await Promise.all(promises);
  return result;
}


const sendToAllUsers = async (req, res) => {
  const callAPI = async (data) => {
    const res = await axios(data).then(async (r) => { page = page + 1; console.log(r.data.data) }).catch(e => { });
  }
  let fcmTokens = []
  const devices = await Device.find();
  for (let i = 0; i < devices.length; i++) {
    fcmTokens = [...fcmTokens, devices[i].fcmToken]
  }

  let page = 1;
 
  
   
    const message = {
      to: fcmTokens.slice(0, 500),
      sound: 'default',
      title: req.body.title,
      body: req.body.text,

    };
    const options = {
      url: 'https://exp.host/--/api/v2/push/send',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      data: message
    };

  await callAPI(options)
  
  return;
}
const sendToOneUsers = async (req, res) => {
  let fcmTokens = []
  const devices = await Device.find();
  let devicesForOneUser = await devices.filter((el) => { return el.userId == req.body.notifyTo });
  for (let i = 0; i < devicesForOneUser.length; i++) {
    fcmTokens = [...fcmTokens, devicesForOneUser[i].fcmToken]
  }
  const message = {
    to: fcmTokens,
    sound: 'default',
    title: req.body.title,
    body: req.body.text,

  };
  const options = {
    url: 'https://exp.host/--/api/v2/push/send',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    data: message
  };
  // @ts-ignore
  await axios(options)
    .then(async (res) => {
      let response = res.data.data
      for (let x = 0; x < response.length; x++) {
        if (response[x] && response[x].status == 'error' && response[x].error == 'DeviceNotRegistered') {

          try {
            await Device.deleteOne({
              fcmToken: response[x].details.expoPushToken
            });
          } catch (error) { }
        };
      }
    }).catch(e => {
      console.log(e)
    });
  return ;
}
const chatNotifyToOneUser = async (sender, receiverId, chatId, text, image) => {
  const senderUser = await User.findOne({ _id: sender }).select('name avatarImg ');
  let fcmTokens = []
  const devices = await Device.find();
  let devicesForOneUser = await devices.filter((el) => { return el.userId == receiverId });
  for (let i = 0; i < devicesForOneUser.length; i++) {
    fcmTokens = [...fcmTokens, devicesForOneUser[i].fcmToken]
  }
  const message = {
    to: fcmTokens,
    sound: 'default',
    title: senderUser.name,
    body: image ? 'Sent a photo' : text ? text : 'Empty message',
    data: {
      screen: "Chat",
      dataObj: {
        userData: senderUser,
        chatId: chatId
      }
    },
  };
  const options = {
    url: 'https://exp.host/--/api/v2/push/send',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    data: message
  };
  // @ts-ignore
  return await axios(options)
    .then(async (res) => {
      let response = res.data.data
      for (let x = 0; x < response.length; x++) {
        if (response[x] && response[x].status == 'error' && response[x].error == 'DeviceNotRegistered') {
          try {
            await Device.deleteOne({
              fcmToken: response[x].details.expoPushToken
            });
          } catch (error) { }
        };
      }
    }).catch(e => {

    });

}
const regFcm = async (req, res) => {
  try {
    const device = await Device.find({
      fcmToken: req.body.fcmToken,
      userId: req.body.userId,
    })
    if (device.length == 0) {
      const newDevice = await new Device({
        fcmToken: req.body.fcmToken,
        userId: req.body.userId,
      });
      newDevice.save()
      return res.status(200).json({ msg: "Registered" });
    } else {
      return res.status(200).json({ msg: "successful" });
    }
  } catch (error) {
    return res.status(200).json({ msg: "Something went wrong" });
  }
}
const deleteFcm = async (req, res) => {
  try {
    await Device.deleteOne({
      fcmToken: req.body.fcmToken,
    });
    return res.status(200).json({ msg: "Successfully deleted" });
  } catch (error) {
    return res.status(200).json({ msg: "Oops" });

  }
}
module.exports = {
  sendToSpecificUsers,
  sendToAllUsers,
  sendToOneUsers,
  chatNotifyToOneUser,
  regFcm,
  deleteFcm,
}