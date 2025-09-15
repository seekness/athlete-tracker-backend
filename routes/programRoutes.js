const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramTrainings,
  addTrainingToProgram,
  getWeeklySchedule,
  generateWeeklySchedulePDF
} = require("../controllers/programController");

router.get("/", authenticateToken, getAllPrograms);
router.post("/", authenticateToken, createProgram);
router.put("/:id", authenticateToken, updateProgram);
router.delete("/:id", authenticateToken, isTrener, deleteProgram);

router.get("/:programId/trainings", authenticateToken, isTrener, getProgramTrainings);
router.post("/:programId/trainings", authenticateToken, isTrener, addTrainingToProgram);
router.get("/:programId/weekly-schedule", authenticateToken, isTrener, getWeeklySchedule);
router.get("/:programId/weekly-schedule/pdf", authenticateToken, isTrener, generateWeeklySchedulePDF);

module.exports = router;