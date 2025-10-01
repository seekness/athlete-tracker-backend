const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  createTestExercise,
  deleteTestExercise,
} = require("../controllers/testExercisesController");

router.post("/", authenticateToken, isTrener, createTestExercise);
router.delete("/:id", authenticateToken, isTrener, deleteTestExercise);

module.exports = router;