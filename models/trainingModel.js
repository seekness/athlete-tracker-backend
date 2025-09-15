const dbPool = require("../db/pool");

async function fetchTrainingsForUser(role, userId) {
  const query = `
    (
      SELECT DISTINCT t.id, t.opis, t.datum, t.vreme, p.naziv AS program_naziv
      FROM trainings t
      JOIN programs p ON t.program_id = p.id
      JOIN program_group_assignments pga ON p.id = pga.program_id
      WHERE ? = 'admin' OR pga.group_id IN (
        SELECT group_id FROM coach_group_assignments
        WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
      )
    )
    UNION
    (
      SELECT DISTINCT t.id, t.opis, t.datum, t.vreme, p.naziv AS program_naziv
      FROM trainings t
      JOIN programs p ON t.program_id = p.id
      JOIN program_athlete_assignments paa ON p.id = paa.program_id
      WHERE ? = 'admin' OR paa.athlete_id IN (
        SELECT athlete_id FROM coach_athlete_assignments
        WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
      )
    )
    ORDER BY datum DESC
  `;
  const params = [role, userId, role, userId];
  const [rows] = await dbPool.query(query, params);
  return rows;
}

async function insertTrainingWithExercises(data) {
  const {
    program_id,
    opis,
    datum,
    vreme,
    predicted_duration_minutes,
    location_id,
    exercises
  } = data;

  const [result] = await dbPool.query(
    `INSERT INTO trainings (program_id, opis, datum, vreme, predicted_duration_minutes, location_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [program_id, opis, datum, vreme, predicted_duration_minutes, location_id]
  );

  const trainingId = result.insertId;

  if (exercises && exercises.length > 0) {
    const values = exercises.map((ex, i) => [
      trainingId,
      ex.exercise_id,
      ex.broj_serija || null,
      ex.tezina_kg || null,
      ex.vreme_sekunde || null,
      ex.duzina_metri || null,
      ex.broj_ponavljanja || null,
      ex.rest_duration_seconds || null,
      ex.rest_after_exercise_seconds || null,
      ex.jacina_izvodjenja || null,
      ex.vrsta_unosa,
      ex.superset || 0,
      i
    ]);

    await dbPool.query(
      `INSERT INTO training_exercises (
        training_id, exercise_id, broj_serija, tezina_kg, vreme_sekunde,
        duzina_metri, broj_ponavljanja, rest_duration_seconds,
        rest_after_exercise_seconds, jacina_izvodjenja, vrsta_unosa, superset, sort_order
      ) VALUES ?`,
      [values]
    );
  }
}

async function updateTrainingWithExercises(trainingId, data) {
  const {
    opis,
    datum,
    vreme,
    predicted_duration_minutes,
    location_id,
    exercises
  } = data;

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE trainings SET opis = ?, datum = ?, vreme = ?, predicted_duration_minutes = ?, location_id = ? WHERE id = ?`,
      [opis, datum, vreme, predicted_duration_minutes, location_id, trainingId]
    );

    const [existing] = await connection.query(
      "SELECT id FROM training_exercises WHERE training_id = ?",
      [trainingId]
    );
    const existingIds = existing.map((ex) => ex.id);
    const incomingIds = exercises.map((ex) => ex.id).filter(Boolean);
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

    if (toDelete.length > 0) {
      await connection.query("DELETE FROM training_exercises WHERE id IN (?)", [toDelete]);
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const values = [
        ex.exercise_id,
        ex.broj_serija || null,
        ex.tezina_kg || null,
        ex.vreme_sekunde || null,
        ex.duzina_metri || null,
        ex.broj_ponavljanja || null,
        ex.rest_duration_seconds || null,
        ex.rest_after_exercise_seconds || null,
        ex.jacina_izvodjenja || null,
        ex.vrsta_unosa,
        i === 0 ? false : ex.superset || false,
        i
      ];

      if (ex.id) {
        await connection.query(
          `UPDATE training_exercises SET
           exercise_id = ?, broj_serija = ?, tezina_kg = ?, vreme_sekunde = ?, duzina_metri = ?,
           broj_ponavljanja = ?, rest_duration_seconds = ?, rest_after_exercise_seconds = ?,
           jacina_izvodjenja = ?, vrsta_unosa = ?, superset = ?, sort_order = ?
           WHERE id = ?`,
          [...values, ex.id]
        );
      } else {
        await connection.query(
          `INSERT INTO training_exercises (
            training_id, exercise_id, broj_serija, tezina_kg, vreme_sekunde,
            duzina_metri, broj_ponavljanja, rest_duration_seconds,
            rest_after_exercise_seconds, jacina_izvodjenja, vrsta_unosa, superset, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [trainingId, ...values]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {    connection.release();
  }
}

async function deleteTrainingById(trainingId) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Prvo obriši povezane vežbe
    await connection.query("DELETE FROM training_exercises WHERE training_id = ?", [trainingId]);

    // Zatim obriši prisutnost ako postoji
    await connection.query("DELETE FROM training_attendance WHERE training_id = ?", [trainingId]);

    // Na kraju obriši trening
    await connection.query("DELETE FROM trainings WHERE id = ?", [trainingId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  fetchTrainingsForUser,
  insertTrainingWithExercises,
  updateTrainingWithExercises,
  deleteTrainingById
};