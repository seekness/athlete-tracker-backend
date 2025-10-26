const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const {
  handleCreate,
  handleGetAll,
  handleGetById,
  handleGetByUserId,
  handleUpdate,
  handleDelete,
} = require("../controllers/individualController");

router.use(authenticateToken);

router.post("/", handleCreate);
router.get("/", handleGetAll);
router.get("/user/:userId", handleGetByUserId);
router.get("/:id", handleGetById);
router.put("/:id", handleUpdate);
router.delete("/:id", handleDelete);

module.exports = router;
