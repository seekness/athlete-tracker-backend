const dbPool = require("../db/pool");

async function findLocationByName(naziv) {
  const [rows] = await dbPool.query(
    "SELECT naziv FROM locations WHERE naziv = ?",
    [naziv]
  );
  return rows;
}

async function insertLocation({ naziv, adresa, mesto }) {
  await dbPool.query(
    "INSERT INTO locations (naziv, adresa, mesto) VALUES (?, ?, ?)",
    [naziv, adresa, mesto]
  );
}

async function getLocations() {
  const [rows] = await dbPool.query("SELECT * FROM locations");
  return rows;
}

async function updateLocationById(id, { naziv, adresa, mesto }) {
  await dbPool.query(
    "UPDATE locations SET naziv = ?, adresa = ?, mesto = ? WHERE id = ?",
    [naziv, adresa, mesto, id]
  );
}

async function deleteLocationById(id) {
  await dbPool.query("DELETE FROM locations WHERE id = ?", [id]);
}

module.exports = {
  findLocationByName,
  insertLocation,
  getLocations,
  updateLocationById,
  deleteLocationById
};