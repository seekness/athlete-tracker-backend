const express = require("express");
const router = express.Router();
const {
  getAllExerciseCategories,
  createExerciseCategory,
  updateExerciseCategory,
  deleteExerciseCategory
} = require("../controllers/exerciseCategoryController");
const { authenticateToken } = require("../middleware/authenticateToken");
const uploadCategoryIcon = require("../middleware/uploadExerciseCategoryIcon");

router.get("/", authenticateToken, getAllExerciseCategories);
router.post("/", authenticateToken, uploadCategoryIcon.single("ikonica"), createExerciseCategory);
router.put("/:id", authenticateToken, uploadCategoryIcon.single("ikonica"), updateExerciseCategory);
router.delete("/:id", authenticateToken, deleteExerciseCategory);

module.exports = router;