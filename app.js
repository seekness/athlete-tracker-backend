require('dotenv').config(); //Dodato zbog coolify
const express = require('express');
const app = express();
const cors = require('cors');
const path = require("path");
const fs = require('fs');


app.use(express.json());


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
const testsRoutes = require("./routes/testsRoutes");
const testExercisesRoutes = require("./routes/testExercisesRoutes");
const testResultsRoutes = require("./routes/testResultsRoutes");

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'https://app.somborkayak.club',
  'http://app.somborkayak.club',
  '*.sslip.io'
];

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : DEFAULT_ALLOWED_ORIGINS
).map((origin) => origin.trim()).filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // same-origin / mobile clients
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') {
      return true;
    }
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return allowed === origin;
  });
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

const mirrorAllowedOrigin = (req, res, next) => {
  res.header('Vary', 'Origin');
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};

app.use((req, res, next) => {
  console.log("🕵️ Origin:", req.headers.origin);
  next();
});

app.use(mirrorAllowedOrigin);
app.use(cors(corsOptions));

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
app.use("/api/tests", testsRoutes);
app.use("/api/test-exercises", testExercisesRoutes);
app.use("/api/test-results", testResultsRoutes);

// Služi statičke fajlove - slike vežbi
app.use("/uploads/exercises", express.static(path.join(__dirname, "uploads/exercises")));

app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

//const PORT = process.env.PORT || 5000;
const PORT = process.env.APP_PORT || 5050;//Zbog coolify

if (require.main === module) {
  console.log("🚀 Backend je aktivan i spreman da prima zahteve");
  app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
  });
}













