const { fetchMuscleGroups } = require("../models/muscleGroupModel");

async function getAllMuscleGroups(req, res) {
  try {
    const groups = await fetchMuscleGroups();
    res.status(200).json(groups);
  } catch (error) {
    console.error("Greška pri dobijanju mišićnih grupa:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = { getAllMuscleGroups };