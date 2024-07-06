const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app);
const {
  chatNotifyToOneUser,
  sendToSpecificUsers,
} = require("./src/modules/FCMModule");
var path = require("path");
var bp = require("body-parser");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
var cookieParser = require("cookie-parser");

const corsOption = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};
let URI = process.env.MONGODB_URI;
let user = process.env.MONGODB_USER;
let pass = process.env.MONGODB_PASS;
let Options = {
  user: user,
  pass: pass,
  autoIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
// @ts-ignore
mongoose.connect(URI, Options)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));



app.use(cors(corsOption));
// app.use(cookieParser());
global.appRoot = path.resolve(__dirname);
dotenv.config();
app.use(bp.json({ limit: "100mb" }));
app.use(bp.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.disable("x-powered-by");
app.use((err, req, res, next) => {
  if (err) {
    console.log('err: ' + err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
    });
  } else {
    next();
  }
});
// app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Socket------------------------
//------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
let users = [];
const addUser = (userId, socketId) => {
  const t = users.filter((user) => user.socketId == socketId);
  if (t.length == 0) {
    users.push({ userId: userId, socketId: socketId });
  }
};
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUsers = (userId) => {
  return users.filter((user) => user.userId === userId);
};
const getUsersBySocket = (socketId) => {
  return users.filter((user) => user.socketId === socketId);
};
//------------
io.on("connection", async (socket) => {
  socket.on("addUser", async (userId) => {
    addUser(userId, socket.id);
    try {
      const targetUser = await User.findOne({ _id: userId })
      if (targetUser) {
        targetUser.status = true;
        await targetUser.save();
        socket.broadcast.emit("active", { userId });
      } else {
        // Handle the case when the user is not found
        console.log(`User with ID ${userId} not found`);
      }
    } catch (error) {
      console.log(error);
    }
  });
  //send and get message
  socket.on("sendMessage", async ({ sender, receiverId, chatId, text, image, _id }) => {
    const array = getUsers(receiverId);
    if (array?.length !== 0) {
      for (let i = 0; i < array.length; i++) {
        io.to(array?.[i].socketId).emit("getMessage", {
          sender,
          text,
          chatId,
          image,
          _id
        });
      }
    } else {
      chatNotifyToOneUser(sender, receiverId, chatId, text, image);
    }
  });
  //send and get message
  socket.on("seen", async ({ senderId, messageId, chatId }) => {
    try {
      const message = await Message.findOne({ _id: messageId })
      message.seen = true;
      await message.save()
      const sender = getUsers(senderId);
      sender.map(i => {
        io.to(i.socketId).emit("seen", { messageId, chatId });
      })
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("delete", async ({ senderId, messageId, chatId }) => {
    const sender = getUsers(senderId)?.[0];
    sender.map(i => {
      io.to(i.socketId).emit("delete", { messageId, chatId });
    })
  });
  //when disconnect
  socket.on("disconnect", async () => {
    try {
      const userId = getUsersBySocket(socket.id)?.[0]?.userId;
      const tUsers = getUsers(userId);
      if ((tUsers.length - 1) == 0) {
        try {
          const targetUser = await User.findOne({ _id: userId })
          if (targetUser) {
            targetUser.status = false
            targetUser.lastActive = Date.now()
            await targetUser.save();
            socket.broadcast.emit("deActive", { userId });
          } else {
            console.log(`User with ID ${userId} not found`);
          }
        } catch (error) {
          console.log(error);
        }
      }
      removeUser(socket.id);

    } catch (error) {
      console.log(error);

    }
  });
});
// CornJobs---------------------
// ---------------------
const moment = require("moment");
const User = require("./src/models/User");
const corn = require("node-cron");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const Message = require("./src/models/Message");
const Application = require("./src/models/Application");
const Post = require("./src/models/Post");
var dashboardDB = new JsonDB(new Config("dashboardData", true, false, "/"));

corn.schedule("0 0 0 1 * *", async () => {
  dashboardDB.push("/login", 0);
  dashboardDB.push("/reg", 0);
});
//-----

// corn.schedule("0 0 0 * * *", async () => {
//   let next7days = moment(Date.now() + 7 * 24 * 3600 * 1000).format(
//     "YYYY-MM-DD"
//   );
//   try {
//     const users = await User.find({ role: "tutor", subEnd: next7days });
//     let notifyToFCM = users.map((a) => a._id.toString());
//     sendToSpecificUsers(
//       notifyToFCM,
//       null,
//       null,
//       "Renew your subscription",
//       "You have 7 days left as a tutor.Please renew your account"
//     );

//   } catch (error) {
//     console.log(error)
//   }
// });

corn.schedule("0 0 0 * * *", async () => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  try {
    await Application.deleteMany({
      date: { $lte: yesterday }
    })
  } catch (error) {
    console.log(error)

  }
});

// endCornJobs------------------

// app.use("/", require("./src/routes/index"));
app.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  } else {
    next();
  }
});
app.use("/api/", require("./src/routes/api/api"));
app.use("/api/admin/", require("./src/routes/admin/admin"));
app.use("/api/",require("./src/routes/serviceRoute"))
app.get("/*", (req, res) => {
  res.status(404).send();
});

// const fix = async () => {
//   const tutors = await User.find({ role: 'tutor' })
//   for (let i = 0; i < tutors.length; i++) {
//     const tutor = tutors[i];
//     if (tutor.subEnd && tutor.subEnd !== '') {
//       const momentDate = moment(tutor.subEnd, "YYYY-MM-DD");
//       if (momentDate.isValid()) {
//         tutor.premiumEnd = momentDate.valueOf();
//         await tutor.save();
//       } else {
//         console.log(`Failed to upgrade to premium this tutor with _id: ${tutor._id}`);
//       }
//     }
//   }
// }

const clustering = 6 > 7;
if (clustering == true) {
  const cluster = require('node:cluster');
  const totalCPUs = require('os').cpus().length;
  const process = require('node:process');
  const { availableParallelism } = require('node:os');
  const numCPUs = availableParallelism();

  if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      console.log("Let's fork another worker!");
      cluster.fork();
    });
  } else {

    const PORT = process.env.PORT;
    server.listen(PORT, function () {
      console.log(`server is running on ${PORT} `);

    });
  }
} else {
  const PORT = process.env.PORT;
  server.listen(PORT, function () {

    console.log(`server is running on ${PORT} `);
  });
}

