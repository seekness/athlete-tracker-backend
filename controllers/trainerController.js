const bcrypt = require("bcrypt");
const dbPool = require("../db/pool");
const {
  insertTrainer,
  fetchAllTrainers,
  fetchTrainerByUserId,
  updateTrainerByUserId,
  deleteTrainerByUserId
} = require("../models/trainerModel");
const {
  createUser,
  findUserByUsername,
  findUserById,
  updateUserCore,
  updateUserPassword
} = require("../models/authModel");

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

function normalizeOptional(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  return value;
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

async function getTestsByTrener(req, res) {
  const { trener_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT
        t.id AS test_id,
        t.naziv,
        t.datum,
        COUNT(DISTINCT te.id) AS broj_vezbi,
        COUNT(DISTINCT tr.sportista_id) AS broj_sportista
      FROM tests t
      LEFT JOIN test_exercises te ON te.test_id = t.id
      LEFT JOIN test_results tr ON tr.test_id = t.id
      WHERE t.trener_id = ?
      GROUP BY t.id
      ORDER BY t.datum DESC
      `,
      [trener_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri dohvaćanju testova trenera' });
  }
}

async function createTrainerAccount(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Nemate dozvolu za ovu akciju." });
  }

  const {
    username,
    password,
    display_name,
    ime,
    prezime,
    datum_rodenja,
    adresa_stanovanja,
    mesto,
    telefon,
    mail,
    broj_licence,
    datum_isticanja
  } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Korisničko ime i lozinka su obavezni." });
  }

  if (!ime || !prezime) {
    return res.status(400).json({ error: "Ime i prezime su obavezni." });
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const existingUser = await findUserByUsername(username.trim(), connection);
    if (existingUser) {
      await connection.rollback();
      return res.status(409).json({ error: "Korisničko ime već postoji." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayNameValue = display_name && display_name.trim().length > 0
      ? display_name.trim()
      : `${ime} ${prezime}`.trim();

    const newUserId = await createUser(
      {
        username: username.trim(),
        display_name: displayNameValue,
        hashedPassword,
        role: "trener"
      },
      connection
    );

    await insertTrainer(
      {
        ime,
        prezime,
        datum_rodenja: normalizeOptional(datum_rodenja),
        adresa_stanovanja: normalizeOptional(adresa_stanovanja),
        mesto: normalizeOptional(mesto),
        telefon: normalizeOptional(telefon),
        mail: normalizeOptional(mail),
        broj_licence: normalizeOptional(broj_licence),
        datum_isticanja: normalizeOptional(datum_isticanja),
        korisnik_id: newUserId
      },
      connection
    );

    await connection.commit();

    const trainer = await fetchTrainerByUserId(newUserId);
    res.status(201).json({
      message: "Trenerski nalog je uspešno kreiran.",
      trainer
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Greška pri kreiranju trenerskog naloga:", error);
    res.status(500).json({ error: "Greška na serveru." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function updateTrainerAccount(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Nemate dozvolu za ovu akciju." });
  }

  const { userId } = req.params;
  const {
    username,
    password,
    display_name,
    ime,
    prezime,
    datum_rodenja,
    adresa_stanovanja,
    mesto,
    telefon,
    mail,
    broj_licence,
    datum_isticanja
  } = req.body || {};

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const existingUser = await findUserById(userId, connection);
    if (!existingUser) {
      await connection.rollback();
      return res.status(404).json({ error: "Korisnik nije pronađen." });
    }

    if (username && username.trim() !== existingUser.username) {
      const duplicate = await findUserByUsername(username.trim(), connection);
      if (duplicate && duplicate.id !== existingUser.id) {
        await connection.rollback();
        return res.status(409).json({ error: "Korisničko ime već postoji." });
      }
    }

    if (!ime || !prezime) {
      await connection.rollback();
      return res.status(400).json({ error: "Ime i prezime su obavezni." });
    }

    await updateUserCore(
      {
        id: existingUser.id,
        username: username ? username.trim() : existingUser.username,
        display_name: display_name && display_name.trim().length > 0
          ? display_name.trim()
          : existingUser.display_name
      },
      connection
    );

    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await updateUserPassword(existingUser.id, hashedPassword, connection);
    }

    const updated = await updateTrainerByUserId(
      existingUser.id,
      {
        ime,
        prezime,
        datum_rodenja: normalizeOptional(datum_rodenja),
        adresa_stanovanja: normalizeOptional(adresa_stanovanja),
        mesto: normalizeOptional(mesto),
        telefon: normalizeOptional(telefon),
        mail: normalizeOptional(mail),
        broj_licence: normalizeOptional(broj_licence),
        datum_isticanja: normalizeOptional(datum_isticanja)
      },
      connection
    );

    if (!updated) {
      await connection.rollback();
      return res.status(404).json({ error: "Trener nije pronađen za ažuriranje." });
    }

    await connection.commit();

    const trainer = await fetchTrainerByUserId(existingUser.id);
    res.status(200).json({
      message: "Podaci o treneru su uspešno ažurirani.",
      trainer
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Greška pri ažuriranju trenerskog naloga:", error);
    res.status(500).json({ error: "Greška na serveru." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  createTrainer,
  getAllTrainers,
  getTrainerByUserId,
  updateTrainer,
  deleteTrainer,
  getTestsByTrener,
  createTrainerAccount,
  updateTrainerAccount
};