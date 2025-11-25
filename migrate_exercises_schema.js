const dbPool = require('./db/pool');

async function migrate() {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Creating new tables...");

    // Create equipment table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id int(11) NOT NULL AUTO_INCREMENT,
        naziv varchar(255) NOT NULL,
        opis text DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY naziv (naziv)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
    `);

    // Create exercise_equipment table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exercise_equipment (
        id int(11) NOT NULL AUTO_INCREMENT,
        exercise_id int(11) NOT NULL,
        equipment_id int(11) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY exercise_equipment_unique (exercise_id, equipment_id),
        CONSTRAINT fk_exercise_equipment_exercise FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
        CONSTRAINT fk_exercise_equipment_equipment FOREIGN KEY (equipment_id) REFERENCES equipment (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
    `);

    // Create exercise_muscle_groups table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exercise_muscle_groups (
        id int(11) NOT NULL AUTO_INCREMENT,
        exercise_id int(11) NOT NULL,
        muscle_group_id int(11) NOT NULL,
        activation_type enum('Glavni (primarni)', 'Pomoćni (sekundarni)', 'Stabilizatori') NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY exercise_muscle_group_unique (exercise_id, muscle_group_id, activation_type),
        CONSTRAINT fk_exercise_muscle_exercise FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
        CONSTRAINT fk_exercise_muscle_group FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
    `);

    console.log("Migrating data...");

    // Fetch existing exercises
    const [exercises] = await connection.query("SELECT * FROM exercises");

    for (const exercise of exercises) {
      // Migrate muscle_group_id -> Glavni (primarni)
      if (exercise.muscle_group_id) {
        await connection.query(`
          INSERT IGNORE INTO exercise_muscle_groups (exercise_id, muscle_group_id, activation_type)
          VALUES (?, ?, 'Glavni (primarni)')
        `, [exercise.id, exercise.muscle_group_id]);
      }

      // Migrate other_muscle_group_id -> Pomoćni (sekundarni)
      if (exercise.other_muscle_group_id) {
        await connection.query(`
          INSERT IGNORE INTO exercise_muscle_groups (exercise_id, muscle_group_id, activation_type)
          VALUES (?, ?, 'Pomoćni (sekundarni)')
        `, [exercise.id, exercise.other_muscle_group_id]);
      }

      // Migrate oprema
      if (exercise.oprema) {
        const items = exercise.oprema.split(',').map(s => s.trim()).filter(s => s.length > 0);
        for (const item of items) {
          // Insert equipment if not exists
          await connection.query(`
            INSERT IGNORE INTO equipment (naziv) VALUES (?)
          `, [item]);

          // Get equipment id
          const [rows] = await connection.query(`SELECT id FROM equipment WHERE naziv = ?`, [item]);
          if (rows.length > 0) {
            const equipmentId = rows[0].id;
            // Link exercise and equipment
            await connection.query(`
              INSERT IGNORE INTO exercise_equipment (exercise_id, equipment_id)
              VALUES (?, ?)
            `, [exercise.id, equipmentId]);
          }
        }
      }
    }

    console.log("Dropping old columns...");

    // Drop foreign keys first
    // We need to know the constraint names. Usually they are auto-generated or named explicitly.
    // In the dump:
    // CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups` (`id`)
    // CONSTRAINT `exercises_ibfk_3` FOREIGN KEY (`other_muscle_group_id`) REFERENCES `muscle_groups` (`id`)
    
    // We should try to drop the foreign keys.
    try {
      await connection.query("ALTER TABLE exercises DROP FOREIGN KEY exercises_ibfk_1");
    } catch (e) { console.log("FK exercises_ibfk_1 might not exist or already dropped"); }
    
    try {
      await connection.query("ALTER TABLE exercises DROP FOREIGN KEY exercises_ibfk_3");
    } catch (e) { console.log("FK exercises_ibfk_3 might not exist or already dropped"); }

    // Drop columns
    try {
        await connection.query("ALTER TABLE exercises DROP COLUMN muscle_group_id");
    } catch (e) { console.log("Column muscle_group_id might not exist"); }

    try {
        await connection.query("ALTER TABLE exercises DROP COLUMN other_muscle_group_id");
    } catch (e) { console.log("Column other_muscle_group_id might not exist"); }

    try {
        await connection.query("ALTER TABLE exercises DROP COLUMN oprema");
    } catch (e) { console.log("Column oprema might not exist"); }

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
