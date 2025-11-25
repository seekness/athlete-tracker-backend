const dbPool = require("./db/pool");

async function migrate() {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Creating 'equipment' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        naziv VARCHAR(255) NOT NULL,
        opis TEXT
      )
    `);

    console.log("Creating 'exercise_equipment' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exercise_equipment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exercise_id INT NOT NULL,
        equipment_id INT NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
      )
    `);

    console.log("Dropping 'exercise_muscle_groups' table if exists to ensure correct schema...");
    await connection.query("DROP TABLE IF EXISTS exercise_muscle_groups");

    console.log("Creating 'exercise_muscle_groups' table...");
    await connection.query(`
      CREATE TABLE exercise_muscle_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exercise_id INT NOT NULL,
        muscle_group_id INT NOT NULL,
        activation_type ENUM('Glavni (primarni)', 'Pomoćni (sekundarni)', 'Stabilizatori') NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE
      )
    `);

    // Migrate existing data before dropping columns?
    // The user said "bolje sad da radimo nego posle", implying we can just change structure.
    // But preserving data is nice.
    // Let's try to migrate muscle_group_id -> Primary, other_muscle_group_id -> Secondary.
    // oprema is a string, maybe we can't easily migrate to equipment table without parsing.
    // I'll skip oprema migration as it's unstructured text to structured table.
    
    console.log("Migrating existing muscle group data...");
    // Check if columns exist before trying to select them
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'exercises' AND TABLE_SCHEMA = DATABASE()
    `);
    const existingCols = cols.map(c => c.COLUMN_NAME);

    if (existingCols.includes('muscle_group_id') || existingCols.includes('other_muscle_group_id')) {
        const [exercises] = await connection.query(`SELECT id, ${existingCols.includes('muscle_group_id') ? 'muscle_group_id,' : ''} ${existingCols.includes('other_muscle_group_id') ? 'other_muscle_group_id' : ''} FROM exercises`);
        
        for (const ex of exercises) {
        if (ex.muscle_group_id) {
            await connection.query(
            "INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, activation_type) VALUES (?, ?, 'Glavni (primarni)')",
            [ex.id, ex.muscle_group_id]
            );
        }
        if (ex.other_muscle_group_id) {
            await connection.query(
            "INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, activation_type) VALUES (?, ?, 'Pomoćni (sekundarni)')",
            [ex.id, ex.other_muscle_group_id]
            );
        }
        }
    }

    console.log("Dropping old columns from 'exercises'...");
    
    // Helper to drop foreign key if exists
    const dropForeignKey = async (tableName, columnName) => {
      const [constraints] = await connection.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [tableName, columnName]);

      for (const constraint of constraints) {
        console.log(`Dropping FK ${constraint.CONSTRAINT_NAME} on ${tableName}.${columnName}`);
        await connection.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
      }
    };

    await dropForeignKey('exercises', 'muscle_group_id');
    await dropForeignKey('exercises', 'other_muscle_group_id');

    // Now drop the columns
    // Check if columns exist before dropping to avoid errors on re-run
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'exercises' AND TABLE_SCHEMA = DATABASE()
    `);
    const columnNames = columns.map(c => c.COLUMN_NAME);

    if (columnNames.includes('muscle_group_id')) {
      await connection.query("ALTER TABLE exercises DROP COLUMN muscle_group_id");
    }
    if (columnNames.includes('other_muscle_group_id')) {
      await connection.query("ALTER TABLE exercises DROP COLUMN other_muscle_group_id");
    }
    if (columnNames.includes('oprema')) {
      await connection.query("ALTER TABLE exercises DROP COLUMN oprema");
    }

    await connection.commit();
    console.log("Migration completed successfully.");
  } catch (error) {
    await connection.rollback();
    console.error("Migration failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

migrate();
