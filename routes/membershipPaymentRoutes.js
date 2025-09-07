const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  getEligibleAthletes,
  getMonthlyPayments,
  createPayment,
  deletePayment
} = require("../controllers/membershipPaymentController");

router.get("/athletes", authenticateToken, getEligibleAthletes);
router.get("/monthly", authenticateToken, getMonthlyPayments);
router.post("/", authenticateToken, createPayment);
router.delete("/:id", authenticateToken, deletePayment);

module.exports = router;