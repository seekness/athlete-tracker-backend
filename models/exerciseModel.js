const dbPool = require("../db/pool");
const path = require("path");
const fs = require("fs");

async function fetchExercisesWithDetails() {
  const query = `
    SELECT 
      e.id, e.naziv, e.opis, 
      e.muscle_group_id, mg.naziv AS muscle_group_name,
      e.exercise_category_id, ec.naziv AS category_name,
      e.other_muscle_group_id, smg.naziv AS other_muscle_group_name,
      e.oprema, e.unilateral, e.video_link, e.slika
    FROM exercises e
    LEFT JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    LEFT JOIN exercise_categories ec ON e.exercise_category_id = ec.id
    LEFT JOIN muscle_groups smg ON e.other_muscle_group_id = smg.id
    ORDER BY e.naziv ASC
  `;
  const [rows] = await dbPool.query(query);
  return rows;
}

async function fetchExerciseById(id) {
  const [rows] = await dbPool.query("SELECT * FROM exercises WHERE id = ?", [id]);
  return rows[0];
}

async function insertExercise(exercise) {
  const {
    naziv,
    opis,
    muscle_group_id,
    exercise_category_id,
    other_muscle_group_id,
    oprema,
    unilateral,
    video_link,
    slika
  } = exercise;

  const [result] = await dbPool.query(
    "INSERT INTO exercises (naziv, opis, muscle_group_id, exercise_category_id, other_muscle_group_id, oprema, unilateral, video_link, slika) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      naziv,
      opis,
      muscle_group_id,
      exercise_category_id,
      other_muscle_group_id,
      oprema,
      unilateral,
      video_link,
      slika
    ]
  );

  return result.insertId;
}

async function updateExerciseById(id, exercise) {
  const {
    naziv,
    opis,
    muscle_group_id,
    exercise_category_id,
    other_muscle_group_id,
    oprema,
    unilateral,
    video_link,
    slika
  } = exercise;

  await dbPool.query(
    "UPDATE exercises SET naziv = ?, opis = ?, muscle_group_id = ?, exercise_category_id = ?, other_muscle_group_id = ?, oprema = ?, unilateral = ?, video_link = ?, slika = ? WHERE id = ?",
    [
      naziv,
      opis,
      muscle_group_id,
      exercise_category_id,
      other_muscle_group_id,
      oprema,
      unilateral,
      video_link,
      slika,
      id
    ]
  );
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