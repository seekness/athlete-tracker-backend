const {
  getGroups,
  insertGroup,
  updateGroupById,
  deleteGroupWithMembers
} = require("../models/groupModel");

const dbPool = require("../db/pool");

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
    const groupId = await insertGroup({ naziv, opis });
    
    // Ako je korisnik trener, automatski dodeli grupu treneru
    if (req.user && req.user.role === 'trener') {
      try {
        // Pronađi trainer_id na osnovu user_id
        const [trainer] = await dbPool.query(
          "SELECT id FROM trainers WHERE user_id = ?",
          [req.user.id]
        );
        
        if (trainer.length > 0) {
          const trainerId = trainer[0].id;
          
          // Dodeli grupu treneru
          await dbPool.query(
            "INSERT INTO coach_group_assignments (coach_id, group_id) VALUES (?, ?)",
            [trainerId, groupId]
          );
        }
      } catch (assignError) {
        console.error("Greška pri automatskom dodeljivanju grupe treneru:", assignError);
        // Ne prekidamo proces ako dodeljivanje ne uspe, grupa je već kreirana
      }
    }
    
    res.status(201).json({ id: groupId, naziv, opis });
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