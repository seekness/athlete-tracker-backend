const dbPool = require("../db/pool");

async function insertTrainer(trainer) {
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
  } = trainer;

  const query = `
    INSERT INTO trainers (
      ime, prezime, datum_rodenja,
      adresa_stanovanja, mesto,
      telefon, mail, broj_licence,
      datum_isticanja, user_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await dbPool.query(query, [
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
  ]);
}

async function fetchAllTrainers() {
  const [rows] = await dbPool.query("SELECT * FROM trainers ORDER BY prezime ASC");
  return rows;
}

async function fetchTrainerByUserId(userId) {
  const [rows] = await dbPool.query("SELECT * FROM trainers WHERE user_id = ?", [userId]);
  return rows[0];
}

async function updateTrainerByUserId(userId, trainer) {
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
  } = trainer;

  const [result] = await dbPool.query(
    `
    UPDATE trainers
    SET ime = ?, prezime = ?, datum_rodenja = ?, adresa_stanovanja = ?, mesto = ?, telefon = ?, mail = ?, broj_licence = ?, datum_isticanja = ?
    WHERE user_id = ?
    `,
    [
      ime,
      prezime,
      datum_rodenja,
      adresa_stanovanja,
      mesto,
      telefon,
      mail,
      broj_licence,
      datum_isticanja,
      userId
    ]
  );
  return result.affectedRows > 0;
}

async function deleteTrainerByUserId(userId) {
  const [result] = await dbPool.query("DELETE FROM trainers WHERE user_id = ?", [userId]);
  return result.affectedRows > 0;
}

module.exports = {
  insertTrainer,
  fetchAllTrainers,
  fetchTrainerByUserId,
  updateTrainerByUserId,
  deleteTrainerByUserId
};