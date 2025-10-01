const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const { createTestExercise, deleteTestExercise } = require("../controllers/testExercisesControllerBackup");

router.post('/', authenticateToken, createTestExercise);
router.delete('/:id', authenticateToken, deleteTestExercise);

module.exports = router;