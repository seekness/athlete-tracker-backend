const dbPool = require("../db/pool");

async function createIndividual(data) {
  const query = `
    INSERT INTO individuals (
      user_id,
      ime,
      prezime,
      datum_rodjenja,
      pol,
      cilj,
      email
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const payload = [
    data.user_id,
    data.ime,
    data.prezime,
    data.datum_rodjenja ?? null,
    data.pol ?? null,
    data.cilj ?? null,
    data.email ?? null,
  ];

  const [result] = await dbPool.query(query, payload);
  return result.insertId;
}

async function getAllIndividuals() {
  const query = `
    SELECT
      i.id,
      i.user_id,
      i.ime,
      i.prezime,
      i.datum_rodjenja,
      i.pol,
      i.cilj,
      i.email,
      i.created_at
    FROM individuals i
    ORDER BY i.prezime ASC, i.ime ASC
  `;
  const [rows] = await dbPool.query(query);
  return rows;
}

async function getIndividualById(id) {
  const [rows] = await dbPool.query(
    `SELECT id, user_id, ime, prezime, datum_rodjenja, pol, cilj, email, created_at FROM individuals WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

async function getIndividualByUserId(userId) {
  const [rows] = await dbPool.query(
    `SELECT id, user_id, ime, prezime, datum_rodjenja, pol, cilj, email, created_at FROM individuals WHERE user_id = ?`,
    [userId]
  );
  return rows[0] ?? null;
}

async function updateIndividualById(id, data) {
  const query = `
    UPDATE individuals
    SET
      user_id = ?,
      ime = ?,
      prezime = ?,
      datum_rodjenja = ?,
      pol = ?,
      cilj = ?,
      email = ?
    WHERE id = ?
  `;

  const payload = [
    data.user_id,
    data.ime,
    data.prezime,
    data.datum_rodjenja ?? null,
    data.pol ?? null,
    data.cilj ?? null,
    data.email ?? null,
    id,
  ];

  const [result] = await dbPool.query(query, payload);
  return result.affectedRows;
}

async function removeIndividualById(id) {
  const [result] = await dbPool.query(`DELETE FROM individuals WHERE id = ?`, [id]);
  return result.affectedRows;
}

module.exports = {
  createIndividual,
  getAllIndividuals,
  getIndividualById,
  getIndividualByUserId,
  updateIndividualById,
  removeIndividualById,
};
