const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const path = require("path");
require("dotenv").config();

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
});
const UserModel = mongoose.model("User", UserSchema);

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());

// Session and Passport Setup
app.use(
  session({ secret: "your_secret_key", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    // Add authentication logic
  })
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  // Fetch user by ID
});

// Handle WebSocket connection
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  jwt.verify(token, "your_secret_key", (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.decoded = decoded;
    next();
  });
}).on("connection", (socket) => {
  console.log("New client connected");
  socket.on("newUser", (username) => {
    activeUsers.push(username);
    console.log(activeUsers);
    io.emit("updateUserList", activeUsers);
  });

  // When a user leaves
  socket.on("disconnect", () => {
    // Remove user from activeUsers array and update
    activeUsers = activeUsers.filter((user) => user !== socket.username);
    console.log(activeUsers);
    io.emit("updateUserList", activeUsers);
  });

  // Custom event for handling messages
  socket.on("send_message", (message) => {
    io.emit("receive_message", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new UserModel({ username, hashedPassword });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ message: "Username already exists" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    const validPassword = await bcrypt.compare(password, user.hashedPassword);

    if (validPassword) {
      const token = jwt.sign({ username: user.username }, "your_secret_key");
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(400).json({ message: "User not found" });
  }
});

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  } else {
    res.redirect("/login");
  }
});
app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "auth.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
