const express = require("express");
const mongoose = require("mongoose");
const Experience = require("./Experience");
const cors = require("cors");
const dotenv = require("dotenv");

// 1. THIS MUST BE AT THE TOP to read your variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const bcrypt = require("bcryptjs");

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).send({ message: "User Registered" });
  } catch (e) {
    res.status(400).send({ message: "Email already exists" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send({ message: "User not found" }); // Sends 400 error

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send({ message: "Invalid Password" }); // Sends 400 error

  res.send({ message: "Success", userEmail: user.email }); // Sends 200 success
});

// 2. USE THE STRING DIRECTLY if process.env isn't working on your laptop
const mongoURI =
  "mongodb+srv://jeevanareddy004_db_user:ataj8d62YOP86OuR@cluster0.uj6iyba.mongodb.net/?appName=Cluster0";

mongoose
  .connect(process.env.MONGO_URI || mongoURI) // Uses Render variable OR your local string
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Experience Routes
app.post("/add-experience", async (req, res) => {
  try {
    const newExp = new Experience(req.body);
    await newExp.save();
    res.status(201).json({ message: "Experience saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/get-experiences", async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
