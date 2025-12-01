const dbPool = require("../db/pool");

async function fetchAttendanceByScheduleId(scheduleId, userRole, userId) {
  const query = `
    (
      -- 1. Program -> Group -> Athlete
      SELECT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja, ta.status, ta.napomena
      FROM training_schedules ts
      JOIN trainings t ON ts.training_id = t.id
      JOIN programs p ON t.program_id = p.id
      JOIN program_group_assignments pga ON p.id = pga.program_id
      JOIN group_memberships gm ON pga.group_id = gm.group_id
      JOIN athletes a ON gm.athlete_id = a.id
      LEFT JOIN training_attendance ta ON a.id = ta.athlete_id AND ta.training_schedule_id = ts.id
      WHERE ts.id = ?
        AND (? = 'admin' OR pga.group_id IN (
          SELECT group_id FROM coach_group_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        ))
    )
    UNION
    (
      -- 2. Program -> Athlete
      SELECT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja, ta.status, ta.napomena
      FROM training_schedules ts
      JOIN trainings t ON ts.training_id = t.id
      JOIN programs p ON t.program_id = p.id
      JOIN program_athlete_assignments paa ON p.id = paa.program_id
      JOIN athletes a ON paa.athlete_id = a.id
      LEFT JOIN training_attendance ta ON a.id = ta.athlete_id AND ta.training_schedule_id = ts.id
      WHERE ts.id = ?
        AND (? = 'admin' OR paa.athlete_id IN (
          SELECT athlete_id FROM coach_athlete_assignments
          WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
        ))
    )
    UNION
    (
      -- 3. Plan -> Group -> Athlete
      SELECT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja, ta.status, ta.napomena
      FROM training_schedules ts
      JOIN training_plans tp ON ts.training_plan_id = tp.id
      JOIN training_plan_group_assignments tpga ON tp.id = tpga.training_plan_id
      JOIN group_memberships gm ON tpga.group_id = gm.group_id
      JOIN athletes a ON gm.athlete_id = a.id
      LEFT JOIN training_attendance ta ON a.id = ta.athlete_id AND ta.training_schedule_id = ts.id
      WHERE ts.id = ?
        AND (? = 'admin' 
             OR tpga.group_id IN (
               SELECT group_id FROM coach_group_assignments
               WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
             )
             OR tp.created_by = ?
        )
    )
    UNION
    (
      -- 4. Plan -> Athlete
      SELECT a.id AS athlete_id, a.ime, a.prezime, a.datum_rodenja, ta.status, ta.napomena
      FROM training_schedules ts
      JOIN training_plans tp ON ts.training_plan_id = tp.id
      JOIN training_plan_athlete_assignments tpaa ON tp.id = tpaa.training_plan_id
      JOIN athletes a ON tpaa.athlete_id = a.id
      LEFT JOIN training_attendance ta ON a.id = ta.athlete_id AND ta.training_schedule_id = ts.id
      WHERE ts.id = ?
        AND (? = 'admin' 
             OR tpaa.athlete_id IN (
               SELECT athlete_id FROM coach_athlete_assignments
               WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?)
             )
             OR tp.created_by = ?
        )
    )
  `;
  const params = [
    scheduleId, userRole, userId, 
    scheduleId, userRole, userId,
    scheduleId, userRole, userId, userId,
    scheduleId, userRole, userId, userId
  ];
  const [rows] = await dbPool.query(query, params);
  return rows;
}

async function upsertScheduleAttendanceRecords(scheduleId, records) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    for (const record of records) {
      const { athlete_id, status, napomena } = record;

      const [existing] = await connection.query(
        "SELECT id FROM training_attendance WHERE training_schedule_id = ? AND athlete_id = ?",
        [scheduleId, athlete_id]
      );

      if (existing.length > 0) {
        await connection.query(
          "UPDATE training_attendance SET status = ?, napomena = ? WHERE id = ?",
          [status, napomena, existing[0].id]
        );
      } else {
        await connection.query(
          "INSERT INTO training_attendance (training_schedule_id, athlete_id, status, napomena) VALUES (?, ?, ?, ?)",
          [scheduleId, athlete_id, status, napomena]
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
  fetchAttendanceByScheduleId,
  upsertScheduleAttendanceRecords
};