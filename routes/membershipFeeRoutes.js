const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { checkRole } = require("../middleware/checkRole");
const {
  createFee,
  getAllFees,
  getCurrentFee,
  updateFee,
  deleteFee
} = require("../controllers/membershipFeeController");

router.post("/", authenticateToken, checkRole("admin"), createFee);
router.get("/", authenticateToken, getAllFees);
router.get("/current", authenticateToken, getCurrentFee);
router.put("/:id", authenticateToken, checkRole("admin"), updateFee);
router.delete("/:id", authenticateToken, checkRole("admin"), deleteFee);

module.exports = router;