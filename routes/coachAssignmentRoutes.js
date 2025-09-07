const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const {
  getAssignedAthletesByCoachId,
  getAssignedGroupsByCoachId,
  getAssignedAthletesByUserId,
  getAssignedGroupsByUserId,
  getCoachAssignmentsSummary,
  assignAthleteToCoach,
  assignGroupToCoach,
  assignMultipleToCoachAdmin,
  unassignAthleteFromCoach,
  unassignGroupFromCoach
} = require("../controllers/coachAssignmentController");

// GET routes
router.get("/:coachId/assigned-athletes", authenticateToken, getAssignedAthletesByCoachId);
router.get("/:coachId/assigned-groups", authenticateToken, getAssignedGroupsByCoachId);
router.get("/:userId/assigned-athletes-iduser", authenticateToken, getAssignedAthletesByUserId);
router.get("/:userId/assigned-groups-iduser", authenticateToken, getAssignedGroupsByUserId);
router.get("/:userId/assignments", authenticateToken, getCoachAssignmentsSummary);

// PUT routes
router.put("/assign-athlete", authenticateToken, assignAthleteToCoach);
router.put("/assign-group", authenticateToken, assignGroupToCoach);

// POST route (admin)
router.post("/assign", authenticateToken, assignMultipleToCoachAdmin);

// DELETE routes
router.delete("/unassign-athlete", authenticateToken, unassignAthleteFromCoach);
router.delete("/unassign-group", authenticateToken, unassignGroupFromCoach);

module.exports = router;