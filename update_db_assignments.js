const dbPool = require("./db/pool");

async function runMigration() {
  const connection = await dbPool.getConnection();
  try {
    console.log("Creating training_plan_athlete_assignments table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS training_plan_athlete_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        training_plan_id INT NOT NULL,
        athlete_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (training_plan_id) REFERENCES training_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_plan_athlete (training_plan_id, athlete_id)
      )
    `);

    console.log("Creating training_plan_group_assignments table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS training_plan_group_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        training_plan_id INT NOT NULL,
        group_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (training_plan_id) REFERENCES training_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        UNIQUE KEY unique_plan_group (training_plan_id, group_id)
      )
    `);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

runMigration();
