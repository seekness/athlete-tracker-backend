const {
  getGroups,
  insertGroup,
  updateGroupById,
  deleteGroupWithMembers
} = require("../models/groupModel");

async function getAllGroups(req, res) {
  try {
    const groups = await getGroups();
    res.json(groups);
  } catch (error) {
    console.error("Greška pri dobijanju grupa:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function createGroup(req, res) {
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).json({ error: "Naziv grupe je obavezan." });
  }
  try {
    const id = await insertGroup({ naziv, opis });
    res.status(201).json({ id, naziv, opis });
  } catch (error) {
    console.error("Greška pri dodavanju grupe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateGroup(req, res) {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).json({ error: "Naziv grupe je obavezan." });
  }
  try {
    await updateGroupById(id, { naziv, opis });
    res.json({ message: "Grupa uspešno ažurirana." });
  } catch (error) {
    console.error("Greška pri ažuriranju grupe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteGroup(req, res) {
  const { id } = req.params;
  try {
    await deleteGroupWithMembers(id);
    res.json({ message: "Grupa uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju grupe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup
};