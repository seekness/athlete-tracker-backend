const dbPool = require("../db/pool");

async function insertTrainer(trainer, connection = dbPool) {
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

  const [result] = await connection.query(query, [
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

  return result.insertId;
}

async function fetchAllTrainers(connection = dbPool) {
  const [rows] = await connection.query(
    `SELECT
       t.id,
       t.user_id,
       t.ime,
       t.prezime,
       t.datum_rodenja,
       t.adresa_stanovanja,
       t.mesto,
       t.telefon,
       t.mail,
  t.broj_licence,
  t.datum_isticanja,
  NULL AS created_at,
       COALESCE(u.username, '') AS username,
       COALESCE(u.display_name, CONCAT_WS(' ', t.ime, t.prezime)) AS display_name,
       u.role AS user_role
     FROM trainers t
     LEFT JOIN users u ON u.id = t.user_id
     ORDER BY t.prezime ASC, t.ime ASC`
  );
  return rows;
}

async function fetchTrainerByUserId(userId, connection = dbPool) {
  const [rows] = await connection.query(
    `SELECT
       t.id,
       t.user_id,
       t.ime,
       t.prezime,
       t.datum_rodenja,
       t.adresa_stanovanja,
       t.mesto,
       t.telefon,
       t.mail,
  t.broj_licence,
  t.datum_isticanja,
  NULL AS created_at,
       COALESCE(u.username, '') AS username,
       COALESCE(u.display_name, CONCAT_WS(' ', t.ime, t.prezime)) AS display_name,
       u.role AS user_role
     FROM trainers t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

async function updateTrainerByUserId(userId, trainer, connection = dbPool) {
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

  const [result] = await connection.query(
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

async function deleteTrainerByUserId(userId, connection = dbPool) {
  const [result] = await connection.query("DELETE FROM trainers WHERE user_id = ?", [userId]);
  return result.affectedRows > 0;
}

module.exports = {
  insertTrainer,
  fetchAllTrainers,
  fetchTrainerByUserId,
  updateTrainerByUserId,
  deleteTrainerByUserId
};