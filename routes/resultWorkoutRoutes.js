const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  saveWorkoutResult,
  getWorkoutResults,
  getWorkoutResultDetails
} = require("../controllers/resultWorkoutController");

router.post("/", authenticateToken, saveWorkoutResult);
router.get("/user/:userId", authenticateToken, getWorkoutResults);
router.get("/:id", authenticateToken, getWorkoutResultDetails);

module.exports = router;
