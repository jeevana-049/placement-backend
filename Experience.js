const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  studentName: { type: String, required: true },
  role: { type: String, required: true },
  category: {
    type: String,
    enum: ["Aptitude", "Coding", "HR", "Technical"],
    required: true,
  }, // Added this
  questions: { type: String, required: true },
  solutions: { type: String }, // Added for material/solutions
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Experience", ExperienceSchema);
