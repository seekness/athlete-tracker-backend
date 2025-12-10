const dbPool = require("../db/pool");

async function insertSchedule(trainingId, datum, vreme, locationId, trainingPlanId) {
  const [result] = await dbPool.query(
    "INSERT INTO training_schedules (training_id, datum, vreme, location_id, training_plan_id) VALUES (?, ?, ?, ?, ?)",
    [trainingId, datum, vreme, locationId, trainingPlanId]
  );
  return result.insertId;
}

async function fetchSchedulesByProgramId(programId) {
  const [rows] = await dbPool.query(
    `SELECT ts.id, ts.training_id, ts.datum, ts.vreme, ts.location_id, ts.training_plan_id,
            t.opis AS training_name, l.naziv AS location_name
     FROM training_schedules ts
     JOIN trainings t ON ts.training_id = t.id
     LEFT JOIN locations l ON ts.location_id = l.id
     WHERE t.program_id = ?
     ORDER BY ts.datum ASC, ts.vreme ASC`,
    [programId]
  );
  return rows;
}

async function fetchSchedulesByPlanId(planId) {
  const [rows] = await dbPool.query(
    `SELECT ts.id, ts.training_id, ts.datum, ts.vreme, ts.location_id, ts.training_plan_id,
            t.opis, l.naziv AS location_name
     FROM training_schedules ts
     JOIN trainings t ON ts.training_id = t.id
     LEFT JOIN locations l ON ts.location_id = l.id
     WHERE ts.training_plan_id = ?
     ORDER BY ts.datum ASC, ts.vreme ASC`,
    [planId]
  );
  return rows;
}

async function fetchSchedulesByCreator(creatorId) {
  const [rows] = await dbPool.query(
    `SELECT ts.id, ts.training_id, ts.datum, ts.vreme, ts.location_id, ts.training_plan_id,
            t.opis, l.naziv AS location_name, tp.naziv as plan_name
     FROM training_schedules ts
     JOIN training_plans tp ON ts.training_plan_id = tp.id
     JOIN trainings t ON ts.training_id = t.id
     LEFT JOIN locations l ON ts.location_id = l.id
     WHERE tp.created_by = ?
     ORDER BY ts.datum ASC, ts.vreme ASC`,
    [creatorId]
  );
  return rows;
}

async function updateSchedule(id, datum, vreme, locationId) {
  await dbPool.query(
    "UPDATE training_schedules SET datum = ?, vreme = ?, location_id = ? WHERE id = ?",
    [datum, vreme, locationId, id]
  );
}

async function deleteSchedule(id) {
  await dbPool.query("DELETE FROM training_schedules WHERE id = ?", [id]);
}

module.exports = {
  insertSchedule,
  fetchSchedulesByProgramId,
  fetchSchedulesByPlanId,
  fetchSchedulesByCreator,
  updateSchedule,
  deleteSchedule
};
