const {
  insertProgramGroupAssignment,
  insertProgramAthleteAssignment,
  upsertProgramGroupAssignment,
  upsertProgramAthleteAssignment,
  removeProgramGroupAssignment,
  removeProgramAthleteAssignment,
  fetchAssignedProgramsForGroups,
  fetchAssignedProgramsForAthletes
} = require("../models/programAssignmentModel");

async function assignProgramToGroup(req, res) {
  const { programId, groupId } = req.body;
  const userId = req.user.id;
  try {
    await insertProgramGroupAssignment(programId, groupId, userId);
    res.status(201).json({ message: "Program uspešno dodeljen grupi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dodeljivanju programa grupi." });
  }
}

async function assignProgramToAthlete(req, res) {
  const { programId, athleteId } = req.body;
  const userId = req.user.id;
  try {
    await insertProgramAthleteAssignment(programId, athleteId, userId);
    res.status(201).json({ message: "Program uspešno dodeljen sportisti." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dodeljivanju programa sportisti." });
  }
}

async function updateProgramAssignmentGroup(req, res) {
  const { programId, groupId } = req.body;
  const userId = req.user.id;
  try {
    await upsertProgramGroupAssignment(programId, groupId, userId);
    res.status(200).json({ message: "Dodela programa grupi uspešno ažurirana." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri ažuriranju dodele programa grupi." });
  }
}

async function updateProgramAssignmentAthlete(req, res) {
  const { programId, athleteId } = req.body;
  const userId = req.user.id;
  try {
    await upsertProgramAthleteAssignment(programId, athleteId, userId);
    res.status(200).json({ message: "Dodela programa sportisti uspešno ažurirana." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri ažuriranju dodele programa sportisti." });
  }
}

async function deleteProgramAssignmentGroup(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    const success = await removeProgramGroupAssignment(id, userId, userRole);
    if (!success) {
      return res.status(403).json({ message: "Nemate dozvolu da obrišete ovu dodelu." });
    }
    res.status(200).json({ message: "Dodela uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju dodele programa za grupu:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function deleteProgramAssignmentAthlete(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    const success = await removeProgramAthleteAssignment(id, userId, userRole);
    if (!success) {
      return res.status(403).json({ message: "Nemate dozvolu da obrišete ovu dodelu." });
    }
    res.status(200).json({ message: "Dodela uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju dodele programa za sportistu:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getAssignedProgramsForGroups(req, res) {
  const { role, id } = req.user;
  try {
    const results = await fetchAssignedProgramsForGroups(role, id);
    res.status(200).json(results);
  } catch (error) {
    console.error("Greška pri dobijanju dodeljenih programa za grupe:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getAssignedProgramsForAthletes(req, res) {
  const { role, id } = req.user;
  try {
    const results = await fetchAssignedProgramsForAthletes(role, id);
    res.status(200).json(results);
  } catch (error) {
    console.error("Greška pri dobijanju dodeljenih programa za sportiste:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

module.exports = {
  assignProgramToGroup,
  assignProgramToAthlete,
  updateProgramAssignmentGroup,
  updateProgramAssignmentAthlete,
  deleteProgramAssignmentGroup,
  deleteProgramAssignmentAthlete,
  getAssignedProgramsForGroups,
  getAssignedProgramsForAthletes
};