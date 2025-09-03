const express = require("express");
const router = express.Router();
const {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup
} = require("../controllers/groupController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getAllGroups);
router.post("/", authenticateToken, createGroup);
router.put("/:id", authenticateToken, updateGroup);
router.delete("/:id", authenticateToken, deleteGroup);

module.exports = router;