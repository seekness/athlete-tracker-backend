const {
  fetchPrograms,
  insertProgram,
  updateProgramById,
  deleteProgramById,
  fetchTrainingsByProgramId,
  insertTrainingWithExercises,
  fetchProgramCreator
} = require("../models/programModel");

async function getAllPrograms(req, res) {
  const { role, id } = req.user;
  try {
    const programs = await fetchPrograms(role, id);
    res.status(200).json(programs);
  } catch (error) {
    console.error("Greška pri dobijanju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function createProgram(req, res) {
  const { naziv, opis } = req.body;
  const userId = req.user.id;
  try {
    await insertProgram(naziv, opis, userId);
    res.status(201).json({ message: "Program uspešno kreiran." });
  } catch (error) {
    console.error("Greška pri kreiranju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function updateProgram(req, res) {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const creatorId = await fetchProgramCreator(id);
    if (!creatorId) return res.status(404).json({ message: "Program nije pronađen." });

    if (userRole !== "admin" && creatorId !== userId) {
      return res.status(403).json({ message: "Nemate dozvolu za izmenu ovog programa." });
    }

    await updateProgramById(id, naziv, opis);
    res.status(200).json({ message: "Program uspešno ažuriran." });
  } catch (error) {
    console.error("Greška pri ažuriranju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function deleteProgram(req, res) {
  const { id } = req.params;
  try {
    await deleteProgramById(id);
    res.send("Program uspešno obrisan.");
  } catch (error) {
    console.error("Greška pri brisanju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getProgramTrainings(req, res) {
  const { programId } = req.params;
  try {
    const trainings = await fetchTrainingsByProgramId(programId);
    res.json(trainings);
  } catch (error) {
    console.error("Greška pri dobijanju treninga:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function addTrainingToProgram(req, res) {
  const { programId } = req.params;
  const {
    opis,
    datum,
    vreme,
    predicted_duration_minutes,
    location_id,
    exercises
  } = req.body;

  if (!opis || !datum || !vreme) {
    return res.status(400).send("Opis, datum i vreme treninga su obavezni.");
  }

  try {
    await insertTrainingWithExercises(programId, {
      opis,
      datum,
      vreme,
      predicted_duration_minutes,
      location_id,
      exercises
    });
    res.status(201).send("Trening uspešno dodat.");
  } catch (error) {
    console.error("Greška pri dodavanju treninga:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

module.exports = {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramTrainings,
  addTrainingToProgram
};