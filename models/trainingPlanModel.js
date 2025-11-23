const dbPool = require("../db/pool");

async function createTrainingPlan(naziv, createdBy) {
  const [result] = await dbPool.query(
    "INSERT INTO training_plans (naziv, created_by) VALUES (?, ?)",
    [naziv, createdBy]
  );
  return result.insertId;
}

async function getAllTrainingPlans() {
  const [rows] = await dbPool.query(
    `SELECT tp.*, u.display_name as creator_name 
     FROM training_plans tp
     LEFT JOIN users u ON tp.created_by = u.id
     ORDER BY tp.created_at DESC`
  );
  return rows;
}

async function getTrainingPlanById(id) {
  const [rows] = await dbPool.query(
    `SELECT tp.*, u.display_name as creator_name 
     FROM training_plans tp
     LEFT JOIN users u ON tp.created_by = u.id
     WHERE tp.id = ?`,
    [id]
  );
  return rows[0];
}

async function updateTrainingPlan(id, naziv) {
  await dbPool.query(
    "UPDATE training_plans SET naziv = ? WHERE id = ?",
    [naziv, id]
  );
}

async function deleteTrainingPlan(id) {
  await dbPool.query("DELETE FROM training_plans WHERE id = ?", [id]);
}

async function addPlanAssignments(planId, groupIds, athleteIds) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    if (groupIds && groupIds.length > 0) {
      const groupValues = groupIds.map(gid => [planId, gid]);
      await connection.query(
        "INSERT IGNORE INTO training_plan_group_assignments (training_plan_id, group_id) VALUES ?",
        [groupValues]
      );
    }

    if (athleteIds && athleteIds.length > 0) {
      const athleteValues = athleteIds.map(aid => [planId, aid]);
      await connection.query(
        "INSERT IGNORE INTO training_plan_athlete_assignments (training_plan_id, athlete_id) VALUES ?",
        [athleteValues]
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

async function getPlanAssignments(planId) {
  const [groups] = await dbPool.query(
    "SELECT group_id FROM training_plan_group_assignments WHERE training_plan_id = ?",
    [planId]
  );
  const [athletes] = await dbPool.query(
    "SELECT athlete_id FROM training_plan_athlete_assignments WHERE training_plan_id = ?",
    [planId]
  );
  return {
    groups: groups.map(g => g.group_id),
    athletes: athletes.map(a => a.athlete_id)
  };
}

async function updatePlanAssignments(planId, groupIds, athleteIds) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Clear existing
    await connection.query("DELETE FROM training_plan_group_assignments WHERE training_plan_id = ?", [planId]);
    await connection.query("DELETE FROM training_plan_athlete_assignments WHERE training_plan_id = ?", [planId]);

    // Insert new
    if (groupIds && groupIds.length > 0) {
      const groupValues = groupIds.map(gid => [planId, gid]);
      await connection.query(
        "INSERT INTO training_plan_group_assignments (training_plan_id, group_id) VALUES ?",
        [groupValues]
      );
    }

    if (athleteIds && athleteIds.length > 0) {
      const athleteValues = athleteIds.map(aid => [planId, aid]);
      await connection.query(
        "INSERT INTO training_plan_athlete_assignments (training_plan_id, athlete_id) VALUES ?",
        [athleteValues]
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

module.exports = {
  createTrainingPlan,
  getAllTrainingPlans,
  getTrainingPlanById,
  updateTrainingPlan,
  deleteTrainingPlan,
  addPlanAssignments,
  getPlanAssignments,
  updatePlanAssignments
};
