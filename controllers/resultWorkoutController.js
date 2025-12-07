const dbPool = require("../db/pool");
const { createResultWorkout } = require("../models/resultWorkoutModel");
const { createBulkResultWorkoutExercises } = require("../models/resultWorkoutExerciseModel");

async function saveWorkoutResult(req, res) {
  const {
    training_schedule_id,
    training_id,
    started_at,
    finished_at,
    rest_time,
    user_id, // The athlete who did the workout
    exercises // Array of exercise results
  } = req.body;

  const target_user_id = user_id || req.user.id; // Default to self if not provided

  if (!target_user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // 1. Insert into result_workout
    const [workoutResult] = await connection.query(
      `INSERT INTO result_workout 
      (training_schedule_id, training_id, started_at, finished_at, rest_time, user_id) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [training_schedule_id, training_id, started_at, finished_at, rest_time, target_user_id]
    );
    const resultWorkoutId = workoutResult.insertId;

    // 2. Insert exercises if any
    if (exercises && exercises.length > 0) {
      const exerciseValues = exercises.map(ex => [
        resultWorkoutId,
        ex.training_exercise_id,
        ex.set_number,
        ex.working_time || 0,
        ex.vreme || null,
        ex.tezina || null,
        ex.ponavljanje || null,
        ex.duzina || null
      ]);

      await connection.query(
        `INSERT INTO result_workout_exercise 
        (result_workout_id, training_exercise_id, set_number, working_time, vreme, tezina, ponavljanje, duzina) 
        VALUES ?`,
        [exerciseValues]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Workout result saved successfully.", id: resultWorkoutId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error saving workout result:", error);
    res.status(500).json({ error: "Failed to save workout result." });
  } finally {
    if (connection) connection.release();
  }
}

async function getWorkoutResults(req, res) {
    const { userId } = req.params;
    try {
        const [rows] = await dbPool.query(
            `SELECT rw.*, 
                    t.opis as training_description,
                    ts.datum as schedule_date
             FROM result_workout rw
             LEFT JOIN trainings t ON rw.training_id = t.id
             LEFT JOIN training_schedules ts ON rw.training_schedule_id = ts.id
             WHERE rw.user_id = ?
             ORDER BY rw.created_at DESC`,
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching workout results:", error);
        res.status(500).json({ error: "Failed to fetch workout results." });
    }
}

async function getWorkoutResultDetails(req, res) {
    const { id } = req.params;
    try {
        const [workoutRows] = await dbPool.query(
            `SELECT * FROM result_workout WHERE id = ?`,
            [id]
        );
        
        if (workoutRows.length === 0) {
            return res.status(404).json({ error: "Workout result not found." });
        }

        const [exerciseRows] = await dbPool.query(
            `SELECT rwe.*, e.naziv as exercise_name
             FROM result_workout_exercise rwe
             JOIN training_exercises te ON rwe.training_exercise_id = te.id
             JOIN exercises e ON te.exercise_id = e.id
             WHERE rwe.result_workout_id = ?
             ORDER BY rwe.id ASC`,
            [id]
        );

        res.json({
            workout: workoutRows[0],
            exercises: exerciseRows
        });

    } catch (error) {
        console.error("Error fetching workout result details:", error);
        res.status(500).json({ error: "Failed to fetch workout result details." });
    }
}

module.exports = {
  saveWorkoutResult,
  getWorkoutResults,
  getWorkoutResultDetails
};
