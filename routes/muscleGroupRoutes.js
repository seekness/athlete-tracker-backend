const express = require("express");
const router = express.Router();
const { getAllMuscleGroups } = require("../controllers/muscleGroupController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getAllMuscleGroups);

module.exports = router;