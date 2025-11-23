const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan
} = require("../controllers/trainingPlanController");

router.post("/", authenticateToken, isTrener, createPlan);
router.get("/", authenticateToken, getPlans);
router.get("/:id", authenticateToken, getPlan);
router.put("/:id", authenticateToken, isTrener, updatePlan);
router.delete("/:id", authenticateToken, isTrener, deletePlan);

module.exports = router;
