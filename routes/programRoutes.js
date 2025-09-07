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
  addTrainingToProgram
} = require("../controllers/programController");

router.get("/", authenticateToken, getAllPrograms);
router.post("/", authenticateToken, createProgram);
router.put("/:id", authenticateToken, updateProgram);
router.delete("/:id", authenticateToken, isTrener, deleteProgram);

router.get("/:programId/trainings", authenticateToken, isTrener, getProgramTrainings);
router.post("/:programId/trainings", authenticateToken, isTrener, addTrainingToProgram);

module.exports = router;