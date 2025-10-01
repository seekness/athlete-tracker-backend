const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  getTestResultsBySportista,
  getGroupResultsForTest,
  getExercisesForTest,
  updateTest,
  deleteTest,
  createTest,
  getAllTests,
} = require("../controllers/testsControllerBackup");

router.post('/', authenticateToken, isTrener, createTest);
router.get('/', authenticateToken, isTrener, getAllTests);
router.get("/:test_id/results", authenticateToken, isTrener, getTestResultsBySportista);
router.get('/:test_id/group_results', authenticateToken, isTrener, getGroupResultsForTest);
router.get('/:test_id/exercises', authenticateToken, isTrener, getExercisesForTest);
router.put('/:test_id', authenticateToken, isTrener, updateTest);
router.delete('/:test_id', authenticateToken, isTrener, deleteTest);

module.exports = router;