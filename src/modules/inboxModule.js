const User = require("../models/User");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { default: mongoose } = require("mongoose");

//-------------------------------
const comeToInbox = async (req, res) => {
  const targetUser = await User.findOne({ _id: req.body.chatWith.toString() })
  const reqUser = await User.findOne({ _id: req.body.requesterId.toString() })
  if (
    (targetUser && ['tutor', 'media', 'admin', 'super'].includes(targetUser?.role) && ['user', 'tutor', 'media', 'admin', 'super'].includes(reqUser?.role)) ||
    (targetUser && ['user', 'tutor', 'media', 'admin', 'super'].includes(targetUser?.role) && ['tutor', 'media', 'admin', 'super'].includes(reqUser?.role)) || true
  ) {
    if (['tutor'].includes(reqUser?.role) && (Number(reqUser?.premiumEnd) > Number(Date.now())) || true) {
      if (req.body.chatWith.toString() == req.body.requesterId.toString()) {
        res.status(200).json({ err: true, msg: "You can not chat with yourself" });
      } else {
        try {
          const isValidObjectId = mongoose.Types.ObjectId.isValid;
          const requesterId = req.body.requesterId.toString();
          const chatWith = req.body.chatWith.toString();

          if (!isValidObjectId(requesterId) || !isValidObjectId(chatWith)) {
            res.status(400).json({ msg: "Invalid user ID" });
            return;
          }
          const chat = await Chat.findOne({
            members: {
              $all: [requesterId, chatWith],
            },
          });
          if (chat?._id) {
            res.status(200).json({ chatId: chat._id });
          } else {
            try {
              const newChat = new Chat({
                members: [req.body.requesterId.toString(), req.body.chatWith.toString()],
              });
              newChat.save();
              res.status(200).json({ chatId: newChat._id });
            } catch {
              res.status(500).json({ msg: "Oops! something went wrong" });
            }
          }
        } catch (e) {
          res.status(500).json({ msg: "Oops! something went wrong" });
        }
      }
    } else {
      if (req.body.chatWith.toString() == req.body.requesterId.toString()) {
        res.status(200).json({ err: true, msg: "You can not chat with yourself" });
      } else {
        try {
          const chats = await Chat.find({
            members: { $in: [reqUser?._id?.toString()] },
          })
          if (chats.length < 2) {
            const isValidObjectId = mongoose.Types.ObjectId.isValid;
            const requesterId = req.body.requesterId.toString();
            const chatWith = req.body.chatWith.toString();
            if (!isValidObjectId(requesterId) || !isValidObjectId(chatWith)) {
              res.status(400).json({ msg: "Invalid user ID" });
              return;
            }
            const chat = await Chat.findOne({
              members: {
                $all: [requesterId, chatWith],
              },
            });
            if (chat?._id) {
              res.status(200).json({ chatId: chat._id });
            } else {
              try {
                const newChat = new Chat({
                  members: [req.body.requesterId.toString(), req.body.chatWith.toString()],
                });
                newChat.save();
                res.status(200).json({ chatId: newChat._id });
              } catch {
                res.status(500).json({ msg: "Oops! something went wrong" });
              }
            }
          } else {
            res.status(200).json({ err: true, msg: "You have reached your free tier limit. plase upgrade" });
          }
        } catch (e) {
          res.status(500).json({ msg: "Oops! something went wrong" });
        }
      }
    }

  } else {
    res.status(200).json({ err: true, msg: "You are not allowed to do that." });
  }

};
// const comeToInbox = async (req, res) => {

//   if (req.body.chatWith.toString() == req.body.requesterId.toString()) {
//     res.status(400).json({ msg: "You can not chat with yourself" });
//   } else {
//     try {
//       const isValidObjectId = mongoose.Types.ObjectId.isValid;
//       const requesterId = req.body.requesterId.toString();
//       const chatWith = req.body.chatWith.toString();

//       if (!isValidObjectId(requesterId) || !isValidObjectId(chatWith)) {
//         res.status(400).json({ msg: "Invalid user ID" });
//         return;
//       }
//       const chat = await Chat.findOne({
//         members: {
//           $all: [requesterId, chatWith],
//         },
//       });
//       if (chat?._id) {
//         res.status(200).json({ chatId: chat._id });
//       } else {
//         try {
//           const newChat = new Chat({
//             members: [req.body.requesterId.toString(), req.body.chatWith.toString()],
//           });
//           newChat.save();
//           res.status(200).json({ chatId: newChat._id });
//         } catch {
//           res.status(500).json({ msg: "Oops! something went wrong" });
//         }
//       }
//     } catch (e) {
//       res.status(500).json({ msg: "Oops! something went wrong" });
//     }
//   }


// };


const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.body.requesterId.toString()] },
    })
      .populate('members', '_id avatarImg name status verified role lastActive')
      .populate('lastMessage', '_id sender deletedBy image text seen createdAt')
      .sort({ updatedAt: -1 });
    console.log(chats);
    res.status(200).send({
      chats: chats.filter(({ lastMessage }) => {
        if (lastMessage != null && Array.isArray(lastMessage.deletedBy)) {
          const deletedBy = lastMessage.deletedBy.map((id) => id.toString());
          return !deletedBy.includes(req.body.requesterId.toString());
        }
        return false;
      }),
      currentUser: req.body.requesterId
    });
  } catch (err) {
    console.log(err);
    res.status(200).send({
      chats: [],
      currentUser: req.body.requesterId
    });
  }
};
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      members: { $in: [req.body.requesterId.toString()] },
      _id: req.params.chatId
    })

    await Message.updateMany(
      {
        chatId: chat._id,
        deletedBy: { $nin: [req.body.requesterId.toString()] }
      },
      { $push: { deletedBy: req.body.requesterId.toString() } }
    );

    res
      .status(200)
      .send({ msg: 'success', });
  } catch (err) {
    console.log(err);
    res.status(200).send({ chats: [], currentUser: req.body.requesterId });
  }
};
const newMessage = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.body.chatId })
    if (chat) {
      const newMsg = await new Message({
        sender: req.body.requesterId,
        chatId: req.body.chatId,
        text: req.body.text,
        image: req.body.image,
        deletedBy: [],
        seen: false,
      });
      newMsg.save();
      chat.lastMessage = newMsg?._id
      chat.save()
      res.status(200).json({ id: newMsg._id });
    } else {
      res.status(400).json('error');
    }
  } catch (error) {
    res.status(400).json(error);
  }
};
const getMessage = async (req, res) => {
  const page = req.query.page || 1
  try {
    const chat = await Chat.findOne(
      { _id: req.params.chatId }
    ).populate('members', '_id avatarImg name status verified role lastActive')

    const friend = chat.members.filter((m) => m._id.toString() !== req.body.requesterId.toString())?.[0];
    const messages = await Message.find(
      {
        chatId: req.params.chatId,
        deletedBy: { $nin: [req.body.requesterId] }

      }
    ).sort({ createdAt: -1 })
      .skip(100 * (page - 1))
      .limit(100)

    res
      .status(200)
      .json({
        messages: messages.reverse(),
        chat: chat,
        currentUser: req.body.requesterId,
        friend: friend,
      });
  } catch (err) {
    res.status(200).json({ messages: [], currentUser: null, friend: null });
  }
};

module.exports = {
  comeToInbox,
  getChats,
  newMessage,
  getMessage,
  deleteChat
};
