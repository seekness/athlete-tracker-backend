require('dotenv').config();
const express = require('express');
const cors = require('cors');

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const dbPool = mysql.createPool({
//   host: 'localhost',
//   user: 'root', // promenite ako imate drugog korisnika
//   password: '', // unesite vašu lozinku za bazu
//   database: 'athlete_tracker',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Dalje u kodu
const app = express();
//const port = 5000;
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server radi na portu ${port}`);
});


// Middleware
app.use(cors());
app.use(express.json()); // Omogućava serveru da parsira JSON zahteve

// Osnovna ruta za testiranje
app.get('/', (req, res) => {
  res.send('Server je pokrenut!');
});

app.post('/api/register', async (req, res) => {
  const { username, display_name, password, role } = req.body;
  let connection;

  if (!username || !password || !role) {
    return res.status(400).send('Korisničko ime, lozinka i uloga su obavezni.');
  }

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // 1. Provera za sportiste: Da li postoji uneti sportista?
    if (role === 'sportista') {
        const [athlete] = await connection.query('SELECT * FROM athletes WHERE username = ?', [username]);
        if (athlete.length === 0) {
            await connection.rollback();
            return res.status(404).send('Sportista sa unetim korisničkim imenom nije pronađen. Trener mora prvo uneti sportistu.');
        }
        if (athlete[0].user_id !== null) {
            await connection.rollback();
            return res.status(409).send('Ovaj sportista je već povezan sa nalogom.');
        }
    } else {
        // Provera da li postoji korisnik sa istim username-om za trenere
        const [existingUser] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
          await connection.rollback();
          return res.status(409).send('Korisničko ime već postoji.');
        }
    }

    // 2. Kreiranje novog korisnika
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      'INSERT INTO users (username, display_name, password, role) VALUES (?, ?, ?, ?)',
      [username, display_name, hashedPassword, role]
    );

    const newUserId = userResult.insertId;

    // 3. Povezivanje korisnika sa sportistom (samo ako je uloga 'sportista')
    if (role === 'sportista') {
      await connection.query('UPDATE athletes SET user_id = ? WHERE username = ?', [newUserId, username]);
    }

    await connection.commit();
    res.status(201).send('Korisnik je uspešno kreiran.');

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Greška pri registraciji:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).send('Korisničko ime i lozinka su obavezni.');
  }

  try {
    const [users] = await dbPool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).send('Korisničko ime ne postoji.');
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).send('Netačna lozinka.');
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, user: payload });
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Middleware za proveru JWT tokena
// Middleware za proveru tokena
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    console.log('Greška: Nema tokena u zaglavlju.');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Greška: Token nije validan ili je istekao. Detalji:', err.message);
      return res.sendStatus(403);
    }
    
    req.user = user;
    next();
  });
}

// Middleware za proveru da li je korisnik trener
function isTrener(req, res, next) {
  if (req.user.role !== 'trener') {
    return res.status(403).send('Pristup dozvoljen samo trenerima.');
  }
  next();
}

// //--- RUTAS ZA TRENINGE ---

// // Ruta za kreiranje novog treninga (za trenere)
// app.post('/trainings', authenticateToken, isTrener, async (req, res) => {
//   const { naslov, opis, datum, vreme, lokacija_id } = req.body;
//   const trener_id = req.user.id;

//   try {
//     const query = 'INSERT INTO trainings (naslov, opis, datum, vreme, lokacija_id, trener_id) VALUES (?, ?, ?, ?, ?, ?)';
//     await dbPool.query(query, [naslov, opis, datum, vreme, lokacija_id, trener_id]);
//     res.status(201).send('Trening je uspešno kreiran.');
//   } catch (error) {
//     console.error('Greška pri kreiranju treninga:', error);
//     res.status(500).send('Došlo je do greške na serveru.');
//   }
// });

// GET ruta za dohvaćanje svih treninga
app.get('/api/trainings', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const query = `
            -- Dohvatanje treninga dodeljenih preko grupa
            (
                SELECT DISTINCT
                    t.id,
                    t.opis,
                    t.datum,
                    t.vreme,
                    p.naziv AS program_naziv
                FROM
                    trainings t
                JOIN
                    programs p ON t.program_id = p.id
                JOIN
                    program_group_assignments pga ON p.id = pga.program_id
                WHERE
                    ? = 'admin' OR 
                    pga.group_id IN (SELECT group_id FROM coach_group_assignments WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?))
            )
            UNION
            -- Dohvatanje treninga dodeljenih pojedinačno
            (
                SELECT DISTINCT
                    t.id,
                    t.opis,
                    t.datum,
                    t.vreme,
                    p.naziv AS program_naziv
                FROM
                    trainings t
                JOIN
                    programs p ON t.program_id = p.id
                JOIN
                    program_athlete_assignments paa ON p.id = paa.program_id
                WHERE
                    ? = 'admin' OR 
                    paa.athlete_id IN (SELECT athlete_id FROM coach_athlete_assignments WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?))
            )
            ORDER BY datum DESC
        `;

        const params = [userRole, userId, userRole, userId];
        const [results] = await dbPool.query(query, params);

        res.status(200).json(results);
    } catch (error) {
        console.error('Greška pri dobijanju liste treninga:', error);
        res.status(500).json({ message: 'Došlo je do greške na serveru.' });
    }
});


//--- RUTAS ZA LOKACIJE ---

// Ruta za kreiranje nove lokacije (za trenere)
app.post('/api/locations', authenticateToken, isTrener, async (req, res) => {
  const { naziv, adresa, mesto } = req.body;
  
  try {
    const [existingLocation] = await dbPool.query('SELECT naziv FROM locations WHERE naziv = ?', [naziv]);
    if (existingLocation.length > 0) {
      return res.status(409).send('Lokacija sa datim nazivom već postoji.');
    }
    
    const query = 'INSERT INTO locations (naziv, adresa, mesto) VALUES (?, ?, ?)';
    await dbPool.query(query, [naziv, adresa, mesto]);
    res.status(201).send('Lokacija uspešno dodata.');
  } catch (error) {
    console.error('Greška pri dodavanju lokacije:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih lokacija (za sve prijavljene korisnike)
app.get('/api/locations', authenticateToken, async (req, res) => {
  try {
    const [locations] = await dbPool.query('SELECT * FROM locations');
    res.status(200).json(locations);
  } catch (error) {
    console.error('Greška pri dobijanju lokacija:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje novog sportiste (za trenere)
app.post('/api/athletes', authenticateToken, async (req, res) => {
  const { 
    ime, prezime, username, ime_roditelja, jmbg, datum_rodenja, 
    mesto_rodenja, adresa_stanovanja, mesto_stanovanja, 
    broj_telefona, email, aktivan , broj_knjizice, datum_poslednjeg_sportskog_pregleda
  } = req.body;
  
  if (!username) {
    return res.status(400).send('Korisničko ime sportiste je obavezno.');
  }
  if (jmbg && jmbg.length !== 13) {
      return res.status(400).send('JMBG mora da ima tačno 13 cifara.');
  }

  try {
    const query = `
      INSERT INTO athletes (ime, prezime, username, ime_roditelja, jmbg, datum_rodenja, mesto_rodenja, adresa_stanovanja, mesto_stanovanja, broj_telefona, email, aktivan, broj_knjizice, datum_poslednjeg_sportskog_pregleda) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await dbPool.query(query, [
      ime, prezime, username, ime_roditelja, jmbg, datum_rodenja, 
      mesto_rodenja, adresa_stanovanja, mesto_stanovanja, 
      broj_telefona, email, aktivan
    ]);
    res.status(201).send('Sportista je uspešno dodat.');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).send('Korisničko ime već postoji.');
    }
    console.error('Greška pri dodavanju sportiste:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

app.get('/api/athletes', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT a.id, a.ime, a.prezime, a.datum_rodenja, a.broj_telefona, a.ime_roditelja, a.jmbg, a.mesto_rodenja, a.adresa_stanovanja, a.mesto_stanovanja, a.email, a.aktivan, a.broj_knjizice, a.datum_poslednjeg_sportskog_pregleda, u.username, g.naziv AS group_name FROM athletes a LEFT JOIN users u ON a.user_id = u.id LEFT JOIN group_memberships gm ON a.id = gm.athlete_id LEFT JOIN `groups` g ON gm.group_id = g.id ORDER BY a.prezime ASC';
    const [rows] = await dbPool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju sportista:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

app.get('/api/athletes/:athleteId/groups', authenticateToken, async (req, res) => {
  const { athleteId } = req.params;
  try {
    const query = `
      SELECT g.id, g.naziv 
      FROM groups g
      JOIN group_memberships gm ON g.id = gm.group_id
      WHERE gm.athlete_id = ?;
    `;
    
    // dbPool bi trebalo da ima metodu za izvršavanje upita. 
    // Primer za mysql2 paket:
    const [groups] = await dbPool.query(query, [athleteId]);

    // U slučaju da sportista postoji, ali nema grupa, vratite prazan niz
    if (groups.length === 0) {
      // Opciono: Provera da li sportista uopšte postoji pre slanja praznog niza
      const athleteCheck = await dbPool.query('SELECT id FROM athletes WHERE id = ?', [athleteId]);
      if (athleteCheck[0].length === 0) {
        return res.status(404).send('Sportista nije pronađen.');
      }
      return res.status(200).json([]);
    }

    res.status(200).json(groups);
  } catch (error) {
    console.error('Greška pri dobijanju grupa za sportistu:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

//--- RUTAS ZA UPRAVLJANJE CLANOVIMA GRUPA ---

// Ruta za dobijanje sportista u određenoj grupi
app.get('/api/groups/:groupId/athletes', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const query = `
      SELECT a.* FROM athletes a
      JOIN group_memberships gm ON a.id = gm.athlete_id
      WHERE gm.group_id = ?;
    `;
    const [athletes] = await dbPool.query(query, [groupId]);
    res.status(200).json(athletes);
  } catch (error) {
    console.error('Greška pri dobijanju sportista za grupu:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodelu/ažuriranje sportista u grupi (za trenere)
app.post('/api/groups/:groupId/athletes', authenticateToken, isTrener, async (req, res) => {
  const { groupId } = req.params;
  const { athlete_ids } = req.body; // Očekuje se niz ID-jeva sportista
  let connection;

  if (!athlete_ids) {
    return res.status(400).send('Niz ID-jeva sportista je obavezan.');
  }

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // 1. Obriši sve postojeće članove grupe
    await connection.query('DELETE FROM group_memberships WHERE group_id = ?', [groupId]);

    // 2. Dodaj nove članove grupe
    if (athlete_ids.length > 0) {
      const values = athlete_ids.map(id => [groupId, id]);
      await connection.query('INSERT INTO group_memberships (group_id, athlete_id) VALUES ?', [values]);
    }

    await connection.commit();
    res.status(200).send('Članovi grupe su uspešno ažurirani.');
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Greška pri ažuriranju članova grupe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


// Ruta za brisanje sportiste po ID-u
app.delete('/api/athletes/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await dbPool.query('SELECT user_id FROM athletes WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Sportista nije pronađen.');
    }
    const userId = rows[0].user_id;

    // Brišemo sportistu. Zbog ON DELETE CASCADE, brišu se i povezani unosi
    await dbPool.query('DELETE FROM athletes WHERE id = ?', [id]);
    
    // Brišemo korisnički nalog povezan sa sportistom
    if (userId) {
      await dbPool.query('DELETE FROM users WHERE id = ?', [userId]);
    }
    
    res.send('Sportista uspešno obrisan.');
  } catch (error) {
    console.error('Greška pri brisanju sportiste:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

app.put('/api/athletes/:athleteId', authenticateToken, async (req, res) => {
  const { athleteId } = req.params;
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
    group_ids // KLJUČNA LINIJA: Izdvajanje niza group_ids
  } = req.body;

  try {
    // Pokretanje transakcije radi sigurnosti
    await dbPool.query('START TRANSACTION');

    // 1. Ažuriranje podataka u tabeli `athletes`
    const updateAthleteQuery = `
      UPDATE athletes
      SET
        ime = ?,
        prezime = ?,
        username = ?,
        datum_rodenja = ?,
        broj_knjizice = ?,
        datum_poslednjeg_sportskog_pregleda = ?,
        broj_telefona = ?,
        ime_roditelja = ?,
        jmbg = ?,
        mesto_rodenja = ?,
        adresa_stanovanja = ?,
        mesto_stanovanja = ?,
        email = ?,
        aktivan = ?
      WHERE id = ?;
    `;
    await dbPool.query(updateAthleteQuery, [
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
      athleteId,
    ]);

    // 2. Brisanje starih grupa za tog sportistu iz tabele `group_memberships`
    const deleteGroupsQuery = `
      DELETE FROM group_memberships WHERE athlete_id = ?;
    `;
    await dbPool.query(deleteGroupsQuery, [athleteId]);

    // 3. Dodavanje novih grupa
    if (group_ids && group_ids.length > 0) {
      const insertGroupValues = group_ids.map(groupId => [athleteId, groupId]);
      const insertGroupsQuery = `
        INSERT INTO group_memberships (athlete_id, group_id) VALUES ?;
      `;
      // Koristi se placeholder za više redova, što je efikasnije
      await dbPool.query(insertGroupsQuery, [insertGroupValues]);
    }

    // Završetak transakcije
    await dbPool.query('COMMIT');

    res.status(200).json({ message: 'Sportista je uspešno ažuriran.' });
  } catch (error) {
    // Vraćanje transakcije u slučaju greške
    await dbPool.query('ROLLBACK');
    console.error('Greška pri ažuriranju sportiste:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje lokacije
app.put('/api/locations/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  const { naziv, adresa, mesto } = req.body;
  if (!naziv || !adresa || !mesto) {
    return res.status(400).send('Sva polja su obavezna.');
  }
  try {
    await dbPool.query('UPDATE locations SET naziv = ?, adresa = ?, mesto = ? WHERE id = ?', [naziv, adresa, mesto, id]);
    res.send('Lokacija uspešno ažurirana.');
  } catch (error) {
    console.error('Greška pri ažuriranju lokacije:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za brisanje lokacije
app.delete('/api/locations/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  try {
    await dbPool.query('DELETE FROM locations WHERE id = ?', [id]);
    res.send('Lokacija uspešno obrisana.');
  } catch (error) {
    console.error('Greška pri brisanju lokacije:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih grupa
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM `groups` ORDER BY naziv ASC');
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju grupa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje nove grupe
app.post('/api/groups', authenticateToken, async (req, res) => {
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv grupe je obavezan.');
  }
  try {
    const [result] = await dbPool.query('INSERT INTO `groups` (naziv, opis) VALUES (?, ?)', [naziv, opis]);
    res.status(201).send({ id: result.insertId, naziv, opis });
  } catch (error) {
    console.error('Greška pri dodavanju grupe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje grupe
app.put('/api/groups/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv grupe je obavezan.');
  }
  try {
    await dbPool.query('UPDATE `groups` SET naziv = ?, opis = ? WHERE id = ?', [naziv, opis, id]);
    res.send('Grupa uspešno ažurirana.');
  } catch (error) {
    console.error('Greška pri ažuriranju grupe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za brisanje grupe
app.delete('/api/groups/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    // Brisanje članova grupe prvo
    await connection.query('DELETE FROM group_memberships WHERE group_id = ?', [id]);
    // Brisanje same grupe
    await connection.query('DELETE FROM `groups` WHERE id = ?', [id]);
    await connection.commit();
    res.send('Grupa uspešno obrisana.');
  } catch (error) {
    await connection.rollback();
    console.error('Greška pri brisanju grupe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  } finally {
    connection.release();
  }
});

// Nova ruta za dobijanje spiska SVIH sportista bez informacija o grupi
app.get('/api/all-athletes', authenticateToken, async (req, res) => {
  try {
    const [rows] = await dbPool.query(`
      SELECT 
        a.id, a.ime, a.prezime, a.datum_rodenja
      FROM athletes a
      ORDER BY a.prezime, a.ime ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju spiska svih sportista:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih kategorija vežbi
app.get('/api/exercise-categories', authenticateToken, async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM exercise_categories ORDER BY naziv ASC');
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju kategorija vežbi:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje nove kategorije vežbi
app.post('/api/exercise-categories', authenticateToken, async (req, res) => {
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv kategorije je obavezan.');
  }
  try {
    const [result] = await dbPool.query('INSERT INTO exercise_categories (naziv, opis) VALUES (?, ?)', [naziv, opis]);
    res.status(201).send({ id: result.insertId, naziv, opis });
  } catch (error) {
    console.error('Greška pri dodavanju kategorije vežbi:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje kategorije vežbi
app.put('/api/exercise-categories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv kategorije je obavezan.');
  }
  try {
    await dbPool.query('UPDATE exercise_categories SET naziv = ?, opis = ? WHERE id = ?', [naziv, opis, id]);
    res.send('Kategorija vežbi uspešno ažurirana.');
  } catch (error) {
    console.error('Greška pri ažuriranju kategorije vežbi:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za brisanje kategorije vežbi
app.delete('/api/exercise-categories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Ovde bi trebalo da dodate proveru da li je kategorija u upotrebi pre brisanja
    await dbPool.query('DELETE FROM exercise_categories WHERE id = ?', [id]);
    res.send('Kategorija vežbi uspešno obrisana.');
  } catch (error) {
    console.error('Greška pri brisanju kategorije vežbi:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih mišićnih grupa
app.get('/api/muscle-groups', authenticateToken, isTrener, async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM muscle_groups ORDER BY naziv ASC');
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju mišićnih grupa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih vežbi sa informacijama o mišićnim grupama i kategorijama
app.get('/api/exercises', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id, e.naziv, e.opis, 
        e.muscle_group_id, mg.naziv AS muscle_group_name,
        e.exercise_category_id, ec.naziv AS category_name,
        e.other_muscle_group_id, smg.naziv AS other_muscle_group_name,
        e.oprema, e.unilateral, e.video_link, e.slika
      FROM exercises e
      LEFT JOIN muscle_groups mg ON e.muscle_group_id = mg.id
      LEFT JOIN exercise_categories ec ON e.exercise_category_id = ec.id
      LEFT JOIN muscle_groups smg ON e.other_muscle_group_id = smg.id
      ORDER BY e.naziv ASC
    `;
    const [rows] = await dbPool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju vežbi:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje nove vežbe
app.post('/api/exercises', authenticateToken, async (req, res) => {
  const { naziv, opis, muscle_group_id, exercise_category_id, other_muscle_group_id, oprema, unilateral, video_link, slika } = req.body;
  if (!naziv || !muscle_group_id || !exercise_category_id) {
    return res.status(400).send('Naziv vežbe, mišićna grupa, kategorija i vrsta unosa su obavezni.');
  }
  try {
    const [result] = await dbPool.query(
      'INSERT INTO exercises (naziv, opis, muscle_group_id, exercise_category_id, other_muscle_group_id, oprema, unilateral, video_link, slika) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [naziv, opis, muscle_group_id, exercise_category_id, other_muscle_group_id, oprema , unilateral, video_link, slika]
    );
    res.status(201).send({ id: result.insertId, naziv, opis, muscle_group_id, exercise_category_id, other_muscle_group_id, oprema, unilateral, video_link, slika });
  } catch (error) {
    console.error('Greška pri dodavanju vežbe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje vežbe
app.put('/api/exercises/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { naziv, opis, muscle_group_id, exercise_category_id, other_muscle_group_id, oprema, unilateral, video_link, slika } = req.body;
  if (!naziv || !muscle_group_id || !exercise_category_id || !vrsta_unosa) {
    return res.status(400).send('Naziv vežbe, mišićna grupa, kategorija i vrsta unosa su obavezni.');
  }
  try {
    await dbPool.query(
      'UPDATE exercises SET naziv = ?, opis = ?, muscle_group_id = ?, exercise_category_id = ?, other_muscle_group_id = ?, oprema = ?, unilateral = ?, video_link = ?, slika = ? WHERE id = ?',
      [naziv, opis, muscle_group_id, exercise_category_id, other_muscle_group_id, oprema, unilateral, video_link, slika, id]
    );
    res.send('Vežba uspešno ažurirana.');
  } catch (error) {
    console.error('Greška pri ažuriranju vežbe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za brisanje vežbe
app.delete('/api/exercises/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await dbPool.query('DELETE FROM exercises WHERE id = ?', [id]);
    res.send('Vežba uspešno obrisana.');
  } catch (error) {
    console.error('Greška pri brisanju vežbe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih trenera
app.get('/api/coaches', authenticateToken, async (req, res) => {
    try {
        const [coaches] = await dbPool.query(
            `
            SELECT id, ime, prezime FROM trainers order by prezime ASC
            `
        );
        res.status(200).json(coaches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dobijanju liste trenera.' });
    }
});

// Ruta za dobijanje svih takmičara
app.get('/api/allathletes', authenticateToken, async (req, res) => {
    try {
        const [coaches] = await dbPool.query(
            `
            SELECT id, ime, prezime, datum_rodenja FROM athletes order by prezime ASC
            `
        );
        res.status(200).json(coaches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dobijanju liste takmičara.' });
    }
});

// Ruta za dobijanje svih programa
app.get('/api/programs', authenticateToken, async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    let query = '';
    let params = [];

    if (userRole === 'admin') {
      // Admini vide sve programe
      query = 'SELECT * FROM programs;';
    } else {
      // Treneri vide samo programe koje su kreirali
      query = 'SELECT * FROM programs WHERE kreirao_id = ?;';
      params = [userId];
    }

    const [programs] = await dbPool.query(query, params);
    res.status(200).json(programs);
  } catch (error) {
    console.error('Greška pri dobijanju programa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje novog programa
app.post('/api/programs', authenticateToken, async (req, res) => {
  const { naziv, opis } = req.body;
  const userId = req.user.id; // Pretpostavka da token sadrži ID korisnika

  try {
    const query = `
      INSERT INTO programs (naziv, opis, kreirao_id)
      VALUES (?, ?, ?);
    `;
    await dbPool.query(query, [naziv, opis, userId]);
    res.status(201).json({ message: 'Program uspešno kreiran.' });
  } catch (error) {
    console.error('Greška pri kreiranju programa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje programa
app.put('/api/programs/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Provera da li korisnik ima dozvolu za izmenu
    let programCheckQuery = 'SELECT kreirao_id FROM programs WHERE id = ?;';
    const [programResult] = await dbPool.query(programCheckQuery, [id]);

    if (programResult.length === 0) {
      return res.status(404).json({ message: 'Program nije pronađen.' });
    }

    const kreatorId = programResult[0].kreirao_id;

    // Dozvoli izmenu samo adminu ili kreatoru programa
    if (userRole !== 'admin' && kreatorId !== userId) {
      return res.status(403).json({ message: 'Nemate dozvolu za izmenu ovog programa.' });
    }

    // Ažuriranje programa
    const updateQuery = `
      UPDATE programs
      SET naziv = ?, opis = ?
      WHERE id = ?;
    `;
    await dbPool.query(updateQuery, [naziv, opis, id]);

    res.status(200).json({ message: 'Program uspešno ažuriran.' });
  } catch (error) {
    console.error('Greška pri ažuriranju programa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za brisanje programa
app.delete('/api/programs/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  try {
    await dbPool.query('DELETE FROM programs WHERE id = ?', [id]);
    res.send('Program uspešno obrisan.');
  } catch (error) {
    console.error('Greška pri brisanju programa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih treninga za određeni program, uključujući vežbe
app.get('/api/programs/:programId/trainings', authenticateToken, isTrener, async (req, res) => {
  const { programId } = req.params;
  try {
    // Dobijanje osnovnih informacija o treninzima
    const [trainings] = await dbPool.query(`
      SELECT 
        t.id, t.opis, t.datum, t.vreme, t.predicted_duration_minutes,
        t.location_id, l.naziv AS location_name
      FROM trainings t
      LEFT JOIN locations l ON t.location_id = l.id
      WHERE t.program_id = ?
      ORDER BY t.datum ASC, t.vreme ASC
    `, [programId]);

    // Za svaki trening, dobijanje svih vežbi
    for (const training of trainings) {
      const [exercises] = await dbPool.query(`
        SELECT 
          te.id, te.broj_serija, te.tezina_kg, te.vreme_sekunde, te.duzina_metri, te.broj_ponavljanja, te.rest_duration_seconds, te.rest_after_exercise_seconds, te.jacina_izvodjenja, te.vrsta_unosa, te.superset,
          e.id AS exercise_id, e.naziv AS exercise_name
        FROM training_exercises te
        JOIN exercises e ON te.exercise_id = e.id
        WHERE te.training_id = ?
        ORDER BY te.id ASC
      `, [training.id]);
      training.exercises = exercises;
    }
    
    res.json(trainings);
  } catch (error) {
    console.error('Greška pri dobijanju treninga:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje novog treninga u program
app.post('/api/programs/:programId/trainings', authenticateToken, isTrener, async (req, res) => {
  const { programId } = req.params;
  const { opis, datum, vreme, predicted_duration_minutes, location_id, exercises } = req.body;
  
  if (!opis || !datum || !vreme) {
    return res.status(400).send('Opis, datum i vreme treninga su obavezni.');
  }

  try {
    const [trainingResult] = await dbPool.query(
      'INSERT INTO trainings (program_id, opis, datum, vreme, predicted_duration_minutes, location_id) VALUES (?, ?, ?, ?, ?, ?)',
      [programId, opis, datum, vreme, predicted_duration_minutes, location_id]
    );
    const trainingId = trainingResult.insertId;

    if (exercises && exercises.length > 0) {
      const exerciseValues = exercises.map(ex => [
        trainingId, 
        ex.exercise_id, 
        ex.broj_serija, 
        ex.tezina_kg, 
        ex.vreme_sekunde, 
        ex.duzina_metri, 
        ex.broj_ponavljanja,
        ex.rest_duration_seconds, 
        ex.rest_after_exercise_seconds,
        ex.jacina_izvodjenja, // Novo polje za jačinu izvođenja
        ex.vrsta_unosa,
        ex.superset || 0 // Ako superset nije definisan, podrazumeva se 0
      ]);
      await dbPool.query(
        'INSERT INTO training_exercises (training_id, exercise_id, broj_serija, tezina_kg, vreme_sekunde, duzina_metri, broj_ponavljanja, rest_duration_seconds, rest_after_exercise_seconds, jacina_izvodjenja, vrsta_unosa, superset) VALUES ?',
        [exerciseValues]
      );
    }

    res.status(201).send('Trening uspešno dodat.');
  } catch (error) {
    console.error('Greška pri dodavanju treninga:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje postojećeg treninga
app.put('/api/trainings/:trainingId', authenticateToken, isTrener, async (req, res) => {
    const { trainingId } = req.params;
    const { opis, datum, vreme, predicted_duration_minutes, location_id, exercises } = req.body;

    if (!opis || !datum || !vreme) {
        return res.status(400).send('Opis, datum i vreme treninga su obavezni.');
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Ažuriranje glavnih podataka o treningu
        await connection.query(
            'UPDATE trainings SET opis = ?, datum = ?, vreme = ?, predicted_duration_minutes = ?, location_id = ? WHERE id = ?',
            [opis, datum, vreme, predicted_duration_minutes, location_id, trainingId]
        );

        // 2. Dohvatanje postojećih vežbi za ovaj trening
        const [existingExercises] = await connection.query(
            'SELECT id FROM training_exercises WHERE training_id = ?',
            [trainingId]
        );
        const existingExerciseIds = existingExercises.map(ex => ex.id);

        const newExerciseIds = exercises.map(ex => ex.id).filter(id => id);

        // 3. Brisanje vežbi koje su uklonjene na frontendu
        const idsToDelete = existingExerciseIds.filter(id => !newExerciseIds.includes(id));
        if (idsToDelete.length > 0) {
            await connection.query(
                'DELETE FROM training_exercises WHERE id IN (?)',
                [idsToDelete]
            );
        }

        // 4. Ažuriranje postojećih i dodavanje novih vežbi
        for (let i = 0; i < exercises.length; i++) {
            const exData = exercises[i];
            const sort_order = i;

            // Logika za superset: prva vežba ne može biti superset
            let isSuperset = exData.superset;
            if (i === 0) {
                isSuperset = false;
            }

            const exerciseValues = [
                exData.exercise_id,
                exData.broj_serija || null,
                exData.tezina_kg || null,
                exData.vreme_sekunde || null,
                exData.duzina_metri || null,
                exData.broj_ponavljanja || null,
                exData.rest_duration_seconds || null,
                exData.rest_after_exercise_seconds || null,
                exData.jacina_izvodjenja || null,
                exData.vrsta_unosa,
                isSuperset,
                sort_order
            ];

            if (exData.id) {
                // Ažuriranje postojeće vežbe
                await connection.query(
                    `UPDATE training_exercises SET
                     exercise_id = ?, broj_serija = ?, tezina_kg = ?, vreme_sekunde = ?, duzina_metri = ?,
                     broj_ponavljanja = ?, rest_duration_seconds = ?, rest_after_exercise_seconds = ?,
                     jacina_izvodjenja = ?, vrsta_unosa = ?, superset = ?, sort_order = ?
                     WHERE id = ?`,
                    [...exerciseValues, exData.id]
                );
            } else {
                // Dodavanje nove vežbe
                await connection.query(
                    `INSERT INTO training_exercises (
                     training_id, exercise_id, broj_serija, tezina_kg, vreme_sekunde,
                     duzina_metri, broj_ponavljanja, rest_duration_seconds,
                     rest_after_exercise_seconds, jacina_izvodjenja, vrsta_unosa, superset, sort_order
                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [trainingId, ...exerciseValues]
                );
            }
        }

        await connection.commit();
        res.send('Trening uspešno ažuriran.');
    } catch (error) {
        await connection.rollback();
        console.error('Greška pri ažuriranju treninga:', error);
        res.status(500).send('Došlo je do greške na serveru.');
    } finally {
        if (connection) connection.release();
    }
});

// Ruta za brisanje treninga
app.delete('/api/trainings/:trainingId', authenticateToken, isTrener, async (req, res) => {
  const { trainingId } = req.params;
  try {
    await dbPool.query('DELETE FROM trainings WHERE id = ?', [trainingId]);
    res.send('Trening uspešno obrisan.');
  } catch (error) {
    console.error('Greška pri brisanju treninga:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// POST ruta za dodelu programa grupi
app.post('/api/assign-program/group', authenticateToken, async (req, res) => {
    const { programId, groupId } = req.body;
    const assignedByUserId = req.user.id;

    try {
        await dbPool.query(
            'INSERT INTO program_group_assignments (program_id, group_id, assigned_by_user_id) VALUES (?, ?, ?)',
            [programId, groupId, assignedByUserId]
        );
        res.status(201).json({ message: 'Program uspešno dodeljen grupi.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dodeljivanju programa grupi.' });
    }
});

// POST ruta za dodelu programa pojedinačnom sportisti
app.post('/api/assign-program/athlete', authenticateToken, async (req, res) => {
    const { programId, athleteId } = req.body;
    const assignedByUserId = req.user.id;

    try {
        await dbPool.query(
            'INSERT INTO program_athlete_assignments (program_id, athlete_id, assigned_by_user_id) VALUES (?, ?, ?)',
            [programId, athleteId, assignedByUserId]
        );
        res.status(201).json({ message: 'Program uspešno dodeljen sportisti.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dodeljivanju programa sportisti.' });
    }
});

// PUT ruta za azuriranje dodele programa grupi
app.put('/api/assign-program/group', authenticateToken, async (req, res) => {
    const { programId, groupId } = req.body;
    const assignedByUserId = req.user.id;

    try {
        const [existingAssignment] = await dbPool.query(
            'SELECT * FROM program_group_assignments WHERE group_id = ?',
            [groupId]
        );

        if (existingAssignment.length > 0) {
            await dbPool.query(
                'UPDATE program_group_assignments SET program_id = ?, assigned_by_user_id = ? WHERE group_id = ?',
                [programId, assignedByUserId, groupId]
            );
        } else {
            await dbPool.query(
                'INSERT INTO program_group_assignments (program_id, group_id, assigned_by_user_id) VALUES (?, ?, ?)',
                [programId, groupId, assignedByUserId]
            );
        }
        res.status(200).json({ message: 'Dodela programa grupi uspešno ažurirana.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri ažuriranju dodele programa grupi.' });
    }
});

// PUT ruta za azuriranje dodele programa pojedinačnom sportisti
app.put('/api/assign-program/athlete', authenticateToken, async (req, res) => {
    const { programId, athleteId } = req.body;
    const assignedByUserId = req.user.id;

    try {
        const [existingAssignment] = await dbPool.query(
            'SELECT * FROM program_athlete_assignments WHERE athlete_id = ?',
            [athleteId]
        );

        if (existingAssignment.length > 0) {
            await dbPool.query(
                'UPDATE program_athlete_assignments SET program_id = ?, assigned_by_user_id = ? WHERE athlete_id = ?',
                [programId, assignedByUserId, athleteId]
            );
        } else {
            await dbPool.query(
                'INSERT INTO program_athlete_assignments (program_id, athlete_id, assigned_by_user_id) VALUES (?, ?, ?)',
                [programId, athleteId, assignedByUserId]
            );
        }
        res.status(200).json({ message: 'Dodela programa sportisti uspešno ažurirana.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri ažuriranju dodele programa sportisti.' });
    }
});

// DELETE ruta za brisanje dodele programa grupi
app.delete('/api/assign-program/group/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Provera da li dodela postoji i ko ju je napravio
    const checkQuery = 'SELECT assigned_by_user_id FROM program_group_assignments WHERE id = ?';
    const [assignment] = await dbPool.query(checkQuery, [id]);

    if (assignment.length === 0) {
      return res.status(404).json({ message: 'Dodela nije pronađena.' });
    }

    const assignedByUserId = assignment[0].assigned_by_user_id;

    // Dozvoli brisanje samo adminu ili korisniku koji je napravio dodelu
    if (userRole !== 'admin' && assignedByUserId !== userId) {
      return res.status(403).json({ message: 'Nemate dozvolu da obrišete ovu dodelu.' });
    }

    // Izvrši brisanje
    const deleteQuery = 'DELETE FROM program_group_assignments WHERE id = ?';
    await dbPool.query(deleteQuery, [id]);

    res.status(200).json({ message: 'Dodela uspešno obrisana.' });
  } catch (error) {
    console.error('Greška pri brisanju dodele programa za grupu:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// DELETE ruta za brisanje dodele programa sportisti
app.delete('/api/assign-program/athlete/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Provera da li dodela postoji i ko ju je napravio
    const checkQuery = 'SELECT assigned_by_user_id FROM program_athlete_assignments WHERE id = ?';
    const [assignment] = await dbPool.query(checkQuery, [id]);

    if (assignment.length === 0) {
      return res.status(404).json({ message: 'Dodela nije pronađena.' });
    }

    const assignedByUserId = assignment[0].assigned_by_user_id;

    // Dozvoli brisanje samo adminu ili korisniku koji je napravio dodelu
    if (userRole !== 'admin' && assignedByUserId !== userId) {
      return res.status(403).json({ message: 'Nemate dozvolu da obrišete ovu dodelu.' });
    }

    // Izvrši brisanje
    const deleteQuery = 'DELETE FROM program_athlete_assignments WHERE id = ?';
    await dbPool.query(deleteQuery, [id]);

    res.status(200).json({ message: 'Dodela uspešno obrisana.' });
  } catch (error) {
    console.error('Greška pri brisanju dodele programa za sportistu:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// GET ruta za dobijanje dodeljenih programa za grupe
app.get('/api/assigned-programs/groups', authenticateToken, async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    let query = 
      'SELECT pg.id AS assignment_id, p.naziv AS program_naziv, g.naziv AS group_naziv FROM program_group_assignments pg JOIN programs p ON pg.program_id = p.id JOIN `groups` g ON pg.group_id = g.id';
    let params = [];

    if (userRole !== 'admin') {
      // Treneri vide samo grupe koje su im dodeljene
      query += `
        JOIN coach_group_assignments cg ON g.id = cg.group_id
        JOIN trainers tr ON tr.id = cg.coach_id
        WHERE tr.user_id = ?
      `;
      params.push(userId);
    }

    const [assignments] = await dbPool.query(query, params);
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Greška pri dobijanju dodeljenih programa za grupe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// GET ruta za dobijanje dodeljenih programa za sportiste
app.get('/api/assigned-programs/athletes', authenticateToken, async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    let query = `
      SELECT
        pa.id AS assignment_id,
        p.naziv AS program_naziv,
        a.ime, a.prezime
      FROM program_athlete_assignments pa
      JOIN programs p ON pa.program_id = p.id
      JOIN athletes a ON pa.athlete_id = a.id
    `;
    let params = [];

    if (userRole !== 'admin') {
      // Treneri vide samo sportiste iz svojih grupa
      // Ovo zahteva kompleksniji JOIN
      query += `
        JOIN coach_athlete_assignments ag ON a.id = ag.athlete_id
        JOIN trainers tr ON tr.id = ag.coach_id
        WHERE tr.user_id = ?
      `;
      params.push(userId);
    }
    
    const [assignments] = await dbPool.query(query, params);
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Greška pri dobijanju dodeljenih programa za sportiste:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje dodeljenih sportista za određenog trenera
app.get('/api/coaches/:coachId/assigned-athletes', authenticateToken, async (req, res) => {
    try {
        const { coachId } = req.params;
        const [athletes] = await dbPool.query(
            `
            SELECT
                u.id,
                u.ime,
                u.prezime,
                u.datum_rodenja
            FROM
                athletes u
            JOIN
                coach_athlete_assignments caa ON u.id = caa.athlete_id
            WHERE
                caa.coach_id = ?
            `,
            [coachId]
        );
        res.status(200).json(athletes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dobijanju dodeljenih sportista.' });
    }
});

// Ruta za dobijanje dodeljenih grupa za određenog trenera
app.get('/api/coaches/:coachId/assigned-groups', authenticateToken, async (req, res) => {
    try {
        const { coachId } = req.params;
        const [groups] = await dbPool.query(
            `
            SELECT
                g.id,
                g.naziv
            FROM
                groups g
            JOIN
                coach_group_assignments cga ON g.id = cga.group_id
            WHERE
                cga.coach_id = ?
            `,
            [coachId]
        );
        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dobijanju dodeljenih grupa.' });
    }
});

// Ruta za dobijanje dodeljenih sportista za određenog trenera na osnovu njegovog id usera
app.get('/api/coaches/:userId/assigned-athletes-iduser', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const [athletes] = await dbPool.query(
            `
            SELECT
                u.id,
                u.ime,
                u.prezime,
                u.datum_rodenja
            FROM
                athletes u
            JOIN
                coach_athlete_assignments caa ON u.id = caa.athlete_id
            JOIN
                trainers tr ON tr.id = caa.coach_id
            WHERE
                tr.user_id = ?
            `,
            [userId]
        );
        res.status(200).json(athletes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dobijanju dodeljenih sportista.' });
    }
});

// Ruta za dobijanje dodeljenih grupa za određenog trenera na osnovu njegovog id usera
app.get('/api/coaches/:userId/assigned-groups-iduser', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const [groups] = await dbPool.query(
            'SELECT g.id, g.naziv FROM `groups` g JOIN coach_group_assignments cga ON g.id = cga.group_id JOIN trainers tr ON tr.id = cga.coach_id WHERE tr.user_id = ? ',
            [userId]
        );
        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dobijanju dodeljenih grupa.' });
    }
});

// PUT ruta za dodelu trenera sportisti (upsert logikom)
app.put('/api/coach/assign-athlete', authenticateToken, async (req, res) => {
    const { athleteId } = req.body;
    const coachId = req.user.id;

    try {
        const [existingAssignment] = await dbPool.query(
            'SELECT * FROM coach_athlete_assignments WHERE coach_id = ? AND athlete_id = ?',
            [coachId, athleteId]
        );

        if (existingAssignment.length === 0) {
            await dbPool.query(
                'INSERT INTO coach_athlete_assignments (coach_id, athlete_id) VALUES (?, ?)',
                [coachId, athleteId]
            );
            res.status(201).json({ message: 'Sportista je uspešno dodat treneru.' });
        } else {
            res.status(200).json({ message: 'Sportista je već dodat treneru.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dodeli sportiste treneru.' });
    }
});

// PUT ruta za dodelu trenera grupi (upsert logikom)
app.put('/api/coach/assign-group', authenticateToken, async (req, res) => {
    const { groupId } = req.body;
    const coachId = req.user.id;

    try {
        const [existingAssignment] = await dbPool.query(
            'SELECT * FROM coach_group_assignments WHERE coach_id = ? AND group_id = ?',
            [coachId, groupId]
        );

        if (existingAssignment.length === 0) {
            await dbPool.query(
                'INSERT INTO coach_group_assignments (coach_id, group_id) VALUES (?, ?)',
                [coachId, groupId]
            );
            res.status(201).json({ message: 'Grupa je uspešno dodata treneru.' });
        } else {
            res.status(200).json({ message: 'Grupa je već dodata treneru.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dodeli grupe treneru.' });
    }
});

// Ruta za dodelu sportista i grupa treneru (sa administratorskim pristupom)
app.post('/api/coaches/assign', authenticateToken, async (req, res) => {
    const { coach_id, athlete_ids, group_ids } = req.body;

    // Provera da li je korisnik administrator
    // Pretpostavljamo da imate 'role' kolonu u tabeli 'users'
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Samo administrator može vršiti dodele.' });
    }

    // Provera da li je izabran trener
    if (!coach_id) {
        return res.status(400).json({ message: 'ID trenera je obavezan.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // Dodeljivanje sportista
        if (athlete_ids && athlete_ids.length > 0) {
            // Izbegavajte duplikate: prvo obrišite postojeće dodele
            await connection.query(
                `DELETE FROM coach_athlete_assignments WHERE coach_id = ? AND athlete_id IN (?)`,
                [coach_id, athlete_ids]
            );
            const athleteAssignments = athlete_ids.map(athleteId => [coach_id, athleteId]);
            await connection.query(
                `INSERT INTO coach_athlete_assignments (coach_id, athlete_id) VALUES ?`,
                [athleteAssignments]
            );
        }

        // Dodeljivanje grupa
        if (group_ids && group_ids.length > 0) {
            // Izbegavajte duplikate: prvo obrišite postojeće dodele
            await connection.query(
                `DELETE FROM coach_group_assignments WHERE coach_id = ? AND group_id IN (?)`,
                [coach_id, group_ids]
            );
            const groupAssignments = group_ids.map(groupId => [coach_id, groupId]);
            await connection.query(
                `INSERT INTO coach_group_assignments (coach_id, group_id) VALUES ?`,
                [groupAssignments]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Sportisti i grupe su uspešno dodeljeni.' });

    } catch (error) {
        await connection.rollback();
        console.error('Greška pri dodeli:', error);
        res.status(500).json({ message: 'Greška pri dodeli. Molimo pokušajte ponovo.' });
    } finally {
        connection.release();
    }
});

// DELETE ruta za uklanjanje dodele trenera sportisti
app.delete('/api/coach/unassign-athlete/:athleteId', authenticateToken, async (req, res) => {
    const { athleteId } = req.params;
    const coachId = req.user.id;

    try {
        const [result] = await dbPool.query(
            'DELETE FROM coach_athlete_assignments WHERE coach_id = ? AND athlete_id = ?',
            [coachId, athleteId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Dodela za datog sportistu nije pronađena.' });
        }

        res.status(200).json({ message: 'Sportista je uspešno uklonjen sa liste trenera.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri uklanjanju dodele sportisti.' });
    }
});

// DELETE ruta za uklanjanje dodele trenera grupi
app.delete('/api/coach/unassign-group/:groupId', authenticateToken, async (req, res) => {
    const { groupId } = req.params;
    const coachId = req.user.id;

    try {
        const [result] = await dbPool.query(
            'DELETE FROM coach_group_assignments WHERE coach_id = ? AND group_id = ?',
            [coachId, groupId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Dodela za datu grupu nije pronađena.' });
        }

        res.status(200).json({ message: 'Grupa je uspešno uklonjena sa liste trenera.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri uklanjanju dodele grupi.' });
    }
});

// GET ruta za dobijanje podataka o treneru na osnovu user_id
app.get('/api/trainers/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const [trainer] = await dbPool.query(
            'SELECT * FROM trainers WHERE user_id = ?',
            [userId]
        );

        if (trainer.length === 0) {
            return res.status(404).json({ message: 'Trener nije pronađen.' });
        }

        res.status(200).json(trainer[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri dobijanju podataka o treneru.' });
    }
});

// PUT ruta za ažuriranje podataka o treneru
app.put('/api/trainers/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { ime, prezime, datum_rodenja, adresa_stanovanja, mesto, telefon, broj_licence, datum_isticanja } = req.body;
    
    // Provera da li je prijavljeni korisnik ovlašćen
    // if (req.user.id !== parseInt(userId)) {
    //     return res.status(403).json({ message: 'Nemate dozvolu za ažuriranje ovog profila.' });
    // }

    try {
        const [result] = await dbPool.query(
            `
            UPDATE trainers
            SET
                ime = ?,
                prezime = ?,
                datum_rodenja = ?,
                adresa_stanovanja = ?,
                mesto = ?,
                telefon = ?,
                broj_licence = ?,
                datum_isticanja = ?
            WHERE id = ?
            `,
            [ime, prezime, datum_rodenja, adresa_stanovanja, mesto, telefon, broj_licence, datum_isticanja, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Trener nije pronađen za ažuriranje.' });
        }

        res.status(200).json({ message: 'Podaci o treneru su uspešno ažurirani.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri ažuriranju podataka o treneru.' });
    }
});

// DELETE ruta za brisanje trenera
app.delete('/api/trainers/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    // Primer: samo administrator ili sam korisnik može da se obriše
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Nemate dozvolu za brisanje ovog profila.' });
    }
    
    try {
        const [result] = await dbPool.query(
            'DELETE FROM trainers WHERE user_id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Trener nije pronađen za brisanje.' });
        }

        res.status(200).json({ message: 'Trener je uspešno obrisan.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Greška pri brisanju trenera.' });
    }
});

// GET ruta za dobijanje prisutnosti na treningu
app.get('/api/trainings/:id/attendance', authenticateToken, async (req, res) => {
    const { id: trainingIdParam } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const trainingId = parseInt(trainingIdParam, 10);

    // Početni log
    console.log('Primljen zahtev za evidenciju prisutnosti za trening ID:', trainingIdParam);

    if (isNaN(trainingId)) {
        console.error('INVALID TRAINING ID:', trainingIdParam);
        return res.status(400).json({ message: "ID treninga nije validan." });
    }

    try {
        const query = `
            -- Dohvatanje sportista dodeljenih preko grupa
            (
                SELECT
                    a.id AS athlete_id,
                    a.ime,
                    a.prezime,
                    a.datum_rodenja,
                    ta.status,
                    ta.napomena
                FROM
                    trainings t
                JOIN
                    programs p ON t.program_id = p.id
                JOIN
                    program_group_assignments pga ON p.id = pga.program_id
                JOIN
                    group_memberships gm ON pga.group_id = gm.group_id
                JOIN
                    athletes a ON gm.athlete_id = a.id
                LEFT JOIN
                    training_attendance ta ON a.id = ta.athlete_id AND ta.training_id = t.id
                WHERE
                    t.id = ?
                    AND (
                        ? = 'admin' OR 
                        pga.group_id IN (SELECT group_id FROM coach_group_assignments WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?))
                    )
            )
            UNION
            -- Dohvatanje sportista dodeljenih pojedinačno
            (
                SELECT
                    a.id AS athlete_id,
                    a.ime,
                    a.prezime,
                    a.datum_rodenja,
                    ta.status,
                    ta.napomena
                FROM
                    trainings t
                JOIN
                    programs p ON t.program_id = p.id
                JOIN
                    program_athlete_assignments paa ON p.id = paa.program_id
                JOIN
                    athletes a ON paa.athlete_id = a.id
                LEFT JOIN
                    training_attendance ta ON a.id = ta.athlete_id AND ta.training_id = t.id
                WHERE
                    t.id = ?
                    AND (
                        ? = 'admin' OR
                        paa.athlete_id IN (SELECT athlete_id FROM coach_athlete_assignments WHERE coach_id = (SELECT id FROM trainers WHERE user_id = ?))
                    )
            )
        `;
        
        const params = [trainingId, userRole, userId, trainingId, userRole, userId];
        
        // Log za dijagnostiku
        console.log('SQL parametri za upit:', params);
        console.log('Tip trainingId:', typeof trainingId, 'Vrednost:', trainingId);
        console.log('Tip userRole:', typeof userRole, 'Vrednost:', userRole);
        console.log('Tip userId:', typeof userId, 'Vrednost:', userId);
        
        const [results] = await dbPool.query(query, params);

        // Log za uspeh
        console.log('Upit uspešno izvršen. Broj vraćenih redova:', results.length);
        
        // Uklanjanje duplikata
        const uniqueResults = Object.values(results.reduce((acc, current) => {
            acc[current.athlete_id] = current;
            return acc;
        }, {}));

        console.log('Broj jedinstvenih sportista za prikaz:', uniqueResults.length);
        
        res.status(200).json(uniqueResults);
    } catch (error) {
        // Detaljni log greške
        console.error('GREŠKA pri dobijanju prisutnosti:', error);
        res.status(500).json({ message: 'Došlo je do greške na serveru.' });
    }
});

// POST ruta za upisivanje novih unosa o prisutnosti
app.post('/api/trainings/:id/attendance', authenticateToken, async (req, res) => {
    const { id: trainingIdParam } = req.params;
    const trainingId = parseInt(trainingIdParam, 10);
    const attendanceRecords = req.body;

    if (isNaN(trainingId) || !Array.isArray(attendanceRecords)) {
        return res.status(400).json({ message: "Invalid request data." });
    }

    try {
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();

        for (const record of attendanceRecords) {
            const { athlete_id, status, napomena } = record;

            // Provera da li unos već postoji
            const [existingRecord] = await connection.query(
                `SELECT id FROM training_attendance WHERE training_id = ? AND athlete_id = ?`,
                [trainingId, athlete_id]
            );

            if (existingRecord.length > 0) {
                // Ako postoji, izvrši UPDATE
                await connection.query(
                    `UPDATE training_attendance SET status = ?, napomena = ? WHERE id = ?`,
                    [status, napomena, existingRecord[0].id]
                );
            } else {
                // Ako ne postoji, izvrši INSERT
                await connection.query(
                    `INSERT INTO training_attendance (training_id, athlete_id, status, napomena) VALUES (?, ?, ?, ?)`,
                    [trainingId, athlete_id, status, napomena]
                );
            }
        }

        await connection.commit();
        connection.release();
        res.status(200).json({ message: 'Attendance records saved successfully.' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Error saving attendance records:', error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
});

// Pokretanje servera
app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`);
});