const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  getTestResultsBySportista,
  getGroupResultsForTest,
  getExercisesForTest
} = require("../controllers/testsController");

router.get("/:test_id/results", authenticateToken, getTestResultsBySportista);
router.get('/:test_id/group_results', authenticateToken, getGroupResultsForTest);
router.get('/:test_id/exercises', authenticateToken, getExercisesForTest);

module.exports = router;