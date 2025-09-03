const express = require("express");
const router = express.Router();
const {
  createTrainer,
  getAllTrainers,
  getTrainerByUserId,
  updateTrainer,
  deleteTrainer
} = require("../controllers/trainerController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.post("/", authenticateToken, createTrainer);
router.get("/", authenticateToken, getAllTrainers);
router.get("/:userId", authenticateToken, getTrainerByUserId);
router.put("/:userId", authenticateToken, updateTrainer);
router.delete("/:userId", authenticateToken, deleteTrainer);

module.exports = router;