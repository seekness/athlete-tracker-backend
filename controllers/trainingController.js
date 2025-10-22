const {
  fetchTrainingsForUser,
  fetchTrainingDetailsById,
  insertTrainingWithExercises,
  updateTrainingWithExercises,
  deleteTrainingById
} = require("../models/trainingModel");

async function getAvailableTrainings(req, res) {
  const { id: userId, role: userRole } = req.user;
  try {
    const trainings = await fetchTrainingsForUser(userRole, userId);
    res.status(200).json(trainings);
  } catch (error) {
    console.error("Greška pri dobijanju liste treninga:", error);
    res.status(500).json({ message: "Došlo je do greške na serveru." });
  }
}

async function createTraining(req, res) {
  const {
    program_id,
    opis,
    datum,
    vreme,
    predicted_duration_minutes,
    location_id,
    exercises
  } = req.body;

  if (!program_id || !opis || !datum || !vreme) {
    return res.status(400).send("Program, opis, datum i vreme su obavezni.");
  }

  try {
    await insertTrainingWithExercises({
      program_id,
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

async function updateTraining(req, res) {
  const { trainingId } = req.params;
  const trainingData = req.body;

  try {
    await updateTrainingWithExercises(trainingId, trainingData);
    res.send("Trening uspešno ažuriran.");
  } catch (error) {
    console.error("Greška pri ažuriranju treninga:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function deleteTraining(req, res) {
  const { trainingId } = req.params;
  try {
    await deleteTrainingById(trainingId);
    res.send("Trening uspešno obrisan.");
  } catch (error) {
    console.error("Greška pri brisanju treninga:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getTrainingDetails(req, res) {
  const { trainingId } = req.params;

  try {
    const training = await fetchTrainingDetailsById(trainingId);
    if (!training) {
      return res.status(404).json({ message: "Trening nije pronađen." });
    }
    res.status(200).json(training);
  } catch (error) {
    console.error("Greška pri dobijanju detalja treninga:", error);
    res.status(500).json({ message: "Došlo je do greške na serveru." });
  }
}

module.exports = {
  getAvailableTrainings,
  createTraining,
  getTrainingDetails,
  updateTraining,
  deleteTraining
};