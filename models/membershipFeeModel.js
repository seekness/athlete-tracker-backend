const dbPool = require("../db/pool");

async function insertFee(data) {
  const [result] = await dbPool.query(
    `INSERT INTO membership_fees (amount_first, amount_second, amount_third, valid_from) VALUES (?, ?, ?, ?)`,
    [data.amount_first, data.amount_second, data.amount_third, data.valid_from]
  );
  return result.insertId;
}

async function fetchAllFees() {
  const [rows] = await dbPool.query(
    `SELECT id, amount_first, amount_second, amount_third, valid_from FROM membership_fees ORDER BY valid_from DESC`
  );
  return rows;
}

async function fetchLatestFee() {
  const [rows] = await dbPool.query(`SELECT * FROM membership_fees ORDER BY valid_from DESC LIMIT 1`);
  return rows[0];
}

async function updateFeeById(id, data) {
  await dbPool.query(
    `UPDATE membership_fees SET amount_first = ?, amount_second = ?, amount_third = ?, valid_from = ? WHERE id = ?`,
    [data.amount_first, data.amount_second, data.amount_third, data.valid_from, id]
  );
}

async function deleteFeeById(id) {
  await dbPool.query(`DELETE FROM membership_fees WHERE id = ?`, [id]);
}

module.exports = {
  insertFee,
  fetchAllFees,
  fetchLatestFee,
  updateFeeById,
  deleteFeeById
};