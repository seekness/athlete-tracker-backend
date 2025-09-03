const express = require("express");
const router = express.Router();
const {
  getAllExerciseCategories,
  createExerciseCategory,
  updateExerciseCategory,
  deleteExerciseCategory
} = require("../controllers/exerciseCategoryController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getAllExerciseCategories);
router.post("/", authenticateToken, createExerciseCategory);
router.put("/:id", authenticateToken, updateExerciseCategory);
router.delete("/:id", authenticateToken, deleteExerciseCategory);

module.exports = router;