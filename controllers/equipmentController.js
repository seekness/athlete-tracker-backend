const equipmentModel = require("../models/equipmentModel");
const path = require("path");
const fs = require("fs");

async function getAllEquipment(req, res) {
  try {
    const equipment = await equipmentModel.getAllEquipment();
    res.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getEquipmentById(req, res) {
  const { id } = req.params;
  try {
    const equipment = await equipmentModel.getEquipmentById(id);
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createEquipment(req, res) {
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).json({ error: "Naziv is required" });
  }
  try {
    const id = await equipmentModel.createEquipment({ naziv, opis, slika: "" });
    
    let imagePath = "";
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newName = `${id}${ext}`;
      const newPath = path.join(req.file.destination, newName);
      fs.renameSync(req.file.path, newPath);
      imagePath = `/uploads/equipment/${newName}`;
      await equipmentModel.updateEquipmentImagePath(id, imagePath);
    }

    res.status(201).json({ id, naziv, opis, slika: imagePath });
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateEquipment(req, res) {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).json({ error: "Naziv is required" });
  }
  try {
    let imagePath = "";
    
    // Check if we have a new file
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newName = `${id}${ext}`;
      const newPath = path.join(req.file.destination, newName);
      
      // Delete old image if exists
      const existing = await equipmentModel.getEquipmentById(id);
      if (existing?.slika) {
        const oldPath = path.join(__dirname, "..", existing.slika);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      
      fs.renameSync(req.file.path, newPath);
      imagePath = `/uploads/equipment/${newName}`;
    } else {
      // Keep existing image
      const existing = await equipmentModel.getEquipmentById(id);
      imagePath = existing?.slika || "";
    }

    await equipmentModel.updateEquipment(id, { naziv, opis, slika: imagePath });
    res.json({ message: "Equipment updated successfully", slika: imagePath });
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteEquipment(req, res) {
  const { id } = req.params;
  try {
    const { success, imagePath } = await equipmentModel.deleteEquipment(id);
    if (!success) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    
    // Delete image file
    if (imagePath) {
      const fullPath = path.join(__dirname, "..", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    res.json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
