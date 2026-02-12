const express = require("express");
const mongoose = require("mongoose");
const Experience = require("./Experience");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
app.use(express.json());
app.use(cors());

// REPLACE YOUR_CONNECTION_STRING with the one you copied from MongoDB
const mongoURI =
  "mongodb+srv://jeevanareddy004_db_user:ataj8d62YOP86OuR@cluster0.uj6iyba.mongodb.net/?appName=Cluster0";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = 5000;
// Route to save a new interview experience
app.post("/add-experience", async (req, res) => {
  try {
    const newExp = new Experience(req.body);
    await newExp.save();
    res.status(201).json({ message: "Experience saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get all experiences to show in the app
app.get("/get-experiences", async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
