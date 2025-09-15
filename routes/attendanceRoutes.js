const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const {
  getTrainingAttendance,
  saveTrainingAttendance
} = require("../controllers/attendanceController");

router.get("/trainings/:id/attendance", authenticateToken, getTrainingAttendance);
router.post("/trainings/:id/attendance", authenticateToken, saveTrainingAttendance);

module.exports = router;