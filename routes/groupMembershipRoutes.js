const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const {
  getGroupAthletes,
  updateGroupAthletes,
  deleteGroup
} = require("../controllers/groupMembershipController");

router.get("/:groupId/athletes", authenticateToken, getGroupAthletes);
router.post("/:groupId/athletes", authenticateToken, updateGroupAthletes);
router.delete("/:groupId", authenticateToken, deleteGroup);

module.exports = router;