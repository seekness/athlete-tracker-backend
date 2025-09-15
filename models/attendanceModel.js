const dbPool = require("../db/pool");

async function fetchAttendanceByTrainingId(trainingId, userRole, userId) {
  const query = `
    (
      SELECT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja, ta.status, ta.napomena
      FROM trainings t
      JOIN programs p ON t.program_id = p.id
      JOIN program_group_assignments pga ON p.id = pga.program_id
      JOIN group_memberships gm ON pga.group_id = gm.group_id
      JOIN athletes a ON gm.athlete_id = a.id
      LEFT JOIN training_attendance ta ON a.id = ta.athlete_id AND ta.training_id = t.id
      WHERE t.id = ?
        AND (? = 'admin' OR pga.group_id IN (
          SELECT group_id FROM coach_group_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        ))
    )
    UNION
    (
      SELECT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja, ta.status, ta.napomena
      FROM trainings t
      JOIN programs p ON t.program_id = p.id
      JOIN program_athlete_assignments paa ON p.id = paa.program_id
      JOIN athletes a ON paa.athlete_id = a.id
      LEFT JOIN training_attendance ta ON a.id = ta.athlete_id AND ta.training_id = t.id
      WHERE t.id = ?
        AND (? = 'admin' OR paa.athlete_id IN (
          SELECT athlete_id FROM coach_athlete_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        ))
    )
  `;
  const params = [trainingId, userRole, userId, trainingId, userRole, userId];
  const [rows] = await dbPool.query(query, params);
  return rows;
}

async function upsertAttendanceRecords(trainingId, records) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    for (const record of records) {
      const { athlete_id, status, napomena } = record;

      const [existing] = await connection.query(
        "SELECT id FROM training_attendance WHERE training_id = ? AND athlete_id = ?",
        [trainingId, athlete_id]
      );

      if (existing.length > 0) {
        await connection.query(
          "UPDATE training_attendance SET status = ?, napomena = ? WHERE id = ?",
          [status, napomena, existing[0].id]
        );
      } else {
        await connection.query(
          "INSERT INTO training_attendance (training_id, athlete_id, status, napomena) VALUES (?, ?, ?, ?)",
          [trainingId, athlete_id, status, napomena]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  fetchAttendanceByTrainingId,
  upsertAttendanceRecords
};