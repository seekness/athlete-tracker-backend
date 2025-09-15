const dbPool = require("../db/pool");

//
// GROUP ASSIGNMENTS
//

async function insertProgramGroupAssignment(programId, groupId, userId) {
  await dbPool.query(
    "INSERT INTO program_group_assignments (program_id, group_id, assigned_by_user_id) VALUES (?, ?, ?)",
    [programId, groupId, userId]
  );
}

async function upsertProgramGroupAssignment(programId, groupId, userId) {
  const [existing] = await dbPool.query(
    "SELECT id FROM program_group_assignments WHERE group_id = ?",
    [groupId]
  );

  if (existing.length > 0) {
    await dbPool.query(
      "UPDATE program_group_assignments SET program_id = ?, assigned_by_user_id = ? WHERE group_id = ?",
      [programId, userId, groupId]
    );
  } else {
    await insertProgramGroupAssignment(programId, groupId, userId);
  }
}

async function removeProgramGroupAssignment(id, userId, role) {
  const [rows] = await dbPool.query(
    "SELECT assigned_by_user_id FROM program_group_assignments WHERE id = ?",
    [id]
  );

  if (rows.length === 0) return false;

  const assignedBy = rows[0].assigned_by_user_id;
  if (role !== "admin" && assignedBy !== userId) return false;

  await dbPool.query("DELETE FROM program_group_assignments WHERE id = ?", [id]);
  return true;
}

async function fetchAssignedProgramsForGroups(role, userId) {
  let query = 'SELECT pg.id AS assignment_id, p.naziv AS program_naziv, g.naziv AS group_naziv FROM program_group_assignments pg JOIN programs p ON pg.program_id = p.id JOIN `groups` g ON pg.group_id = g.id';
  const params = [];

  if (role !== "admin") {
    query += `
      JOIN coach_group_assignments cg ON g.id = cg.group_id
      JOIN trainers tr ON tr.id = cg.coach_id
      WHERE tr.user_id = ?
    `;
    params.push(userId);
  }

  const [rows] = await dbPool.query(query, params);
  return rows;
}

//
// ATHLETE ASSIGNMENTS
//

async function insertProgramAthleteAssignment(programId, athleteId, userId) {
  await dbPool.query(
    "INSERT INTO program_athlete_assignments (program_id, athlete_id, assigned_by_user_id) VALUES (?, ?, ?)",
    [programId, athleteId, userId]
  );
}

async function upsertProgramAthleteAssignment(programId, athleteId, userId) {
  const [existing] = await dbPool.query(
    "SELECT id FROM program_athlete_assignments WHERE athlete_id = ?",
    [athleteId]
  );

  if (existing.length > 0) {
    await dbPool.query(
      "UPDATE program_athlete_assignments SET program_id = ?, assigned_by_user_id = ? WHERE athlete_id = ?",
      [programId, userId, athleteId]
    );
  } else {
    await insertProgramAthleteAssignment(programId, athleteId, userId);
  }
}

async function removeProgramAthleteAssignment(id, userId, role) {
  const [rows] = await dbPool.query(
    "SELECT assigned_by_user_id FROM program_athlete_assignments WHERE id = ?",
    [id]
  );

  if (rows.length === 0) return false;

  const assignedBy = rows[0].assigned_by_user_id;
  if (role !== "admin" && assignedBy !== userId) return false;

  await dbPool.query("DELETE FROM program_athlete_assignments WHERE id = ?", [id]);
  return true;
}

async function fetchAssignedProgramsForAthletes(role, userId) {
  let query = `
    SELECT pa.id AS assignment_id, p.naziv AS program_naziv, a.ime, a.prezime
    FROM program_athlete_assignments pa
    JOIN programs p ON pa.program_id = p.id
    JOIN athletes a ON pa.athlete_id = a.id
  `;
  const params = [];

  if (role !== "admin") {
    query += `
      JOIN coach_athlete_assignments ca ON a.id = ca.athlete_id
      JOIN trainers tr ON tr.id = ca.coach_id
      WHERE tr.user_id = ?
    `;
    params.push(userId);
  }

  const [rows] = await dbPool.query(query, params);
  return rows;
}

module.exports = {
  insertProgramGroupAssignment,
  insertProgramAthleteAssignment,
  upsertProgramGroupAssignment,
  upsertProgramAthleteAssignment,
  removeProgramGroupAssignment,
  removeProgramAthleteAssignment,
  fetchAssignedProgramsForGroups,
  fetchAssignedProgramsForAthletes
};