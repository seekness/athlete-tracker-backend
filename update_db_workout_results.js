const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function updateDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database.");

    // Create result_workout table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS result_workout (
        id INT AUTO_INCREMENT PRIMARY KEY,
        training_schedule_id INT NULL,
        training_id INT NULL,
        started_at DATETIME NULL,
        finished_at DATETIME NULL,
        rest_time INT DEFAULT 0 COMMENT 'Total rest time in seconds',
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (training_schedule_id) REFERENCES training_schedules(id) ON DELETE SET NULL,
        FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
    `);
    console.log("Table 'result_workout' created or already exists.");

    // Create result_workout_exercise table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS result_workout_exercise (
        id INT AUTO_INCREMENT PRIMARY KEY,
        result_workout_id INT NOT NULL,
        training_exercise_id INT NOT NULL,
        set_number INT NOT NULL,
        working_time INT DEFAULT 0 COMMENT 'Time taken for the set in seconds',
        vreme VARCHAR(50) NULL,
        tezina DECIMAL(10,2) NULL,
        ponavljanje INT NULL,
        duzina DECIMAL(10,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (result_workout_id) REFERENCES result_workout(id) ON DELETE CASCADE,
        FOREIGN KEY (training_exercise_id) REFERENCES training_exercises(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
    `);
    console.log("Table 'result_workout_exercise' created or already exists.");

  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    if (connection) await connection.end();
  }
}

updateDatabase();
