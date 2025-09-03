const express = require("express");
const router = express.Router();
const {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation
} = require("../controllers/locationController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.get("/", authenticateToken, getAllLocations);
router.post("/", authenticateToken, createLocation);
router.put("/:id", authenticateToken, updateLocation);
router.delete("/:id", authenticateToken, deleteLocation);

module.exports = router;