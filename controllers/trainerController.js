const {
  insertTrainer,
  fetchAllTrainers,
  fetchTrainerByUserId,
  updateTrainerByUserId,
  deleteTrainerByUserId
} = require("../models/trainerModel");

async function createTrainer(req, res) {
  const {
    ime,
    prezime,
    datum_rodenja,
    adresa_stanovanja,
    mesto,
    telefon,
    mail,
    broj_licence,
    datum_isticanja,
    korisnik_id
  } = req.body;

  if (!ime || !prezime) {
    return res.status(400).json({ error: "Ime i prezime su obavezni." });
  }

  try {
    await insertTrainer({
      ime,
      prezime,
      datum_rodenja,
      adresa_stanovanja,
      mesto,
      telefon,
      mail,
      broj_licence,
      datum_isticanja,
      korisnik_id
    });
    res.status(201).json({ message: "Trener je uspešno dodat." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Korisničko ime već postoji." });
    }
    console.error("Greška pri dodavanju trenera:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function getAllTrainers(req, res) {
  try {
    const trainers = await fetchAllTrainers();
    res.status(200).json(trainers);
  } catch (error) {
    console.error("Greška pri dobijanju liste trenera:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function getTrainerByUserId(req, res) {
  const { userId } = req.params;
  try {
    const trainer = await fetchTrainerByUserId(userId);
    if (!trainer) {
      return res.status(404).json({ error: "Trener nije pronađen." });
    }
    res.status(200).json(trainer);
  } catch (error) {
    console.error("Greška pri dobijanju podataka o treneru:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateTrainer(req, res) {
  const { userId } = req.params;
  const {
    ime,
    prezime,
    datum_rodenja,
    adresa_stanovanja,
    mesto,
    telefon,
    mail,
    broj_licence,
    datum_isticanja
  } = req.body;

  try {
    const updated = await updateTrainerByUserId(userId, {
      ime,
      prezime,
      datum_rodenja,
      adresa_stanovanja,
      mesto,
      telefon,
      mail,
      broj_licence,
      datum_isticanja
    });

    if (!updated) {
      return res.status(404).json({ error: "Trener nije pronađen za ažuriranje." });
    }

    res.status(200).json({ message: "Podaci o treneru su uspešno ažurirani." });
  } catch (error) {
    console.error("Greška pri ažuriranju trenera:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteTrainer(req, res) {
  const { userId } = req.params;

  if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: "Nemate dozvolu za brisanje ovog profila." });
  }

  try {
    const deleted = await deleteTrainerByUserId(userId);
    if (!deleted) {
      return res.status(404).json({ error: "Trener nije pronađen za brisanje." });
    }
    res.status(200).json({ message: "Trener je uspešno obrisan." });
  } catch (error) {
    console.error("Greška pri brisanju trenera:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  createTrainer,
  getAllTrainers,
  getTrainerByUserId,
  updateTrainer,
  deleteTrainer
};