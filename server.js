const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Experience = require("./Experience"); // Ensure this file exists in the same folder

// 1. Configuration
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// 2. Database Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },
});
const User = mongoose.model("User", userSchema);

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  type: String, // Internship or Full-time
  link: String,
  deadline: String,
  createdAt: { type: Date, default: Date.now },
});
const Job = mongoose.model("Job", JobSchema);

// 3. Database Connection
const mongoURI =
  "mongodb+srv://jeevanareddy004_db_user:ataj8d62YOP86OuR@cluster0.uj6iyba.mongodb.net/?appName=Cluster0";

mongoose
  .connect(process.env.MONGO_URI || mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- ROUTES ---

// Health Check
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// AUTH ROUTES
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: "Invalid Password" });

    res.send({
      message: "Success",
      userEmail: user.email,
      role: user.role || "student",
    });
  } catch (err) {
    res.status(500).send({ message: "Server error" });
  }
});

// JOB NOTIFICATION ROUTES
app.get("/get-jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add-job", async (req, res) => {
  const { title, company, type, link, deadline, role } = req.body;
  // Security check for Admin
  if (role !== "admin") {
    return res.status(403).send({ message: "Access Denied: Admins only" });
  }
  try {
    const newJob = new Job({ title, company, type, link, deadline });
    await newJob.save();
    res.status(201).send({ message: "Job posted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Job (Admin Only)
app.delete("/delete-job/:id", async (req, res) => {
  const { role } = req.body; // In a real app, send this in headers
  if (role !== "admin") return res.status(403).send("Unauthorized");

  await Job.findByIdAndDelete(req.params.id);
  res.send({ message: "Job deleted" });
});

// EXPERIENCE VAULT ROUTES
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

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
