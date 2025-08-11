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

app.post('/register', async (req, res) => {
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

app.post('/login', async (req, res) => {
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


//--- RUTAS ZA LOKACIJE ---

// Ruta za kreiranje nove lokacije (za trenere)
app.post('/locations', authenticateToken, isTrener, async (req, res) => {
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
app.get('/locations', authenticateToken, async (req, res) => {
  try {
    const [locations] = await dbPool.query('SELECT * FROM locations');
    res.status(200).json(locations);
  } catch (error) {
    console.error('Greška pri dobijanju lokacija:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje novog sportiste (za trenere)
app.post('/athletes', authenticateToken, isTrener, async (req, res) => {
  const { 
    ime, prezime, username, ime_roditelja, jmbg, datum_rodenja, 
    mesto_rodenja, adresa_stanovanja, mesto_stanovanja, 
    broj_telefona, email, aktivan 
  } = req.body;
  
  if (!username) {
    return res.status(400).send('Korisničko ime sportiste je obavezno.');
  }
  if (jmbg && jmbg.length !== 13) {
      return res.status(400).send('JMBG mora da ima tačno 13 cifara.');
  }

  try {
    const query = `
      INSERT INTO athletes (ime, prezime, username, ime_roditelja, jmbg, datum_rodenja, mesto_rodenja, adresa_stanovanja, mesto_stanovanja, broj_telefona, email, aktivan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

app.get('/athletes', authenticateToken, isTrener, async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.ime,
        a.prezime,
        a.datum_rodenja,
        a.broj_telefona,
        a.ime_roditelja,
        a.jmbg,
        a.mesto_rodenja,
        a.adresa_stanovanja,
        a.mesto_stanovanja,
        a.email,
        a.aktivan,  
        u.username,
        g.naziv AS group_name
      FROM athletes a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN group_memberships gm ON a.id = gm.athlete_id
      LEFT JOIN groups g ON gm.group_id = g.id
      ORDER BY a.prezime ASC
    `;
    const [rows] = await dbPool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju sportista:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});


//--- RUTAS ZA UPRAVLJANJE CLANOVIMA GRUPA ---

// Ruta za dobijanje sportista u određenoj grupi
app.get('/groups/:groupId/athletes', authenticateToken, isTrener, async (req, res) => {
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
app.post('/groups/:groupId/athletes', authenticateToken, isTrener, async (req, res) => {
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
app.delete('/athletes/:id', authenticateToken, isTrener, async (req, res) => {
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

app.put('/athletes/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  const { ime, prezime, datum_rodenja, broj_telefona, ime_roditelja, jmbg, mesto_rodenja, adresa_stanovanja, mesto_stanovanja, email, group_id, username } = req.body;
  
  if (!ime || !prezime) {
    return res.status(400).send('Ime i prezime su obavezni.');
  }

  try {
    const [rows] = await dbPool.query('SELECT user_id FROM athletes WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Sportista nije pronađen.');
    }
    const userId = rows[0].user_id;

    await dbPool.query(
      `UPDATE athletes SET ime = ?, prezime = ?, datum_rodenja = ?, broj_telefona = ?, ime_roditelja = ?, jmbg = ?, mesto_rodenja = ?, adresa_stanovanja = ?, mesto_stanovanja = ?, email = ? WHERE id = ?`,
      [ime, prezime, datum_rodenja, broj_telefona, ime_roditelja, jmbg, mesto_rodenja, adresa_stanovanja, mesto_stanovanja, email, id]
    );

    await dbPool.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);

    if (group_id) {
      await dbPool.query('DELETE FROM group_memberships WHERE athlete_id = ?', [id]);
      await dbPool.query('INSERT INTO group_memberships (group_id, athlete_id) VALUES (?, ?)', [group_id, id]);
    }
    
    res.send('Podaci sportiste uspešno ažurirani.');
  } catch (error) {
    console.error('Greška pri ažuriranju sportiste:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje lokacije
app.put('/locations/:id', authenticateToken, isTrener, async (req, res) => {
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
app.delete('/locations/:id', authenticateToken, isTrener, async (req, res) => {
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
app.get('/groups', authenticateToken, isTrener, async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM groups ORDER BY naziv ASC');
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju grupa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje nove grupe
app.post('/groups', authenticateToken, isTrener, async (req, res) => {
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv grupe je obavezan.');
  }
  try {
    const [result] = await dbPool.query('INSERT INTO groups (naziv, opis) VALUES (?, ?)', [naziv, opis]);
    res.status(201).send({ id: result.insertId, naziv, opis });
  } catch (error) {
    console.error('Greška pri dodavanju grupe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje grupe
app.put('/groups/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv grupe je obavezan.');
  }
  try {
    await dbPool.query('UPDATE groups SET naziv = ?, opis = ? WHERE id = ?', [naziv, opis, id]);
    res.send('Grupa uspešno ažurirana.');
  } catch (error) {
    console.error('Greška pri ažuriranju grupe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za brisanje grupe
app.delete('/groups/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    // Brisanje članova grupe prvo
    await connection.query('DELETE FROM group_memberships WHERE group_id = ?', [id]);
    // Brisanje same grupe
    await connection.query('DELETE FROM groups WHERE id = ?', [id]);
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
app.get('/all-athletes', authenticateToken, isTrener, async (req, res) => {
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
app.get('/exercise-categories', authenticateToken, isTrener, async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM exercise_categories ORDER BY naziv ASC');
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju kategorija vežbi:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje nove kategorije vežbi
app.post('/exercise-categories', authenticateToken, isTrener, async (req, res) => {
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
app.put('/exercise-categories/:id', authenticateToken, isTrener, async (req, res) => {
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
app.delete('/exercise-categories/:id', authenticateToken, isTrener, async (req, res) => {
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
app.get('/muscle-groups', authenticateToken, isTrener, async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM muscle_groups ORDER BY naziv ASC');
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju mišićnih grupa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dobijanje svih vežbi sa informacijama o mišićnim grupama i kategorijama
app.get('/exercises', authenticateToken, isTrener, async (req, res) => {
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
app.post('/exercises', authenticateToken, isTrener, async (req, res) => {
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
app.put('/exercises/:id', authenticateToken, isTrener, async (req, res) => {
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
app.delete('/exercises/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  try {
    await dbPool.query('DELETE FROM exercises WHERE id = ?', [id]);
    res.send('Vežba uspešno obrisana.');
  } catch (error) {
    console.error('Greška pri brisanju vežbe:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});


// Ruta za dobijanje svih programa
app.get('/programs', authenticateToken, isTrener, async (req, res) => {
  try {
    const query = 'SELECT id, naziv, opis FROM programs ORDER BY naziv ASC';
    const [rows] = await dbPool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dobijanju programa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za dodavanje novog programa
app.post('/programs', authenticateToken, isTrener, async (req, res) => {
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv programa je obavezan.');
  }
  try {
    const [result] = await dbPool.query('INSERT INTO programs (naziv, opis) VALUES (?, ?)', [naziv, opis]);
    res.status(201).send({ id: result.insertId, naziv, opis });
  } catch (error) {
    console.error('Greška pri dodavanju programa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za ažuriranje programa
app.put('/programs/:id', authenticateToken, isTrener, async (req, res) => {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).send('Naziv programa je obavezan.');
  }
  try {
    await dbPool.query('UPDATE programs SET naziv = ?, opis = ? WHERE id = ?', [naziv, opis, id]);
    res.send('Program uspešno ažuriran.');
  } catch (error) {
    console.error('Greška pri ažuriranju programa:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Ruta za brisanje programa
app.delete('/programs/:id', authenticateToken, isTrener, async (req, res) => {
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
app.get('/programs/:programId/trainings', authenticateToken, isTrener, async (req, res) => {
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
app.post('/programs/:programId/trainings', authenticateToken, isTrener, async (req, res) => {
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
app.put('/trainings/:trainingId', authenticateToken, isTrener, async (req, res) => {
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
app.delete('/trainings/:trainingId', authenticateToken, isTrener, async (req, res) => {
  const { trainingId } = req.params;
  try {
    await dbPool.query('DELETE FROM trainings WHERE id = ?', [trainingId]);
    res.send('Trening uspešno obrisan.');
  } catch (error) {
    console.error('Greška pri brisanju treninga:', error);
    res.status(500).send('Došlo je do greške na serveru.');
  }
});

// Pokretanje servera
app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`);
});