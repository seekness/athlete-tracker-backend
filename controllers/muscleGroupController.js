const path = require("path");
const fs = require("fs");
const {
  fetchMuscleGroups,
  fetchMuscleGroupById,
  insertMuscleGroup,
  updateMuscleGroupById,
  updateMuscleGroupIconPath,
  deleteMuscleGroupById
} = require("../models/muscleGroupModel");

const toFsPath = (webPath = "") => {
  if (!webPath) return null;
  const trimmed = webPath.startsWith("/") ? webPath.slice(1) : webPath;
  return path.join(__dirname, "..", trimmed);
};

async function getAllMuscleGroups(req, res) {
  try {
    const groups = await fetchMuscleGroups();
    res.status(200).json(groups);
  } catch (error) {
    console.error("Greška pri dobijanju mišićnih grupa:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function getMuscleGroup(req, res) {
  const { id } = req.params;

  try {
    const group = await fetchMuscleGroupById(id);
    if (!group) {
      return res.status(404).json({ error: "Mišićna grupa nije pronađena." });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Greška pri dobijanju mišićne grupe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function createMuscleGroup(req, res) {
  const { naziv, opis } = req.body;

  if (!naziv) {
    return res.status(400).json({ error: "Naziv mišićne grupe je obavezan." });
  }

  try {
    const newId = await insertMuscleGroup({ naziv, opis, ikona: "" });
    let iconPath = "";

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newName = `${newId}${ext}`;
      const newPath = path.join(req.file.destination, newName);
      fs.renameSync(req.file.path, newPath);
      iconPath = `/uploads/muscle-groups/${newName}`;
      await updateMuscleGroupIconPath(newId, iconPath);
    }

    res.status(201).json({ id: newId, naziv, opis, ikona: iconPath });
  } catch (error) {
    console.error("Greška pri kreiranju mišićne grupe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateMuscleGroup(req, res) {
  const { id } = req.params;
  const { naziv, opis } = req.body;

  if (!naziv) {
    return res.status(400).json({ error: "Naziv mišićne grupe je obavezan." });
  }

  try {
    const existing = await fetchMuscleGroupById(id);
    if (!existing) {
      return res.status(404).json({ error: "Mišićna grupa nije pronađena." });
    }

    let iconPath = existing.ikona || "";

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newName = `${id}${ext}`;
      const newPath = path.join(req.file.destination, newName);

      const existingPath = toFsPath(existing.ikona);
      if (existingPath && fs.existsSync(existingPath)) {
        fs.unlinkSync(existingPath);
      }

      fs.renameSync(req.file.path, newPath);
      iconPath = `/uploads/muscle-groups/${newName}`;
    }

    await updateMuscleGroupById(id, { naziv, opis, ikona: iconPath });

    res.json({ message: "Mišićna grupa uspešno ažurirana.", ikona: iconPath });
  } catch (error) {
    console.error("Greška pri ažuriranju mišićne grupe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteMuscleGroup(req, res) {
  const { id } = req.params;

  try {
    const existing = await fetchMuscleGroupById(id);
    if (!existing) {
      return res.status(404).json({ error: "Mišićna grupa nije pronađena." });
    }

    const success = await deleteMuscleGroupById(id);
    if (!success) {
      return res.status(500).json({ error: "Brisanje nije uspelo." });
    }

    res.json({ message: "Mišićna grupa uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju mišićne grupe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  getAllMuscleGroups,
  getMuscleGroup,
  createMuscleGroup,
  updateMuscleGroup,
  deleteMuscleGroup
};