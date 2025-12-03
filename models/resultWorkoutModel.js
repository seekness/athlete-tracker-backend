const dbPool = require("../db/pool");

async function createResultWorkout(data) {
  const {
    training_schedule_id,
    training_id,
    started_at,
    finished_at,
    rest_time,
    user_id
  } = data;

  const [result] = await dbPool.query(
    `INSERT INTO result_workout 
    (training_schedule_id, training_id, started_at, finished_at, rest_time, user_id) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [training_schedule_id, training_id, started_at, finished_at, rest_time, user_id]
  );
  return result.insertId;
}

async function getResultWorkoutById(id) {
  const [rows] = await dbPool.query(
    `SELECT * FROM result_workout WHERE id = ?`,
    [id]
  );
  return rows[0];
}

async function updateResultWorkout(id, data) {
  const {
    training_schedule_id,
    training_id,
    started_at,
    finished_at,
    rest_time,
    user_id
  } = data;

  await dbPool.query(
    `UPDATE result_workout 
     SET training_schedule_id = ?, training_id = ?, started_at = ?, finished_at = ?, rest_time = ?, user_id = ?
     WHERE id = ?`,
    [training_schedule_id, training_id, started_at, finished_at, rest_time, user_id, id]
  );
}

async function deleteResultWorkout(id) {
  await dbPool.query(`DELETE FROM result_workout WHERE id = ?`, [id]);
}

async function getResultWorkoutsByUser(userId) {
  const [rows] = await dbPool.query(
    `SELECT * FROM result_workout WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  createResultWorkout,
  getResultWorkoutById,
  updateResultWorkout,
  deleteResultWorkout,
  getResultWorkoutsByUser
};
