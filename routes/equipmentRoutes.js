const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");
const { authenticateToken } = require("../middleware/authenticateToken");
const { checkRole } = require("../middleware/checkRole");
const uploadEquipmentImage = require("../middleware/uploadEquipmentImage");

// Allow all authenticated users to view equipment
router.get("/", authenticateToken, equipmentController.getAllEquipment);
router.get("/:id", authenticateToken, equipmentController.getEquipmentById);

// Only admin and trainer can manage equipment
router.post("/", authenticateToken, checkRole(['admin', 'trener']), uploadEquipmentImage.single('image'), equipmentController.createEquipment);
router.put("/:id", authenticateToken, checkRole(['admin', 'trener']), uploadEquipmentImage.single('image'), equipmentController.updateEquipment);
router.delete("/:id", authenticateToken, checkRole(['admin', 'trener']), equipmentController.deleteEquipment);

module.exports = router;
