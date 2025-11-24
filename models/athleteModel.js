const dbPool = require("../db/pool");

async function insertAthlete(data) {
  const query = `
    INSERT INTO athletes (
      ime, prezime, username, ime_roditelja, jmbg, datum_rodenja,
      mesto_rodenja, adresa_stanovanja, mesto_stanovanja,
      broj_telefona, email, aktivan, broj_knjizice,
      datum_poslednjeg_sportskog_pregleda, is_paying_member, payment_start_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await dbPool.query(query, [
    data.ime, data.prezime, data.username, data.ime_roditelja, data.jmbg, data.datum_rodenja,
    data.mesto_rodenja, data.adresa_stanovanja, data.mesto_stanovanja,
    data.broj_telefona, data.email, data.aktivan, data.broj_knjizice,
    data.datum_poslednjeg_sportskog_pregleda, data.is_paying_member, data.payment_start_date
  ]);
}

async function fetchAllAthletesWithGroups(activeOnly = false) {
  let query = 'SELECT a.id, a.ime, a.prezime, a.datum_rodenja, a.broj_telefona, a.ime_roditelja, a.jmbg, a.mesto_rodenja, a.adresa_stanovanja, a.mesto_stanovanja, a.email, a.aktivan, a.broj_knjizice, a.datum_poslednjeg_sportskog_pregleda, a.is_paying_member, a.payment_start_date, a.created_at, a.username, GROUP_CONCAT(g.naziv SEPARATOR \', \') AS group_name FROM athletes a LEFT JOIN group_memberships gm ON a.id = gm.athlete_id LEFT JOIN `groups` g ON gm.group_id = g.id';
  
  if (activeOnly) {
    query += ' WHERE a.aktivan = 1';
  }
  
  query += ' GROUP BY a.id ORDER BY a.prezime ASC';
  const [rows] = await dbPool.query(query);
  return rows;
}

async function fetchGroupsByAthleteId(athleteId) {
  const [groups] = await dbPool.query(
    'SELECT g.id, g.naziv FROM `groups` g JOIN group_memberships gm ON g.id = gm.group_id WHERE gm.athlete_id = ?',
    [athleteId]
  );

  if (groups.length === 0) {
    const [check] = await dbPool.query("SELECT id FROM athletes WHERE id = ?", [athleteId]);
    if (check.length === 0) return null;
    return [];
  }

  return groups;
}

async function fetchAthleteById(id) {
  const [rows] = await dbPool.query("SELECT * FROM athletes WHERE id = ?", [id]);
  return rows[0];
}

async function removeAthleteById(id) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM group_memberships WHERE athlete_id = ?", [id]);
    await connection.query("DELETE FROM athletes WHERE id = ?", [id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateAthleteById(athleteId, data) {
  const {
    ime,
    prezime,
    username,
    datum_rodenja,
    broj_knjizice,
    datum_poslednjeg_sportskog_pregleda,
    broj_telefona,
    ime_roditelja,
    jmbg,
    mesto_rodenja,
    adresa_stanovanja,
    mesto_stanovanja,
    email,
    aktivan,
    is_paying_member,
    payment_start_date,
    group_ids
  } = data;

  await dbPool.query("START TRANSACTION");

  const updateQuery = `
    UPDATE athletes SET
      ime = ?, prezime = ?, username = ?, datum_rodenja = ?, broj_knjizice = ?,
      datum_poslednjeg_sportskog_pregleda = ?, broj_telefona = ?, ime_roditelja = ?, jmbg = ?,
      mesto_rodenja = ?, adresa_stanovanja = ?, mesto_stanovanja = ?, email = ?,
      aktivan = ?, is_paying_member = ?, payment_start_date = ?
    WHERE id = ?;
  `;

  await dbPool.query(updateQuery, [
    ime, prezime, username, datum_rodenja, broj_knjizice,
    datum_poslednjeg_sportskog_pregleda, broj_telefona, ime_roditelja, jmbg,
    mesto_rodenja, adresa_stanovanja, mesto_stanovanja, email,
    aktivan, is_paying_member, payment_start_date,
    athleteId
  ]);

  await dbPool.query(`DELETE FROM group_memberships WHERE athlete_id = ?`, [athleteId]);

  if (group_ids && group_ids.length > 0) {
    const values = group_ids.map((groupId) => [athleteId, groupId]);
    await dbPool.query(`INSERT INTO group_memberships (athlete_id, group_id) VALUES ?`, [values]);
  }

  await dbPool.query("COMMIT");
}

async function fetchAllAthletes() {
  const [rows] = await dbPool.query(`
    SELECT id, ime, prezime, datum_rodenja
    FROM athletes
    ORDER BY prezime, ime ASC
  `);
  return rows;
}

async function fetchAllCompetitors() {
  const [rows] = await dbPool.query(`
    SELECT id, ime, prezime, datum_rodenja
    FROM athletes
    ORDER BY prezime ASC
  `);
  return rows;
}

module.exports = {
  insertAthlete,
  fetchAllAthletesWithGroups,
  fetchGroupsByAthleteId,
  fetchAthleteById,
  removeAthleteById,
  updateAthleteById,
  fetchAllAthletes,
  fetchAllCompetitors
};