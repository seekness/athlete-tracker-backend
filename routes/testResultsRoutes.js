const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");

const { createTestResult, createBulkTestResults, createGroupTestResults } = require("../controllers/testResultsController");

router.post('/', authenticateToken, createTestResult);
router.post('/bulk', authenticateToken, createBulkTestResults);
router.post('/group', authenticateToken, createGroupTestResults);

module.exports = router;