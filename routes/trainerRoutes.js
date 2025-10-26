const express = require("express");
const router = express.Router();
const {
  createTrainer,
  getAllTrainers,
  getTrainerByUserId,
  updateTrainer,
  deleteTrainer,
  getTestsByTrener,
  createTrainerAccount,
  updateTrainerAccount
} = require("../controllers/trainerController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.post("/", authenticateToken, createTrainer);
router.get("/", authenticateToken, getAllTrainers);
router.post("/admin", authenticateToken, createTrainerAccount);
router.put("/admin/:userId", authenticateToken, updateTrainerAccount);
router.get("/:userId", authenticateToken, getTrainerByUserId);
router.put("/:userId", authenticateToken, updateTrainer);
router.delete("/:userId", authenticateToken, deleteTrainer);
router.get('/:trener_id/tests', authenticateToken, getTestsByTrener);

module.exports = router;