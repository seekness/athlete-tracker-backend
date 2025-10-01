const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const {
  createTestResult,
  createBulkTestResults,
  createGroupTestResults,
  deleteTestResult,
  updateTestResult
} = require("../controllers/testResultsControllerBackup");

router.post("/", authenticateToken, createTestResult);
router.post("/bulk", authenticateToken, createBulkTestResults);
router.post("/group", authenticateToken, createGroupTestResults);
router.delete("/:id", authenticateToken, deleteTestResult);
router.put("/:id", authenticateToken, updateTestResult);

module.exports = router;
