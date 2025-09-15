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
const groupMembershipRoutes = require("./routes/groupMembershipRoutes");
const exerciseCategoryRoutes = require("./routes/exerciseCategoryRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const muscleGroupRoutes = require("./routes/muscleGroupRoutes");
const athleteRoutes = require("./routes/athleteRoutes");
const membershipFeeRoutes = require("./routes/membershipFeeRoutes"); // za definisanje cena
const membershipPaymentRoutes = require("./routes/membershipPaymentRoutes"); // za uplate
const coachAssignmentRoutes = require("./routes/coachAssignmentRoutes");
const programRoutes = require("./routes/programRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const programAssignmentRoutes = require("./routes/programAssignmentRoutes");

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/merenje', merenjeRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups-membership", groupMembershipRoutes);
app.use("/api/exercise-categories", exerciseCategoryRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/muscle-groups", muscleGroupRoutes);
app.use("/api/athletes", athleteRoutes);
app.use("/api/membership/fees", membershipFeeRoutes);
app.use("/api/membership/payments", membershipPaymentRoutes);
app.use("/api/coaches", coachAssignmentRoutes);
app.use("/api/programs", programRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/assigned-programs", programAssignmentRoutes);

// Služi statičke fajlove - slike vežbi
app.use("/uploads/exercises", express.static(path.join(__dirname, "uploads/exercises")));

const PORT = process.env.PORT || 5000;
console.log("🚀 Backend je aktivan i spreman da prima zahteve");
app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});













