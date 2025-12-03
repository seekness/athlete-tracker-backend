const dbPool = require("../db/pool");

async function createResultWorkoutExercise(data) {
  const {
    result_workout_id,
    training_exercise_id,
    set_number,
    working_time,
    vreme,
    tezina,
    ponavljanje,
    duzina
  } = data;

  const [result] = await dbPool.query(
    `INSERT INTO result_workout_exercise 
    (result_workout_id, training_exercise_id, set_number, working_time, vreme, tezina, ponavljanje, duzina) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [result_workout_id, training_exercise_id, set_number, working_time, vreme, tezina, ponavljanje, duzina]
  );
  return result.insertId;
}

async function createBulkResultWorkoutExercises(exercisesData) {
  if (!exercisesData || exercisesData.length === 0) return;

  const values = exercisesData.map(ex => [
    ex.result_workout_id,
    ex.training_exercise_id,
    ex.set_number,
    ex.working_time,
    ex.vreme,
    ex.tezina,
    ex.ponavljanje,
    ex.duzina
  ]);

  const [result] = await dbPool.query(
    `INSERT INTO result_workout_exercise 
    (result_workout_id, training_exercise_id, set_number, working_time, vreme, tezina, ponavljanje, duzina) 
    VALUES ?`,
    [values]
  );
  return result;
}

async function getExercisesByResultWorkoutId(resultWorkoutId) {
  const [rows] = await dbPool.query(
    `SELECT * FROM result_workout_exercise WHERE result_workout_id = ? ORDER BY id ASC`,
    [resultWorkoutId]
  );
  return rows;
}

async function deleteExercisesByResultWorkoutId(resultWorkoutId) {
  await dbPool.query(
    `DELETE FROM result_workout_exercise WHERE result_workout_id = ?`,
    [resultWorkoutId]
  );
}

module.exports = {
  createResultWorkoutExercise,
  createBulkResultWorkoutExercises,
  getExercisesByResultWorkoutId,
  deleteExercisesByResultWorkoutId
};
