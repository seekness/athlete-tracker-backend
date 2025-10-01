const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getTestResultsBySportista,
  getGroupResultsForTest,
  getExercisesForTest,
} = require("../controllers/testsController");

router.get("/", authenticateToken, isTrener, getAllTests);
router.get("/:id", authenticateToken, isTrener, getTestById);
router.post("/", authenticateToken, isTrener, createTest);
router.put("/:id", authenticateToken, isTrener, updateTest);
router.delete("/:id", authenticateToken, isTrener, deleteTest);
router.get("/:test_id/results", authenticateToken, isTrener, getTestResultsBySportista);
router.get("/:test_id/group_results", authenticateToken, isTrener, getGroupResultsForTest);
router.get("/:test_id/exercises", authenticateToken, isTrener, getExercisesForTest);

module.exports = router;