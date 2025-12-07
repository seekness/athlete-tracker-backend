const express = require("express");
const router = express.Router();
const muscleSubGroupController = require("../controllers/muscleSubGroupController");
const { authenticateToken } = require("../middleware/authenticateToken");
const { checkRole } = require("../middleware/checkRole");
const upload = require("../middleware/uploadMuscleSubGroupImage");

router.get("/", authenticateToken, muscleSubGroupController.getAllMuscleSubGroups);
router.get("/group/:groupId", authenticateToken, muscleSubGroupController.getMuscleSubGroupsByGroupId);

// Only admin and trainer can manage sub-groups
router.post("/", authenticateToken, checkRole(['admin', 'trener']), upload.single('slika'), muscleSubGroupController.createMuscleSubGroup);
router.put("/:id", authenticateToken, checkRole(['admin', 'trener']), upload.single('slika'), muscleSubGroupController.updateMuscleSubGroup);
router.delete("/:id", authenticateToken, checkRole(['admin', 'trener']), muscleSubGroupController.deleteMuscleSubGroup);

module.exports = router;
