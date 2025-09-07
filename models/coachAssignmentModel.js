const dbPool = require("../db/pool");

async function getAthletesByCoachId(coachId) {
  const [rows] = await dbPool.query(
    `SELECT u.id, u.ime, u.prezime, u.datum_rodenja
     FROM athletes u
     JOIN coach_athlete_assignments caa ON u.id = caa.athlete_id
     WHERE caa.coach_id = ?`,
    [coachId]
  );
  return rows;
}

async function getGroupsByCoachId(coachId) {
  const [rows] = await dbPool.query(
    `SELECT g.id, g.naziv
     FROM groups g
     JOIN coach_group_assignments cga ON g.id = cga.group_id
     WHERE cga.coach_id = ?`,
    [coachId]
  );
  return rows;
}

async function getAthletesByUserId(userId) {
  const [rows] = await dbPool.query(
    `SELECT u.id, u.ime, u.prezime, u.datum_rodenja
     FROM athletes u
     JOIN coach_athlete_assignments caa ON u.id = caa.athlete_id
     JOIN trainers tr ON tr.id = caa.coach_id
     WHERE tr.user_id = ?`,
    [userId]
  );
  return rows;
}

async function getGroupsByUserId(userId) {
  const [rows] = await dbPool.query(
    `SELECT g.id, g.naziv
     FROM groups g
     JOIN coach_group_assignments cga ON g.id = cga.group_id
     JOIN trainers tr ON tr.id = cga.coach_id
     WHERE tr.user_id = ?`,
    [userId]
  );
  return rows;
}

async function assignAthlete(coachId, athleteId) {
  const [existing] = await dbPool.query(
    "SELECT * FROM coach_athlete_assignments WHERE coach_id = ? AND athlete_id = ?",
    [coachId, athleteId]
  );
  if (existing.length > 0) return true;

  await dbPool.query(
    "INSERT INTO coach_athlete_assignments (coach_id, athlete_id) VALUES (?, ?)",
    [coachId, athleteId]
  );
  return false;
}

async function assignGroup(coachId, groupId) {
  const [existing] = await dbPool.query(
    "SELECT * FROM coach_group_assignments WHERE coach_id = ? AND group_id = ?",
    [coachId, groupId]
  );
  if (existing.length > 0) return true;

  await dbPool.query(
    "INSERT INTO coach_group_assignments (coach_id, group_id) VALUES (?, ?)",
    [coachId, groupId]
  );
  return false;
}

async function assignBulk(coachId, athleteIds = [], groupIds = []) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    if (athleteIds.length > 0) {
      await connection.query(
        "DELETE FROM coach_athlete_assignments WHERE coach_id = ? AND athlete_id IN (?)",
        [coachId, athleteIds]
      );
            const athleteAssignments = athleteIds.map((athleteId) => [coachId, athleteId]);
      await connection.query(
        "INSERT INTO coach_athlete_assignments (coach_id, athlete_id) VALUES ?",
        [athleteAssignments]
      );
    }

    if (groupIds.length > 0) {
      await connection.query(
        "DELETE FROM coach_group_assignments WHERE coach_id = ? AND group_id IN (?)",
        [coachId, groupIds]
      );
      const groupAssignments = groupIds.map((groupId) => [coachId, groupId]);
      await connection.query(
        "INSERT INTO coach_group_assignments (coach_id, group_id) VALUES ?",
        [groupAssignments]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function unassignAthlete(coachId, athleteId) {
  const [result] = await dbPool.query(
    "DELETE FROM coach_athlete_assignments WHERE coach_id = ? AND athlete_id = ?",
    [coachId, athleteId]
  );
  return result.affectedRows > 0;
}

async function unassignGroup(coachId, groupId) {
  const [result] = await dbPool.query(
    "DELETE FROM coach_group_assignments WHERE coach_id = ? AND group_id = ?",
    [coachId, groupId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getAthletesByCoachId,
  getGroupsByCoachId,
  getAthletesByUserId,
  getGroupsByUserId,
  assignAthlete,
  assignGroup,
  assignBulk,
  unassignAthlete,
  unassignGroup
};