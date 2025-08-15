const express = require("express");
const CryptoJS = require("crypto-js");
const stringifySafe = require("json-stringify-safe");
const { MongoClient, ServerApiVersion } = require("mongodb");
const axios = require("axios");
const path = require('path');
const session = require("express-session");
const http = require("http");
const { Server } = require('socket.io');
const fs = require("fs");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public', 'site')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: "cookie",
  secret: process.env['cookieSecret'],
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3 * 24 * 60 * 60 * 1000 },
}));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

app.use((req, res, next) => {
  if (req.path !== '/' && req.path.startsWith('/site/')) {
    req.url = req.url.replace('/site', '');
  }
  if (req.path !== '/' && req.path.startsWith('/panel/')) {
    req.url = req.url.replace('/panel', '');
  }
  if (req.path.endsWith('.html')) {
    return res.redirect(301, req.path.slice(0, -5));
  }
  next();
});

const byte = (str) => {
  let size = new Blob([str]).size;
  return size;
};

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function validatePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function rand(min, max) {
  return Math.random() * (max - min + 1) + min;
}

const uri = process.env["mongoURL"];
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db_name = "pixelit";
const db = client.db(db_name);
const users = db.collection("users");
const badges = db.collection("badges");
const news = db.collection("news");
const chatm = db.collection("chat");
const packs = db.collection("packs");

async function run() {
  try {
    await client.connect();
    await client.db(db_name).command({ ping: 1 });
    requests = await client.db(db_name).collection("requests").find().toArray();
    console.log(" Successfully connected to the database");
  } catch (e) {
    console.log(e);
  }
}
run().catch(console.dir);

const timezoneOffset = new Date().getTimezoneOffset();
const localTime = new Date(Date.now() - timezoneOffset * 60 * 1000);
const router = require("./routes.js");
app.use(router);

const port = 3000;
const encpass = process.env["encpass"];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("getChat", async () => {
    const messages = await chatm.find().toArray();
    socket.emit("chatupdate", messages);
  });
  
  socket.on("message", async (message) => {
    const username = message.sender;
    const timestamp = message.timestamp;
    const user = await users.findOne({ username: username });
    if (user.muted) {
      return socket.emit("error", "User is muted.");
    }
    console.log("sending message");
    try {
      if (byte(message.msg) > 1000 || message.msg.trim() === "") {
        console.log("message too long");
        return;
      }
      
      const chatMessage = {
        sender: username,
        msg: message.msg,
        badges: user.badges,
        pfp: user.pfp,
        timestamp: timestamp 
      };

        
          const cookief = socket.handshake.headers.cookie;
          console.log("getting response");

          const response = await axios.get(
              "https://e7526193-7c97-4f3b-8bb7-0fc58e33ca19-00-114uk91w9bqzr.worf.replit.dev/user",
              {
                  headers: {
                      Cookie: cookief,
                  },
                  validateStatus: function (status) {
                      return (status >= 200 && status < 300) || status === 500; 
                  },
                  withCredentials: true,
              }
          );

          console.log(response);
          if (response.status !== 500) {
              const username = response.data.username;
              const user = await users.findOne({ username: username });

              if (!user) {
                  console.log("User not found in database.");
                  return;
              }

              await chatm.insertOne(chatMessage);
              const updatedSentCount = user.sent + 1;
              const updatedTokensCount = user.tokens + 1;
              await users.updateOne(
                  { username: username },
                  { $set: { sent: updatedSentCount, tokens: updatedTokensCount } }
              );

              const messages = await chatm.find().toArray();
              io.emit("chatupdate", messages);
              console.log("message sent");
          } else {
              socket.emit("error", response.data);
          }
      } catch (error) {
          console.error("Error during message handling:", error);
      }
  });
  
  socket.on("getNews", async () => {
    const newsPosts = await news.find().toArray();
    socket.emit("getNews", newsPosts);
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server started successfully on port ${port}`);
  console.log(`Server is running at ${process.env["DEV_LINK"]}:${port}`);
});

console.log("Initializing server...");