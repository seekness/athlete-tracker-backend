const dbPool = require("../db/pool");

async function fetchTrainingsForUser(role, userId) {
  let query = "";
  let params = [];

  if (role === "admin") {
    query = `
      SELECT DISTINCT ts.id, t.opis, ts.datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
      FROM training_schedules ts
      JOIN trainings t ON ts.training_id = t.id
      JOIN programs p ON t.program_id = p.id
      LEFT JOIN locations l ON ts.location_id = l.id
      LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
      ORDER BY ts.datum DESC, ts.vreme DESC
    `;
  } else if (role === "trener") {
    query = `
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN program_group_assignments pga ON p.id = pga.program_id
        WHERE pga.group_id IN (
          SELECT group_id FROM coach_group_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        )
      )
      UNION
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN program_athlete_assignments paa ON p.id = paa.program_id
        WHERE paa.athlete_id IN (
          SELECT athlete_id FROM coach_athlete_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        )
      )
      UNION
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN training_plan_group_assignments tpga ON ts.training_plan_id = tpga.training_plan_id
        WHERE tpga.group_id IN (
          SELECT group_id FROM coach_group_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        )
      )
      UNION
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN training_plan_athlete_assignments tpaa ON ts.training_plan_id = tpaa.training_plan_id
        WHERE tpaa.athlete_id IN (
          SELECT athlete_id FROM coach_athlete_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        )
      )
      ORDER BY datum DESC, vreme DESC
    `;
    params = [userId, userId, userId, userId];
  } else if (role === "sportista") {
    query = `
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN program_group_assignments pga ON p.id = pga.program_id
        WHERE pga.group_id IN (
          SELECT group_id FROM group_memberships
          WHERE athlete_id = (SELECT id FROM athletes WHERE user_id = ?)
        )
      )
      UNION
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN program_athlete_assignments paa ON p.id = paa.program_id
        WHERE paa.athlete_id = (SELECT id FROM athletes WHERE user_id = ?)
      )
      UNION
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN training_plan_group_assignments tpga ON ts.training_plan_id = tpga.training_plan_id
        WHERE tpga.group_id IN (
          SELECT group_id FROM group_memberships
          WHERE athlete_id = (SELECT id FROM athletes WHERE user_id = ?)
        )
      )
      UNION
      (
        SELECT DISTINCT ts.id, t.opis, DATE_FORMAT(ts.datum, '%Y-%m-%d') AS datum, ts.vreme, p.naziv AS program_naziv, tp.naziv AS plan_naziv, ts.location_id, l.naziv AS location_name
        FROM training_schedules ts
        JOIN trainings t ON ts.training_id = t.id
        JOIN programs p ON t.program_id = p.id
        LEFT JOIN locations l ON ts.location_id = l.id
        LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
        JOIN training_plan_athlete_assignments tpaa ON ts.training_plan_id = tpaa.training_plan_id
        WHERE tpaa.athlete_id = (SELECT id FROM athletes WHERE user_id = ?)
      )
      ORDER BY datum DESC, vreme DESC
    `;
    params = [userId, userId, userId, userId];
  } else {
    return [];
  }

  const [rows] = await dbPool.query(query, params);
  return rows;
}

async function fetchTrainingDetailsById(scheduleId) {
  // Try to find as a schedule first
  const [scheduleRows] = await dbPool.query(
    `SELECT ts.id, ts.training_id, ts.datum, ts.vreme, ts.location_id,
            t.opis, t.predicted_duration_minutes, p.naziv AS program_naziv, tp.naziv AS plan_naziv,
            l.naziv AS location_name, l.mesto AS location_city
     FROM training_schedules ts
     JOIN trainings t ON ts.training_id = t.id
     JOIN programs p ON t.program_id = p.id
     LEFT JOIN locations l ON ts.location_id = l.id
     LEFT JOIN training_plans tp ON ts.training_plan_id = tp.id
     WHERE ts.id = ?
     LIMIT 1`,
    [scheduleId]
  );

  let training;
  let trainingId;

  if (scheduleRows.length > 0) {
    training = scheduleRows[0];
    trainingId = training.training_id;
  } else {
    // Fallback: maybe it's a raw training ID (template)?
    // This handles cases where we might be viewing a template directly
    const [templateRows] = await dbPool.query(
      `SELECT t.id, t.opis, t.predicted_duration_minutes, p.naziv AS program_naziv
       FROM trainings t
       JOIN programs p ON t.program_id = p.id
       WHERE t.id = ?
       LIMIT 1`,
      [scheduleId]
    );
    
    if (templateRows.length === 0) {
      return null;
    }
    training = templateRows[0];
    trainingId = training.id;
    // No date/time/location for template
  }

  const [exerciseRows] = await dbPool.query(
    `SELECT te.id, te.exercise_id, te.broj_serija, te.tezina_kg, te.vreme_sekunde,
            te.duzina_metri, te.broj_ponavljanja, te.rest_duration_seconds,
            te.rest_after_exercise_seconds, te.jacina_izvodjenja, te.vrsta_unosa,
            te.superset, te.sort_order,
            e.naziv AS exercise_name, e.opis AS exercise_description,
            e.slika AS exercise_image
     FROM training_exercises te
     JOIN exercises e ON te.exercise_id = e.id
     WHERE te.training_id = ?
     ORDER BY te.sort_order ASC, te.id ASC`,
    [trainingId]
  );

  training.exercises = exerciseRows;

  return training;
}

async function insertTrainingWithExercises(data) {
  const {
    program_id,
    opis,
    predicted_duration_minutes,
    exercises
  } = data;

  const [result] = await dbPool.query(
    `INSERT INTO trainings (program_id, opis, predicted_duration_minutes)
     VALUES (?, ?, ?)`,
    [program_id, opis, predicted_duration_minutes]
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
    predicted_duration_minutes,
    exercises
  } = data;

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE trainings SET opis = ?, predicted_duration_minutes = ? WHERE id = ?`,
      [opis, predicted_duration_minutes, trainingId]
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

    // Zatim obriši trening (schedules and attendance will cascade delete)
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
  fetchTrainingDetailsById,
  insertTrainingWithExercises,
  updateTrainingWithExercises,
  deleteTrainingById
};