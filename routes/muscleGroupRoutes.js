const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMuscleGroupIcon");
const {
	getAllMuscleGroups,
	getMuscleGroup,
	createMuscleGroup,
	updateMuscleGroup,
	deleteMuscleGroup
} = require("../controllers/muscleGroupController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getAllMuscleGroups);
router.get("/:id", authenticateToken, getMuscleGroup);
router.post("/", authenticateToken, upload.single("ikona"), createMuscleGroup);
router.put("/:id", authenticateToken, upload.single("ikona"), updateMuscleGroup);
router.delete("/:id", authenticateToken, deleteMuscleGroup);

module.exports = router;