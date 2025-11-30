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

router.get("/", authenticateToken, getAllTests);
router.get("/:id", authenticateToken, getTestById);
router.post("/", authenticateToken, isTrener, createTest);
router.put("/:id", authenticateToken, isTrener, updateTest);
router.delete("/:id", authenticateToken, isTrener, deleteTest);
router.get("/:test_id/results", authenticateToken, isTrener, getTestResultsBySportista);
router.get("/:test_id/group_results", authenticateToken, getGroupResultsForTest);
router.get("/:test_id/exercises", authenticateToken, getExercisesForTest);

module.exports = router;