const dbPool = require("../db/pool");

async function fetchPrograms(role, userId) {
  if (role === "admin") {
    const [rows] = await dbPool.query("SELECT * FROM programs");
    return rows;
  } else {
    const [rows] = await dbPool.query("SELECT * FROM programs WHERE kreirao_id = ?", [userId]);
    return rows;
  }
}

async function insertProgram(naziv, opis, userId) {
  await dbPool.query(
    "INSERT INTO programs (naziv, opis, kreirao_id) VALUES (?, ?, ?)",
    [naziv, opis, userId]
  );
}

async function fetchProgramCreator(programId) {
  const [rows] = await dbPool.query("SELECT kreirao_id FROM programs WHERE id = ?", [programId]);
  return rows[0]?.kreirao_id || null;
}

async function updateProgramById(id, naziv, opis) {
  await dbPool.query("UPDATE programs SET naziv = ?, opis = ? WHERE id = ?", [naziv, opis, id]);
}

async function deleteProgramById(id) {
  await dbPool.query("DELETE FROM programs WHERE id = ?", [id]);
}

async function fetchTrainingsByProgramId(programId) {
  const [trainings] = await dbPool.query(
    `SELECT t.id, t.opis, t.datum, t.vreme, t.predicted_duration_minutes,
            t.location_id, l.naziv AS location_name
     FROM trainings t
     LEFT JOIN locations l ON t.location_id = l.id
     WHERE t.program_id = ?
     ORDER BY t.datum ASC, t.vreme ASC`,
    [programId]
  );

  for (const training of trainings) {
    const [exercises] = await dbPool.query(
      `SELECT te.id, te.broj_serija, te.tezina_kg, te.vreme_sekunde, te.duzina_metri,
              te.broj_ponavljanja, te.rest_duration_seconds, te.rest_after_exercise_seconds,
              te.jacina_izvodjenja, te.vrsta_unosa, te.superset,
              e.id AS exercise_id, e.naziv AS exercise_name
       FROM training_exercises te
       JOIN exercises e ON te.exercise_id = e.id
       WHERE te.training_id = ?
       ORDER BY te.id ASC`,
      [training.id]
    );
    training.exercises = exercises;
  }

  return trainings;
}

async function insertTrainingWithExercises(programId, trainingData) {
  const {
    opis,
    datum,
    vreme,
    predicted_duration_minutes,
    location_id,
    exercises
  } = trainingData;

  const [result] = await dbPool.query(
    "INSERT INTO trainings (program_id, opis, datum, vreme, predicted_duration_minutes, location_id) VALUES (?, ?, ?, ?, ?, ?)",
    [programId, opis, datum, vreme, predicted_duration_minutes, location_id]
  );

  const trainingId = result.insertId;

  if (exercises && exercises.length > 0) {
    const values = exercises.map((ex) => [
      trainingId,
      ex.exercise_id,
      ex.broj_serija,
      ex.tezina_kg,
      ex.vreme_sekunde,
      ex.duzina_metri,
      ex.broj_ponavljanja,
      ex.rest_duration_seconds,
      ex.rest_after_exercise_seconds,
      ex.jacina_izvodjenja,
      ex.vrsta_unosa,
      ex.superset || 0
    ]);

    await dbPool.query(
      `INSERT INTO training_exercises (
        training_id, exercise_id, broj_serija, tezina_kg, vreme_sekunde,
        duzina_metri, broj_ponavljanja, rest_duration_seconds,
        rest_after_exercise_seconds, jacina_izvodjenja, vrsta_unosa, superset
      ) VALUES ?`,
      [values]
    );
  }
}

module.exports = {
  fetchPrograms,
  insertProgram,
  fetchProgramCreator,
  updateProgramById,
  deleteProgramById,
  fetchTrainingsByProgramId,
  insertTrainingWithExercises
};