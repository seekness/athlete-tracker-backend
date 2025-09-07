const dbPool = require("../db/pool");

async function fetchAthletesByGroupId(groupId) {
  const [rows] = await dbPool.query(
    `SELECT a.* FROM athletes a
     JOIN group_memberships gm ON a.id = gm.athlete_id
     WHERE gm.group_id = ?`,
    [groupId]
  );
  return rows;
}

async function updateGroupMembers(groupId, athleteIds) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM group_memberships WHERE group_id = ?", [groupId]);

    if (athleteIds.length > 0) {
      const values = athleteIds.map((id) => [groupId, id]);
      await connection.query(
        "INSERT INTO group_memberships (group_id, athlete_id) VALUES ?",
        [values]
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

async function removeGroup(groupId) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM group_memberships WHERE group_id = ?", [groupId]);
    const [result] = await connection.query("DELETE FROM groups WHERE id = ?", [groupId]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  fetchAthletesByGroupId,
  updateGroupMembers,
  removeGroup
};