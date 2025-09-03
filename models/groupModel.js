const dbPool = require("../db/pool");

async function getGroups() {
  const [rows] = await dbPool.query("SELECT * FROM `groups` ORDER BY naziv ASC");
  return rows;
}

async function insertGroup({ naziv, opis }) {
  const [result] = await dbPool.query(
    "INSERT INTO `groups` (naziv, opis) VALUES (?, ?)",
    [naziv, opis]
  );
  return result.insertId;
}

async function updateGroupById(id, { naziv, opis }) {
  await dbPool.query(
    "UPDATE `groups` SET naziv = ?, opis = ? WHERE id = ?",
    [naziv, opis, id]
  );
}

async function deleteGroupWithMembers(id) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM group_memberships WHERE group_id = ?", [id]);
    await connection.query("DELETE FROM `groups` WHERE id = ?", [id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getGroups,
  insertGroup,
  updateGroupById,
  deleteGroupWithMembers
};