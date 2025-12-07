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
  const { muscle_group_id, naziv, opis, slika } = subGroup;
  const [result] = await dbPool.query(
    "INSERT INTO muscle_sub_groups (muscle_group_id, naziv, opis, slika) VALUES (?, ?, ?, ?)",
    [muscle_group_id, naziv, opis, slika || null]
  );
  return result.insertId;
}

async function updateMuscleSubGroup(id, subGroup) {
  const { muscle_group_id, naziv, opis, slika } = subGroup;
  let query = "UPDATE muscle_sub_groups SET muscle_group_id = ?, naziv = ?, opis = ?";
  const params = [muscle_group_id, naziv, opis];

  if (slika !== undefined) {
    query += ", slika = ?";
    params.push(slika);
  }

  query += " WHERE id = ?";
  params.push(id);

  await dbPool.query(query, params);
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
