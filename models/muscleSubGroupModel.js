const dbPool = require("../db/pool");

async function getAllMuscleSubGroups() {
  const [rows] = await dbPool.query("SELECT * FROM muscle_sub_groups ORDER BY naziv ASC");
  return rows;
}

async function getMuscleSubGroupsByGroupId(groupId) {
  const [rows] = await dbPool.query("SELECT * FROM muscle_sub_groups WHERE muscle_group_id = ? ORDER BY naziv ASC", [groupId]);
  return rows;
}

async function createMuscleSubGroup(subGroup) {
  const { muscle_group_id, naziv, opis } = subGroup;
  const [result] = await dbPool.query(
    "INSERT INTO muscle_sub_groups (muscle_group_id, naziv, opis) VALUES (?, ?, ?)",
    [muscle_group_id, naziv, opis]
  );
  return result.insertId;
}

async function updateMuscleSubGroup(id, subGroup) {
  const { muscle_group_id, naziv, opis } = subGroup;
  await dbPool.query(
    "UPDATE muscle_sub_groups SET muscle_group_id = ?, naziv = ?, opis = ? WHERE id = ?",
    [muscle_group_id, naziv, opis, id]
  );
}

async function deleteMuscleSubGroup(id) {
  const [result] = await dbPool.query("DELETE FROM muscle_sub_groups WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllMuscleSubGroups,
  getMuscleSubGroupsByGroupId,
  createMuscleSubGroup,
  updateMuscleSubGroup,
  deleteMuscleSubGroup
};
