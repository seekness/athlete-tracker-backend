const express = require('express');
const app = express();
const cors = require('cors');
const path = require("path");
const fs = require('fs');

// Kreiraj uploads direktorijum ako ne postoji
const uploadsDir = path.join(__dirname, 'uploads', 'exercises');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const merenjeRoutes = require('./routes/merenjeRoutes');
const locationRoutes = require("./routes/locationRoutes");
const groupRoutes = require("./routes/groupRoutes");
const exerciseCategoryRoutes = require("./routes/exerciseCategoryRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const muscleGroupRoutes = require("./routes/muscleGroupRoutes");

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', merenjeRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/exercise-categories", exerciseCategoryRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/muscle-groups", muscleGroupRoutes);

// Služi statičke fajlove - slike vežbi
app.use("/uploads/exercises", express.static(path.join(__dirname, "uploads/exercises")));

//const PORT = process.env.PORT || 5001;
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});









