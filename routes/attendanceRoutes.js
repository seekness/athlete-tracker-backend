const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const {
  getScheduleAttendance,
  saveScheduleAttendance
} = require("../controllers/attendanceController");

router.get("/schedules/:id/attendance", authenticateToken, getScheduleAttendance);
router.post("/schedules/:id/attendance", authenticateToken, saveScheduleAttendance);

module.exports = router;