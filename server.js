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
  role: { type: String, default: "student" },
});
const User = mongoose.model("User", userSchema);

// 1. Define Job Schema
const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  type: String, // e.g., Internship or Full-time
  link: String,
  deadline: String,
});
const Job = mongoose.model("Job", JobSchema);

// 2. Route to GET jobs (for everyone)
app.get("/get-jobs", async (req, res) => {
  const jobs = await Job.find().sort({ _id: -1 });
  res.send(jobs);
});

// 3. Route to POST jobs (Admin only logic check)
app.post("/add-job", async (req, res) => {
  const { title, company, type, link, deadline, role } = req.body;

  if (role !== "admin") {
    return res.status(403).send({ message: "Access Denied: Admins only" });
  }

  const newJob = new Job({ title, company, type, link, deadline });
  await newJob.save();
  res.send({ message: "Job posted successfully!" });
});

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
// server.js

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: "Invalid Password" });

    // UPDATE THIS LINE HERE:
    res.send({
      message: "Success",
      userEmail: user.email,
      role: user.role || "student", // Default to student if role isn't set
    });
  } catch (err) {
    res.status(500).send({ message: "Server error" });
  }
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
