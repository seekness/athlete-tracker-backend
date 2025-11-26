const dbPool = require('./db/pool');

async function insertInvertedRow() {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Ensure Equipment "Šipka" exists
    let sipkaId;
    const [eqRows] = await connection.query("SELECT id FROM equipment WHERE naziv = 'Šipka'");
    if (eqRows.length > 0) {
      sipkaId = eqRows[0].id;
    } else {
      const [res] = await connection.query("INSERT INTO equipment (naziv) VALUES ('Šipka')");
      sipkaId = res.insertId;
      console.log(`Added equipment 'Šipka' with ID: ${sipkaId}`);
    }

    // 2. Insert Exercise "Inverted Row"
    const exercise = {
      naziv: 'Inverted Row',
      opis: 'Vežba za leđa sopstvenom težinom. Izvodi se povlačenjem tela ka šipci dok su stopala na podu.',
      exercise_category_id: 2, // Teretana
      unilateral: 0,
      video_link: 'https://www.youtube.com/watch?v=hXTc1mDnqlQ',
      slika: '/uploads/exercises/inverted_row.jpg' // Placeholder
    };

    const [exRes] = await connection.query(
      "INSERT INTO exercises (naziv, opis, exercise_category_id, unilateral, video_link, slika) VALUES (?, ?, ?, ?, ?, ?)",
      [exercise.naziv, exercise.opis, exercise.exercise_category_id, exercise.unilateral, exercise.video_link, exercise.slika]
    );
    const exerciseId = exRes.insertId;
    console.log(`Added exercise 'Inverted Row' with ID: ${exerciseId}`);

    // 3. Insert Muscle Groups
    // Structure: [muscle_group_id, muscle_sub_group_id, activation_type]
    const muscleGroups = [
      // Primary: Leđa (Lats, Rhomboids)
      { mg: 2, msg: 15, type: 'Glavni (primarni)' }, // Latissimus dorsi
      { mg: 2, msg: 17, type: 'Glavni (primarni)' }, // Rhomboidei
      { mg: 2, msg: 16, type: 'Glavni (primarni)' }, // Trapezius (Middle/Lower)
      
      // Secondary: Biceps, Rear Delt
      { mg: 4, msg: 23, type: 'Pomoćni (sekundarni)' }, // Biceps brachii
      { mg: 3, msg: 21, type: 'Pomoćni (sekundarni)' }, // Deltoid – zadnji
      
      // Stabilizers: Core, Gluteus
      { mg: 11, msg: 40, type: 'Stabilizatori' }, // Rectus abdominis
      { mg: 9, msg: 35, type: 'Stabilizatori' }   // Gluteus maximus
    ];

    for (const mg of muscleGroups) {
      await connection.query(
        "INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, muscle_sub_group_id, activation_type) VALUES (?, ?, ?, ?)",
        [exerciseId, mg.mg, mg.msg, mg.type]
      );
    }
    console.log(`Added ${muscleGroups.length} muscle group associations.`);

    // 4. Insert Equipment
    await connection.query(
      "INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES (?, ?)",
      [exerciseId, sipkaId]
    );
    console.log(`Added equipment association.`);

    await connection.commit();
    console.log("Successfully inserted Inverted Row and all related data.");

  } catch (error) {
    await connection.rollback();
    console.error("Error inserting data:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

insertInvertedRow();
