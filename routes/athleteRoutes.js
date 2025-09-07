const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  createAthlete,
  getAllAthletes,
  getAthleteGroups,
  deleteAthlete
} = require("../controllers/athleteController");

router.post("/", authenticateToken, createAthlete);
router.get("/", authenticateToken, getAllAthletes);
router.get("/:athleteId/groups", authenticateToken, getAthleteGroups);
router.delete("/:id", authenticateToken, deleteAthlete);

module.exports = router;