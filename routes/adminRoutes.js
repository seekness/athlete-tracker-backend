const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { checkRole } = require("../middleware/checkRole");
const { adminWelcome } = require("../controllers/adminController");

router.get("/admin-only", authenticateToken, checkRole("admin"), adminWelcome);

module.exports = router;