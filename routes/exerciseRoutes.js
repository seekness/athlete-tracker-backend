const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadExerciseImage");
const {
  getAllExercises,
  createExerciseWithImage,
  updateExerciseWithImage,
  deleteExercise
} = require("../controllers/exerciseController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getAllExercises);
router.post("/", authenticateToken, upload.single("slika"), createExerciseWithImage);
router.put("/:id", authenticateToken, upload.single("slika"), updateExerciseWithImage);
router.delete("/:id", authenticateToken, deleteExercise);

module.exports = router;
