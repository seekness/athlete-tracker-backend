const muscleSubGroupModel = require("../models/muscleSubGroupModel");

async function getAllMuscleSubGroups(req, res) {
  try {
    const subGroups = await muscleSubGroupModel.getAllMuscleSubGroups();
    res.json(subGroups);
  } catch (error) {
    console.error("Error fetching muscle sub-groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getMuscleSubGroupsByGroupId(req, res) {
  const { groupId } = req.params;
  try {
    const subGroups = await muscleSubGroupModel.getMuscleSubGroupsByGroupId(groupId);
    res.json(subGroups);
  } catch (error) {
    console.error("Error fetching muscle sub-groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createMuscleSubGroup(req, res) {
  const { muscle_group_id, naziv, opis } = req.body;
  const slika = req.file ? req.file.filename : null;

  if (!muscle_group_id || !naziv) {
    return res.status(400).json({ error: "Muscle Group ID and Naziv are required" });
  }
  try {
    const id = await muscleSubGroupModel.createMuscleSubGroup({ muscle_group_id, naziv, opis, slika });
    res.status(201).json({ id, muscle_group_id, naziv, opis, slika });
  } catch (error) {
    console.error("Error creating muscle sub-group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateMuscleSubGroup(req, res) {
  const { id } = req.params;
  const { muscle_group_id, naziv, opis } = req.body;
  
  const updateData = { muscle_group_id, naziv, opis };
  if (req.file) {
    updateData.slika = req.file.filename;
  }

  if (!muscle_group_id || !naziv) {
    return res.status(400).json({ error: "Muscle Group ID and Naziv are required" });
  }
  try {
    await muscleSubGroupModel.updateMuscleSubGroup(id, updateData);
    res.json({ message: "Muscle sub-group updated successfully" });
  } catch (error) {
    console.error("Error updating muscle sub-group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteMuscleSubGroup(req, res) {
  const { id } = req.params;
  try {
    const success = await muscleSubGroupModel.deleteMuscleSubGroup(id);
    if (!success) {
      return res.status(404).json({ error: "Muscle sub-group not found" });
    }
    res.json({ message: "Muscle sub-group deleted successfully" });
  } catch (error) {
    console.error("Error deleting muscle sub-group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAllMuscleSubGroups,
  getMuscleSubGroupsByGroupId,
  createMuscleSubGroup,
  updateMuscleSubGroup,
  deleteMuscleSubGroup
};
