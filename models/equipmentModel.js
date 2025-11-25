const dbPool = require("../db/pool");

async function getAllEquipment() {
  const [rows] = await dbPool.query("SELECT * FROM equipment ORDER BY naziv ASC");
  return rows;
}

async function getEquipmentById(id) {
  const [rows] = await dbPool.query("SELECT * FROM equipment WHERE id = ?", [id]);
  return rows[0];
}

async function createEquipment(equipment) {
  const { naziv, opis, slika } = equipment;
  const [result] = await dbPool.query(
    "INSERT INTO equipment (naziv, opis, slika) VALUES (?, ?, ?)",
    [naziv, opis, slika]
  );
  return result.insertId;
}

async function updateEquipment(id, equipment) {
  const { naziv, opis, slika } = equipment;
  await dbPool.query(
    "UPDATE equipment SET naziv = ?, opis = ?, slika = ? WHERE id = ?",
    [naziv, opis, slika, id]
  );
}

async function updateEquipmentImagePath(id, imagePath) {
  await dbPool.query("UPDATE equipment SET slika = ? WHERE id = ?", [imagePath, id]);
}

async function deleteEquipment(id) {
  // Get image path to delete file
  const [rows] = await dbPool.query("SELECT slika FROM equipment WHERE id = ?", [id]);
  const imagePath = rows[0]?.slika;
  
  const [result] = await dbPool.query("DELETE FROM equipment WHERE id = ?", [id]);
  
  return { success: result.affectedRows > 0, imagePath };
}

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentImagePath,
  deleteEquipment
};
