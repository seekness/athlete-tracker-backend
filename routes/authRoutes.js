const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { registerUser, loginUser, getUsers, changePassword } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getUsers);
router.post("/users/change-password", authenticateToken, changePassword);

module.exports = router;