const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  createAthlete,
  getAllAthletes,
  getAthleteGroups,
  deleteAthlete,
  updateAthlete,
  getAllAthletes2,
  getAllCompetitors

} = require("../controllers/athleteController");

router.post("/", authenticateToken, createAthlete);
router.get("/", authenticateToken, getAllAthletes);
router.get("/:athleteId/groups", authenticateToken, getAthleteGroups);
router.delete("/:id", authenticateToken, deleteAthlete);
router.put("/:athleteId", authenticateToken, updateAthlete);
router.get("/all-athletes", authenticateToken, getAllAthletes2);
router.get("/allathletes", authenticateToken, getAllCompetitors);


module.exports = router;