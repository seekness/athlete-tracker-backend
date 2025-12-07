const mysql = require('mysql2/promise');
const dbConfig = require('./db/pool').config; // Assuming pool.js exports config or I can reconstruct it.
// Actually pool.js exports a pool. I can use it directly if I require it, but this is a standalone script.
// Let's try to require pool.

const pool = require('./db/pool');

async function updateSchema() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to database.");

    // 1. Add athlete_id to result_workout
    try {
      await connection.query(`
        ALTER TABLE result_workout
        ADD COLUMN athlete_id INT NULL,
        ADD CONSTRAINT fk_result_workout_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE;
      `);
      console.log("Added athlete_id to result_workout.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("athlete_id already exists.");
      } else {
        console.error("Error adding athlete_id:", e);
      }
    }

    // 2. Add recorded_by_user_id to result_workout
    try {
      await connection.query(`
        ALTER TABLE result_workout
        ADD COLUMN recorded_by_user_id INT NULL,
        ADD CONSTRAINT fk_result_workout_recorder FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
      `);
      console.log("Added recorded_by_user_id to result_workout.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("recorded_by_user_id already exists.");
      } else {
        console.error("Error adding recorded_by_user_id:", e);
      }
    }

    // 3. Make user_id nullable
    try {
      await connection.query(`
        ALTER TABLE result_workout
        MODIFY COLUMN user_id INT NULL;
      `);
      console.log("Made user_id nullable.");
    } catch (e) {
      console.error("Error modifying user_id:", e);
    }

    console.log("Schema update complete.");

  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

updateSchema();
