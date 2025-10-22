const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  getAvailableTrainings,
  getTrainingDetails,
  updateTraining,
  deleteTraining,
  createTraining
} = require("../controllers/trainingController");

router.get("/", authenticateToken, getAvailableTrainings);
router.get("/:trainingId", authenticateToken, getTrainingDetails);
router.post("/", authenticateToken, isTrener, createTraining);
router.put("/:trainingId", authenticateToken, isTrener, updateTraining);
router.delete("/:trainingId", authenticateToken, isTrener, deleteTraining);

module.exports = router;