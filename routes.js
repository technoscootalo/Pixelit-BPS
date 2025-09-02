const path = require('path');
require('dotenv').config();
const express = require("express");
const router = express.Router();
const { MongoClient, ServerApiVersion, Timestamp } = require("mongodb");
const { ObjectId } = require("mongodb");
const uri = process.env.mongoURL;
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcrypt');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, 
  message: "Too many requests, please try again after 15 minutes",
  standardHeaders: true, 
  legacyHeaders: false, 
});

const packOpenLimiter = rateLimit({
  windowMs: 1000, 
  max: 2,
  message: "Too many pack openings, please try again later.",
});

const RARITY_VALUES = {
  uncommon: 5,
  rare: 20,
  epic: 75,
  legendary: 200,
  chroma: 300,
  mystical: 1000
};

function rand(min, max) {
  return /*Math.floor(*/ Math.random() * (max - min + 1) /*)*/ + min;
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let requests;
function formatDateTime(dateTime) {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return dateTime.toLocaleString(undefined, options);
}

const timezoneOffset = new Date().getTimezoneOffset();
const localTime = new Date(Date.now() - timezoneOffset * 60 * 1000);
async function run() {
  try {
    await client.connect();
    await client.db(db_name).command({ ping: 1 }); 

    requests = await client.db(db_name).collection("requests").find().toArray();
  } catch {
    console.log("mongodb connection error");
  }
}
run().catch(console.dir);

const db_name = "pixelit";
const db = client.db(db_name);
const newsCollection = db.collection("news");
const users = db.collection("users");
const badges = db.collection("badges");
const chatm = db.collection("chat");
const packs = db.collection("packs");

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function validatePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

router.get("/user", async (req, res) => {
  const session = req.session;
  if (session.loggedIn) {
      const db = client.db(db_name);
      const collection = db.collection("users");
      const user = await collection.findOne({ username: session.username });
      if (user) {
          res.status(200).send({
              username: user.username,
              uid: user._id,
              tokens: user.tokens,
              packs: user.packs,
              role: user.role,
              pfp: user.pfp,
              banner: user.banner,
              badges: user.badges,
              claimed: user.claimed,
              muted: user.muted,
              muteReason: user.muteReason || "",
              banned: user.banned,
              banReason: user.banReason || "",
              stats: { sent: user.sent, packsOpened: user.packsOpened },
              muteDuration: user.muteDuration,
              banDuration: user.banDuration,
              notifications: user.notifications,
          });
      }
  } else {
      res.status(401).send("You are not logged in");
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = client.db(db_name);
    const collection = db.collection("users");
    const name = req.body.username;
    const pass = req.body.password;
    const user = await collection.findOne({ username: name });

    if (user.banned){
      return res.status(403).send(`Your account is currently banned. Reason: ${user.banReason || "No reason provided."}`);
    }

    if (user) {
      if (await validatePassword(pass, user.password)) {
        req.session.loggedIn = true;
        req.session.username = user.username;
        req.session.tokens = user.tokens;
        req.session.uid = user._id;
        req.session.packs = user.packs;
        req.session.stats = { sent: user.sent, packsOpened: user.packsOpened };
        req.session.pfp = user.pfp;
        req.session.claimed = user.claimed;
        req.session.banner = user.banner;
        req.session.badges = user.badges;

        await sendLoginWebhook(user.username);

        res.sendStatus(200);
      } else {
        res.status(401).send("Username or Password is incorrect!");
      }
    } else {
      res.status(401).send("User not found!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error!");
  }
});

async function sendLoginWebhook(username) {
  const webhookUrl = process.env.webhookUrl;

  const payload = {
    content: `${username} has logged into pixelit.`
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Error sending Discord webhook:', error);
  }
}

router.post("/logout", (req, res) => {
  const username = req.session.username;
  req.session.destroy(async (err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error logging out");
    } else {
      await sendLogoutWebhook(username);
      res.sendStatus(200);
    }
  });
});

async function sendLogoutWebhook(username) {
  const webhookUrl = process.env.webhookUrl;

  if (!webhookUrl) {
    console.log('Discord webhook URL not configured, skipping logout webhook');
    return;
  }

  const payload = {
    content: `${username} has logged out of pixelit.`
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    console.log(`Discord logout webhook sent for user: ${username}`);
  } catch (error) {
    console.error('Error sending Discord logout webhook:', error);
  }
}

router.post("/register", limiter, async (req, res) => {
  try {
    const db = client.db(db_name);
    const users = db.collection("users");
    const userRequests = db.collection("requests");
    const user = await users.findOne({ username: req.body.username });

    if (user === null) {
      const request = await userRequests.findOne({
        username: req.body.username,
      });
      if (request === null) {
        console.log("adding request");
        const hashedPassword = await hashPassword(req.body.password);
        const timezone = formatDateTime(localTime);
        await userRequests.insertOne({
          username: req.body.username,
          password: hashedPassword,
          discord: req.body.discord,
          age: req.body.age,
          reason: req.body.reason,
          date: timezone,
        });
        res.sendStatus(200);
      } else {
        res.status(500).send("Request has already been sent!");
      }
    } else {
      res.status(500).send("That username already exists!");
    }
  } catch (err) {
    console.error(err);
    res.status(502).send("Server Error!");
  }
});

router.get("/requests", async (req, res) => {
  if (req.session.loggedIn) {
    
    const db = client.db(db_name);
    const collection = db.collection("users");
    const user = await collection.findOne({ username: req.session.username });
    
    if (user) {
      if (["Owner", "Admin", "Moderator", "Helper", "Developer"].includes(user.role)) {
        const requests = await client
          .db(db_name)
          .collection("requests")
          .find()
          .toArray();
        res.status(200).send(requests);
      } else {
        res.status(500).send("You're not a staff member");
      }
    } else {
      res.status(500).send("The account your under does not exist");
    }
  } else {
    res.status(500).send("You're not logged in");
  }
});

router.post("/addAccount", async (req, res) => {
  const db = client.db(db_name);
  const users = db.collection("users");
  const userRequests = db.collection("requests");
  const crypto = require("crypto")

  function generateRandomId() {
    return Math.floor(Math.random() * 10000000000000000)
  }

  const person = await users.findOne({ username: req.session.username });
  if (
    person &&
    ["Owner", "Admin", "Moderator", "Helper", "Developer"].includes(person.role)
  ) {
    const request = await userRequests.findOne({ username: req.body.username });
    if (req.body.accepted) {
      if (request !== null) {
        if (req.body.accepted == true) {
          await userRequests.deleteOne({ username: req.body.username });
          await users.insertOne({
            username: req.body.username,
            password: request.password,
            pfp:"https://izumiihd.github.io/pixelitcdn/assets/img/blooks/logo.png",
            banner: "https://izumiihd.github.io/pixelitcdn/assets/img/banner/pixelitBanner.png",
            id: generateRandomId(),
            role: "Player",
            tokens: 0,
            sent: 0,
            claimed: false,
            muted: false,
            muteReason: "No Reason Provided",
            banned: false,
            banReason: "No Reason Provided",
            packs: await packs.find().toArray(),
            badges: [],
            banDuration: 0,
            muteDuration: 0,
            notifications: [],
            joinDate: new Date().toISOString(),
         });
        }
        try {
          io.emit("getAccounts", "get");
        } catch (e) {
          console.log(e);
        }
        res.status(200).send("User accepted");
      } else {
        res.status(500).send("The request doesn't exist.");
      }
    } else {
      await userRequests.deleteOne({ username: req.body.username });
      res.status(200).send("User declined");
    }
  } else {
    res.status(200).send("You don't exist or you are not a staff member");
  }
});

router.post("/changePassword", async (req, res) => {
  const db = client.db(db_name);
  const users = db.collection("users");

  const user = await users.findOne({ username: req.session.username });

  if (user && (user.role == "Owner" || user.role == "Developer")) {
    const person = await users.findOne({ username: req.body.username });
    if (person != null) {
      const hashedPassword = await hashPassword(req.body.new_password);
      await users.updateOne(
        { username: req.body.username },
        {
          $set: {
            password: hashedPassword,
          },
        },
      );
      res.status(200).send("Ok");
    } else {
      res.status(404).send("Not Found");
    }
  } else {
    res.status(403).send("Forbidden");
  }
});

router.get("/packs", async (req, res) => {
  if (!req.session.loggedIn) {
    res.status(500).send("You must be logged in to access this page.");
    return;
  }
  const db = client.db(db_name);
  const collection = db.collection("packs");
  const packs = await collection.find().toArray();
  res.status(200).send(packs);
});

router.get("/users", async (req, res) => {
  const session = req.session;
  if (!(session && session.loggedIn)) {
    res.status(500).send("You must be logged in");
    return;
  }
  const users2 = await users.find().toArray();
  users2.forEach((user) => {
    delete user.password;
    delete user.salt;
  });
  res.status(200).send({ users: users2 });
});

router.post("/addPack", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;

  const user = await users.findOne({ username: req.session.username });

  if (user == null || (user.role !== "Owner" && user.role !== "Developer")) {
    console.log("need authorisation to add packs");
    res.status(500).send("Need authorisation to add packs");
    return;
  }
  const pack = req.body;

  const newpack = {
    name: pack.name,
    image: pack.image,
    cost: pack.cost,
    visible: true,
    blooks: [],
  };
  try {
    await packs
      .insertOne(newpack)
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
    await users
      .updateMany(
        { packs: { $nin: [pack.name] } },
        { $push: { packs: newpack } },
      )
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
  } catch (e) {
    console.log(e);
  }
  console.log("added new pack: " + newpack.name);
  const packs2 = await packs.find({ visible: true }).toArray();
  res.status(200).send({ packs: packs2 });
});

router.post("/removePack", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;
  const user = await users.findOne({ username: req.session.username });
  if (user == null || (user.role !== "Owner" && user.role !== "Developer")) {
    res.status(500).send("Need authorisation to remove packs");
    return;
  }
  console.log("removing pack: " + req.body.name);
  const pack = req.body;
  try {
    await packs
      .deleteOne({ name: pack.name })
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
    await users
      .updateMany(
        { "packs.name": pack.name },
        { $pull: { packs: { name: pack.name } } },
      )
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
  } catch (e) {
    console.log(e);
  }
  const packs2 = await packs.find().toArray();
  res.status(200).send({ packs: packs2 });
});

router.post("/addBlook", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;
  const user = await users.findOne({ username: req.session.username });
  if (user == null || (user.role !== "Owner" && user.role !== "Developer")) {
    res.status(500).send("Need authorisation to add blooks");
    return;
  }
  const blook = req.body;

  try {
    await packs
      .updateOne(
        { name: blook.parent },
        {
          $push: {
            blooks: {
              name: blook.name,
              imageUrl: blook.image, 
              rarity: blook.rarity, 
              chance: blook.chance,
              parent: blook.parent,
              color: blook.color,
              owned: 0,
              visible: true,
            },
          },
        },
      )
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
    await users.updateMany(
      { "packs.name": blook.parent },
      { $addToSet: { "packs.$[pack].blooks": blook } }, 
      { arrayFilters: [{ "pack.name": blook.parent }] }, 
    );
  } catch (e) {
    console.log(e);
  }
});

router.post("/removeBlook", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;
  const user = await users.findOne({ username: req.session.username });
  if (user == null || (user.role !== "Owner" && user.role !== "Developer")) {
    res.status(500).send("Need authorisation to add blooks");
    return;
  }
  const blook = req.body;

  await packs
    .updateOne(
      { name: blook.parent },
      {
        $pull: {
          blooks: {
            name: blook.name,
          },
        },
      },
    )
    .then((result) => {
      console.log("Update operation result:", result);
    })
    .catch((error) => {
      console.error("Error updating database:", error);
    });
  await users
    .updateMany(
      { "packs.name": blook.parent, "packs.blooks.name": blook.name }, 
      { $pull: { "packs.$[pack].blooks": { name: blook.name } } }, 
      { arrayFilters: [{ "pack.name": blook.parent }] }, 
    )
    .then((result) => {
      console.log("Update operation result:", result);
    })
    .catch((error) => {
      console.error("Error updating database:", error);
    });
  console.log(`removed blook from ${blook.parent}: ` + blook.name);
  res.status(200).send("Removed blook");
});

router.get("/getAccounts", async (req, res) => {
  try {
    const usersList = await users.find().toArray();
    res.status(200).json(usersList);
  } catch (err) {
    res.status(500).send("Error retrieving users");
  }
});

router.post("/spin", async (req, res) => {
    const session = req.session;

    if (!session.loggedIn) {
        return res.status(401).json({ message: "You must be logged in to spin." });
    }

    try {
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ username: session.username });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const now = Date.now();

        if (user.claimed && now - user.lastSpin < 8 * 3600000) { 
            return res.status(429).json({ message: "Tokens have already been claimed. Please wait for the next 8 hours to be able to claim your tokens again!" });
        }

        const tokensWonRandom = [500, 600, 700, 800, 900, 1000][Math.floor(Math.random() * 6)];

        await usersCollection.updateOne(
            { username: session.username },
            {
                $inc: { tokens: tokensWonRandom },
                $set: { claimed: true, lastSpin: now } 
            }
        );

        res.status(200).json({
            message: "Spin successful",
            tokensWon: tokensWonRandom,
        });

        setTimeout(async () => {
            await usersCollection.updateOne(
                { username: session.username },
                { $set: { claimed: false } } 
            );
        }, 8 * 3600000);

    } catch (error) {
        console.error("Error managing spins:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const app = express();

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('username tokens rarity');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.post("/sellBlook", async (req, res) => {
  const { name, rarity, tokensToAdd, quantity } = req.body;
  const validTokensToAdd = (RARITY_VALUES[rarity] || 0) * quantity; 

  if (!req.session || !req.session.loggedIn) {
    return res.status(401).json({ success: false, message: "You must be logged in to sell a blook." });
  }

  if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ success: false, message: "Invalid quantity specified." });
  }

  if (tokensToAdd !== validTokensToAdd) {
    return res.status(400).json({ success: false, message: "Invalid tokens to add specified." });
  }

  try {
    const user = await users.findOne({ username: req.session.username });
    const pack = user.packs.find(p => p.blooks.some(b => b.name === name));

    if (!pack) {
      return res.status(404).json({ success: false, message: "Blook not found in your packs." });
    }

    const blook = pack.blooks.find(b => b.name === name);

    if (!blook) {
      return res.status(404).json({ success: false, message: "Blook not found." });
    }

    if (blook.owned < quantity) {
      return res.status(400).json({ success: false, message: "You don't have enough of this blook to sell.", actualOwned: blook.owned });
    }

    blook.owned -= quantity;
    user.tokens += tokensToAdd;

    await users.updateOne({ username: req.session.username }, { $set: { packs: user.packs, tokens: user.tokens } });

    res.json({ success: true, message: `Successfully sold ${quantity} ${name}(s).`, newBalance: user.tokens });
  } catch (error) {
    console.error("Error selling blook:", error);
    res.status(500).json({ success: false, message: "An error occurred while selling the blook." });
  }
});

router.get("/user", async (req, res) => {
  const session = req.session;
  if (session.loggedIn) {
    try {
      const user = await users.findOne({ username: session.username });
      if (user) {
        res.status(200).json({
          username: user.username,
          tokens: user.tokens,
        });
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(401).send("You are not logged in");
  }
});

router.get("/packs", async (req, res) => {
  try {
    const allPacks = await packs.find().toArray();
    res.status(200).json(allPacks);
  } catch (error) {
    console.error("Error fetching packs:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/openPack", packOpenLimiter, async (req, res) => {
    const session = req.session;
    if (session && session.loggedIn) {
        const user = { name: session.username };
        const packName = req.query.pack;

        try {
            const person = await users.findOne({ username: user.name });
            const pack = await packs.findOne({ name: packName });

            if (!person || !pack) {
                return res.status(404).json({ error: "User or pack not found" });
            }
            if (person.tokens < pack.cost) {
                return res.status(400).json({ error: "Not enough tokens" });
            }

            const blooks = pack.blooks.filter(blook => blook.visible === true); 

            let totalChance = blooks.reduce((sum, blook) => sum + Number(blook.chance), 0);
            if (totalChance === 0) {
                return res.status(500).json({ error: "No blooks available to select from" });
            }

            const randNum = rand(0, totalChance);
            let currentChance = 0;
            let selectedBlook;

            for (const blook of blooks) {
                if (randNum >= currentChance && randNum < currentChance + Number(blook.chance)) {
                    selectedBlook = blook;
                    break;
                }
                currentChance += Number(blook.chance);
            }

            if (!selectedBlook) {
                return res.status(500).json({ error: "Failed to select a blook" });
            }

            await users.updateOne(
                { username: user.name },
                {
                    $inc: { 
                        tokens: -pack.cost,
                        [`packs.$[pack].blooks.$[blook].owned`]: 1,
                        packsOpened: 1
                    }
                },
                {
                    arrayFilters: [
                        { "pack.name": pack.name },
                        { "blook.name": selectedBlook.name }
                    ]
                }
            );
            res.status(200).json({ pack: pack.name, blook: selectedBlook });
            console.log(`${user.name} opened ${pack.name} and got ${selectedBlook.name}`);
        } catch (error) {
            console.error("Error opening pack:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

router.post("/muteBanUser", async (req, res) => {
    try {
        const { username, action, reason, duration } = req.body;
        const user = await users.findOne({ username: req.session.username });

        const durationInt = parseInt(duration, 10);

        if (isNaN(durationInt) || durationInt < 0) {
            return res.status(400).send("Invalid duration specified. Duration must be a non-negative integer.");
        }

        if (action === "mute") {
            if (user && ["Owner", "Developer", "Moderator", "Admin", "Helper"].includes(user.role)) {
                await users.updateOne(
                    { username },
                    { 
                        $set: { 
                            muted: true, 
                            muteReason: reason || "No reason provided", 
                            muteDuration: durationInt 
                        }
                    }
                );

                if (durationInt > 0) {
                    setTimeout(async () => {
                        await users.updateOne(
                            { username },
                            { 
                                $set: { 
                                    muted: false, 
                                    muteReason: "No reason provided", 
                                    muteDuration: 0 
                                } 
                            }
                        );
                    }, durationInt * 60 * 1000);
                }

                return res.status(200).send(`${username} has been muted for ${durationInt} minute(s).`);
            } else {
                return res.status(403).send("You do not have permission to mute users.");
            }
        }

        if (action === "ban") {
            if (user && ["Owner", "Developer", "Admin", "Moderator"].includes(user.role)) {
                await users.updateOne(
                    { username },
                    { 
                        $set: { 
                            banned: true, 
                            banReason: reason || "No reason provided", 
                            banDuration: durationInt 
                        }
                    }
                );

                if (durationInt > 0) {
                    setTimeout(async () => {
                        await users.updateOne(
                            { username },
                            { 
                                $set: { 
                                    banned: false, 
                                    banReason: "No reason provided", 
                                    banDuration: 0 
                                } 
                            }
                        );
                    }, durationInt * 60 * 1000);
                }

                return res.status(200).send(`${username} has been banned for ${durationInt} minute(s).`);
            } else {
                return res.status(403).send("You do not have permission to ban users.");
            }
        }

        return res.status(400).send("Invalid action specified. Use 'mute' or 'ban'.");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error!");
    }
});

router.post("/unmuteUnbanUser", async (req, res) => {
    try {
        const { username, action } = req.body;
        const user = await users.findOne({ username: req.session.username });
        const targetUser = await users.findOne({ username });

        if (!targetUser) {
            return res.status(404).send("User not found");
        }

        if (action === "unmute") {
            if (user && ["Owner", "Developer", "Moderator", "Admin", "Helper"].includes(user.role)) {
                await users.updateOne(
                    { username },
                    { 
                        $set: {
                            muted: false,
                            muteReason: "No reason provided",
                            muteDuration: 0 
                        }
                    }
                );
                return res.status(200).send(`${username} has been unmuted.`);
            } else {
                return res.status(403).send("You do not have permission to unmute users.");
            }
        }

        if (action === "unban") {
            if (user && ["Owner", "Developer", "Admin", "Moderator"].includes(user.role)) {
                await users.updateOne(
                    { username },
                    { 
                        $set: {
                            banned: false,
                            banReason: "No reason provided",
                            banDuration: 0 
                        }
                    }
                );
                return res.status(200).send(`${username} has been unbanned.`);
            } else {
                return res.status(403).send("You do not have permission to unban users.");
            }
        }

        return res.status(400).send("Invalid action specified. Use 'unmute' or 'unban'.");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error!");
    }
});

router.get("/leaderboard", async (req, res) => {
  try {
      const usersList = await users.find().toArray();

      const leaderboard = usersList
          .map(user => ({
              username: user.username || 'Unknown',
              role: user.role || 'Unknown',
              tokens: user.tokens || 0
          }))
            .sort((a, b) => b.tokens - a.tokens)
            .slice(0, 10);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});

router.get("/top-senders", async (req, res) => {
    try {
        const usersList = await users.find().toArray();
        const topSenders = usersList
            .map(user => ({
                username: user.username,
                role: user.role,  
                sent: user.sent
            }))
            .sort((a, b) => b.sent - a.sent)
            .slice(0, 10);

        res.status(200).json(topSenders);
    } catch (error) {
        console.error('Error fetching top senders:', error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/changePfp", async (req, res) => {
  const session = req.session;
  const { name, parent } = req.body;

  if (!session || !session.loggedIn) {
    return res.status(401).json({ message: "You must be logged in to change your profile picture." });
  }

  try {
    const user = await users.findOne({ username: session.username });
    const pack = user.packs.find(p => p.name === parent);

    if (!pack) {
      return res.status(404).json({ message: "Pack not found." });
    }

    const blook = pack.blooks.find(blook => blook.name === name);
    if (!blook || blook.owned < 1) {
      return res.status(400).json({ message: "You do not own this blook." });
    }

    if (session.pfp === blook.imageUrl) {
      return res.status(200).json({ message: "This is already your profile picture." });
    }

    await users.updateOne(
      { username: session.username },
      { $set: { pfp: blook.imageUrl } }
    );

    return res.status(200).json({ message: "Profile picture changed successfully." });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/changeUsername", async (req, res) => {
    const session = req.session;
    const { newUsername, password } = req.body;

    if (!session.loggedIn) {
        return res.status(401).send("You must be logged in to change your username.");
    }

    const user = await users.findOne({ username: session.username });

    if (user && await validatePassword(password, user.password)) {
        const normalizedNewUsername = newUsername.toLowerCase();

        const existingUser = await users.findOne({ username: normalizedNewUsername });

        if (existingUser) {
            return res.status(400).send("Username already exists.");
        }

        const normalizedCurrentUsername = user.username.toLowerCase();
        if (normalizedCurrentUsername === normalizedNewUsername) {
            return res.status(400).send("New username cannot be the same as the current username (case-insensitive).");
        }

        await users.updateOne(
            { _id: user._id },
            { $set: { username: newUsername } }
        );
        req.session.username = newUsername; 
        res.status(200).send("Username changed successfully.");
    } else {
        res.status(401).send("Incorrect password.");
    }
});

router.post("/changePassword", async (req, res) => {
    const session = req.session;
    const { currentPassword, newPassword } = req.body;
    if (!session || !session.loggedIn) {
        return res.status(401).json({ message: "You must be logged in to change your password." });
    }
    try {
        const user = await users.findOne({ username: session.username });
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: "Invalid current password." });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await users.updateOne(
            { username: session.username },
            { $set: { password: hashedPassword } }
        );
        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.get("/allUsers", async (req, res) => {
  try {
    const allUsers = await users.find().toArray();
    allUsers.forEach(user => {
      delete user.password; 
      delete user.salt;    
    });
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

router.get("/badges", async (req, res) => {
    try {
        const badgesList = await badges.find().toArray();
        res.status(200).json(badgesList); 
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).send("Internal Server Error");     
    }
});

router.post("/add-badge", async (req, res) => {
    console.log("Request body:", req.body);
    const { username, badge } = req.body;

    try {
        if (!username || !badge) {
            return res.status(400).json({ message: "Username and badge data are required" }); 
        }

        const user = await users.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedBadges = [...(user.badges || []), {
            name: badge.name,
            image: badge.image
        }];

        await users.updateOne({ username: username }, { $set: { badges: updatedBadges } });
        res.status(200).json({ message: "Badge added successfully!" }); 
    } catch (error) {
        console.error("Error adding badge:", error);
        res.status(500).json({ message: "Error adding badge: " + error.message }); 
    }
});

router.post('/checkUser', async (req, res) => {
  const { username } = req.body;
  const user = await users.findOne({ username });

  if (user) {
    return res.json({ exists: true });
  } else {
    return res.json({ exists: false });
  }
});

router.post("/giftBlook", async (req, res) => {
  const { recipient, name, rarity } = req.body; 

  if (!req.session || !req.session.loggedIn) {
    return res.status(401).json({ success: false, message: "You must be logged in to gift a blook." });
  }

  if (req.session.username === recipient) {
    return res.status(400).json({ success: false, message: "You cannot gift blooks to yourself." }); 
  }

  try {
    const senderUser = await users.findOne({ username: req.session.username });
    const recipientUser = await users.findOne({ username: recipient });

    if (!recipientUser) {
      return res.status(404).json({ success: false, message: "This user does not exist." });
    }

    const blook = senderUser.packs.flatMap(pack => pack.blooks).find(b => b.name === name);

    if (!blook || blook.owned < 1) {
      return res.status(400).json({ success: false, message: "You don't own this blook." });
    }

    blook.owned -= 1;

    await users.updateOne({ username: req.session.username }, { $set: { packs: senderUser.packs } });

    const notificationMessage = `${req.session.username} has gifted you ${name} on ${new Date().toLocaleDateString()}`;
    recipientUser.notifications.push({ message: notificationMessage, date: new Date() });
    await users.updateOne({ username: recipient }, { $set: { notifications: recipientUser.notifications } });

    res.json({ success: true, message: `Successfully gifted ${name} to ${recipient}.` });
  } catch (error) {
    console.error("Error gifting blook:", error);
    res.status(500).json({ success: false, message: "An error occurred while gifting the blook." });
  }
});

app.use(bodyParser.json());

app.post('/sendNotification', async (req, res) => {
    if (!req.session || !req.session.loggedIn) {
      return res.status(401).json({ success: false, message: "You must be logged in to send notifications." });
    }
  
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ success: false, message: "Notification message is required." });
    }
    try {
        const allUsers = await users.find().toArray();
        for (const user of allUsers) {
            user.notifications.push({ message, date: new Date() });
            await users.updateOne({ username: user.username }, { $set: { notifications: user.notifications } });
        }
        return res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/getNotifications", async (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    return res.status(401).json({ success: false, message: "You must be logged in to view notifications." });
  }

  const user = await users.findOne({ username: req.session.username });
  res.json({ success: true, notifications: user.notifications || [] });
});

router.post('/storeCheckout', async (req, res) => {
  if (!req.session || !req.session.username) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }
  const username = req.session.username;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: 'Pixelit Plus' },
          unit_amount: 399,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/login.html`,
      cancel_url: `${process.env.BASE_URL}/index.html`,
      metadata: { username }
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Stripe error' });
  }
});

router.post('/storeWebhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const username = session.metadata.username;
    const user = await users.findOne({ username });
    if (user) {
      const plusBadge = await badges.findOne({ name: "Plus" });
      await users.updateOne(
        { username },
        {
          $addToSet: { badges: plusBadge._id },
          $set: { role: "Plus" }
        }
      );
    }
  }
  res.json({ received: true });
});

router.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'site', '404.html'));
});

module.exports = router;