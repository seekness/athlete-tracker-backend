const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  createSchedule,
  getSchedules,
  getSchedulesByPlan,
  getMySchedule,
  generateMySchedulePDF,
  updateScheduleDetails,
  deleteScheduleById
} = require("../controllers/trainingScheduleController");

// Routes for managing schedules
// Note: getSchedules is usually by program, so maybe /programs/:programId/schedules
// But here we can have a general route or specific.
// Let's use /api/schedules

router.post("/", authenticateToken, isTrener, createSchedule);
router.get("/my-schedule", authenticateToken, isTrener, getMySchedule);
router.get("/my-schedule/pdf", authenticateToken, isTrener, generateMySchedulePDF);
router.get("/program/:programId", authenticateToken, getSchedules);
router.get("/plan/:planId", authenticateToken, getSchedulesByPlan);
router.put("/:id", authenticateToken, isTrener, updateScheduleDetails);
router.delete("/:id", authenticateToken, isTrener, deleteScheduleById);

module.exports = router;
