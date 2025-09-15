const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const {
  assignProgramToGroup,
  assignProgramToAthlete,
  updateProgramAssignmentGroup,
  updateProgramAssignmentAthlete,
  deleteProgramAssignmentGroup,
  deleteProgramAssignmentAthlete,
  getAssignedProgramsForGroups,
  getAssignedProgramsForAthletes
} = require("../controllers/programAssignmentController");

router.post("/group", authenticateToken, assignProgramToGroup);
router.post("/athlete", authenticateToken, assignProgramToAthlete);

router.put("/group", authenticateToken, updateProgramAssignmentGroup);
router.put("/athlete", authenticateToken, updateProgramAssignmentAthlete);

router.delete("/group/:id", authenticateToken, deleteProgramAssignmentGroup);
router.delete("/athlete/:id", authenticateToken, deleteProgramAssignmentAthlete);

router.get("/groups", authenticateToken, getAssignedProgramsForGroups);
router.get("/athletes", authenticateToken, getAssignedProgramsForAthletes);

module.exports = router;