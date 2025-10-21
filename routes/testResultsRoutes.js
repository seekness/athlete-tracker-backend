const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const { isTrener } = require("../middleware/checkRole");

const {
  getTestResultsByTest,
  createTestResult,
  createBulkTestResults,
  createGroupTestResults,
  updateTestResult,
  deleteTestResult,
} = require("../controllers/testResultsController");

router.get("/by-test/:test_id", authenticateToken, isTrener, getTestResultsByTest);
router.post("/", authenticateToken, isTrener, createTestResult);
router.post("/bulk", authenticateToken, isTrener, createBulkTestResults);
router.post("/group", authenticateToken, isTrener, createGroupTestResults);
router.put("/:id", authenticateToken, isTrener, updateTestResult);
router.delete("/:id", authenticateToken, isTrener, deleteTestResult);

module.exports = router;