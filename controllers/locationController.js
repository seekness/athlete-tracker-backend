const {
  findLocationByName,
  insertLocation,
  getLocations,
  updateLocationById,
  deleteLocationById
} = require("../models/locationModel");

async function getAllLocations(req, res) {
  try {
    const locations = await getLocations();
    res.status(200).json(locations);
  } catch (error) {
    console.error("Greška pri dobijanju lokacija:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function createLocation(req, res) {
  const { naziv, adresa, mesto } = req.body;
  try {
    const existing = await findLocationByName(naziv);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Lokacija sa datim nazivom već postoji." });
    }
    await insertLocation({ naziv, adresa, mesto });
    res.status(201).json({ message: "Lokacija uspešno dodata." });
  } catch (error) {
    console.error("Greška pri dodavanju lokacije:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateLocation(req, res) {
  const { id } = req.params;
  const { naziv, adresa, mesto } = req.body;
  if (!naziv || !adresa || !mesto) {
    return res.status(400).json({ error: "Sva polja su obavezna." });
  }
  try {
    await updateLocationById(id, { naziv, adresa, mesto });
    res.json({ message: "Lokacija uspešno ažurirana." });
  } catch (error) {
    console.error("Greška pri ažuriranju lokacije:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteLocation(req, res) {
  const { id } = req.params;
  try {
    await deleteLocationById(id);
    res.json({ message: "Lokacija uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju lokacije:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation
};