const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const { createTestExercise } = require("../controllers/testExercisesController");

router.post('/', authenticateToken, createTestExercise);

module.exports = router;