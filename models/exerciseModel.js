const dbPool = require("../db/pool");
const path = require("path");
const fs = require("fs");

async function fetchExercisesWithDetails() {
  const query = `
    SELECT 
      e.id, e.naziv, e.opis, 
      e.exercise_category_id, ec.naziv AS category_name,
      e.unilateral, e.video_link, e.slika, e.rep_duration_seconds,
      GROUP_CONCAT(DISTINCT eq.naziv SEPARATOR ', ') AS equipment_names,
      GROUP_CONCAT(DISTINCT CASE WHEN emg.activation_type = 'Glavni (primarni)' THEN mg.naziv END SEPARATOR ', ') AS primary_muscle_groups,
      GROUP_CONCAT(DISTINCT CASE WHEN emg.activation_type = 'Pomoćni (sekundarni)' THEN mg.naziv END SEPARATOR ', ') AS secondary_muscle_groups,
      GROUP_CONCAT(DISTINCT CASE WHEN emg.activation_type = 'Stabilizatori' THEN mg.naziv END SEPARATOR ', ') AS stabilizer_muscle_groups,
      GROUP_CONCAT(DISTINCT CASE WHEN emg.activation_type = 'Glavni (primarni)' THEN mg.id END) AS primary_muscle_group_ids,
      GROUP_CONCAT(DISTINCT CASE WHEN emg.activation_type = 'Pomoćni (sekundarni)' THEN mg.id END) AS secondary_muscle_group_ids,
      GROUP_CONCAT(DISTINCT CASE WHEN emg.activation_type = 'Stabilizatori' THEN mg.id END) AS stabilizer_muscle_group_ids
    FROM exercises e
    LEFT JOIN exercise_categories ec ON e.exercise_category_id = ec.id
    LEFT JOIN exercise_equipment ee ON e.id = ee.exercise_id
    LEFT JOIN equipment eq ON ee.equipment_id = eq.id
    LEFT JOIN exercise_muscle_groups emg ON e.id = emg.exercise_id
    LEFT JOIN muscle_groups mg ON emg.muscle_group_id = mg.id
    GROUP BY e.id
    ORDER BY e.naziv ASC
  `;
  const [rows] = await dbPool.query(query);
  return rows;
}

async function fetchExerciseById(id) {
  const [rows] = await dbPool.query("SELECT * FROM exercises WHERE id = ?", [id]);
  const exercise = rows[0];
  if (!exercise) return null;

  // Fetch equipment
  const [equipmentRows] = await dbPool.query(`
    SELECT eq.id, eq.naziv 
    FROM exercise_equipment ee
    JOIN equipment eq ON ee.equipment_id = eq.id
    WHERE ee.exercise_id = ?
  `, [id]);
  exercise.equipment = equipmentRows;

  // Fetch muscle groups
  const [muscleGroupRows] = await dbPool.query(`
    SELECT mg.id, mg.naziv, emg.activation_type, emg.muscle_sub_group_id, msg.naziv as sub_group_name
    FROM exercise_muscle_groups emg
    JOIN muscle_groups mg ON emg.muscle_group_id = mg.id
    LEFT JOIN muscle_sub_groups msg ON emg.muscle_sub_group_id = msg.id
    WHERE emg.exercise_id = ?
  `, [id]);
  
  exercise.muscle_groups = muscleGroupRows;

  return exercise;
}

async function insertExercise(exercise) {
  const {
    naziv,
    opis,
    exercise_category_id,
    unilateral,
    video_link,
    slika,
    rep_duration_seconds,
    equipment_ids, // Array of equipment IDs
    muscle_groups // Array of objects { muscle_group_id, muscle_sub_group_id, activation_type }
  } = exercise;

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      "INSERT INTO exercises (naziv, opis, exercise_category_id, unilateral, video_link, slika, rep_duration_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        naziv,
        opis,
        exercise_category_id,
        unilateral,
        video_link,
        slika,
        rep_duration_seconds
      ]
    );
    const exerciseId = result.insertId;

    // Insert equipment
    if (equipment_ids && equipment_ids.length > 0) {
      const equipmentValues = equipment_ids.map(eqId => [exerciseId, eqId]);
      await connection.query(
        "INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES ?",
        [equipmentValues]
      );
    }

    // Insert muscle groups
    if (muscle_groups && muscle_groups.length > 0) {
      const muscleGroupValues = muscle_groups.map(mg => [
        exerciseId, 
        mg.muscle_group_id, 
        mg.muscle_sub_group_id || null, 
        mg.activation_type
      ]);
      await connection.query(
        "INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, muscle_sub_group_id, activation_type) VALUES ?",
        [muscleGroupValues]
      );
    }

    await connection.commit();
    return exerciseId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateExerciseById(id, exercise) {
  const {
    naziv,
    opis,
    exercise_category_id,
    unilateral,
    video_link,
    slika,
    rep_duration_seconds,
    equipment_ids,
    muscle_groups
  } = exercise;

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      "UPDATE exercises SET naziv = ?, opis = ?, exercise_category_id = ?, unilateral = ?, video_link = ?, slika = ?, rep_duration_seconds = ? WHERE id = ?",
      [
        naziv,
        opis,
        exercise_category_id,
        unilateral,
        video_link,
        slika,
        rep_duration_seconds,
        id
      ]
    );

    // Update equipment: delete all and re-insert
    await connection.query("DELETE FROM exercise_equipment WHERE exercise_id = ?", [id]);
    if (equipment_ids && equipment_ids.length > 0) {
      const equipmentValues = equipment_ids.map(eqId => [id, eqId]);
      await connection.query(
        "INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES ?",
        [equipmentValues]
      );
    }

    // Update muscle groups: delete all and re-insert
    await connection.query("DELETE FROM exercise_muscle_groups WHERE exercise_id = ?", [id]);
    if (muscle_groups && muscle_groups.length > 0) {
      const muscleGroupValues = muscle_groups.map(mg => [
        id, 
        mg.muscle_group_id, 
        mg.muscle_sub_group_id || null, 
        mg.activation_type
      ]);
      await connection.query(
        "INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, muscle_sub_group_id, activation_type) VALUES ?",
        [muscleGroupValues]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateExerciseImagePath(id, imagePath) {
  await dbPool.query("UPDATE exercises SET slika = ? WHERE id = ?", [imagePath, id]);
}

async function deleteExerciseById(id) {
  const [rows] = await dbPool.query("SELECT slika FROM exercises WHERE id = ?", [id]);
  const imagePath = rows[0]?.slika;

  if (imagePath) {
    const fullPath = path.join(__dirname, "..", imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  const [result] = await dbPool.query("DELETE FROM exercises WHERE id = ?", [id]);
  return result.affectedRows > 0;
}


module.exports = {
  fetchExercisesWithDetails,
  fetchExerciseById,
  insertExercise,
  updateExerciseById,
  updateExerciseImagePath,
  deleteExerciseById

};