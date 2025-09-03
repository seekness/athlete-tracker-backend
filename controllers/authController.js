const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  findUserByUsername,
  findAthleteByUsername,
  createUser,
  linkAthleteToUser
} = require("../models/authModel");
const dbPool = require("../db/pool");

async function registerUser(req, res) {
  const { username, display_name, password, role } = req.body;
  let connection;

  if (!username || !password || !role) {
    return res.status(400).json("Korisničko ime, lozinka i uloga su obavezni.");
  }

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    if (role === "sportista") {
      const athlete = await findAthleteByUsername(username, connection);
      if (!athlete) {
        await connection.rollback();
        return res.status(404).json("Sportista nije pronađen.");
      }
      if (athlete.user_id !== null) {
        await connection.rollback();
        return res.status(409).json("Sportista je već povezan sa nalogom.");
      }
    } else {
      const existingUser = await findUserByUsername(username, connection);
      if (existingUser) {
        await connection.rollback();
        return res.status(409).json("Korisničko ime već postoji.");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = await createUser(
      { username, display_name, hashedPassword, role },
      connection
    );

    if (role === "sportista") {
      await linkAthleteToUser(newUserId, username, connection);
    }

    await connection.commit();
    res.status(201).json("Korisnik je uspešno kreiran.");
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Greška pri registraciji:", error);
    res.status(500).json("Greška na serveru.");
  } finally {
    if (connection) connection.release();
  }
}

async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json("Korisničko ime i lozinka su obavezni.");
  }

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json("Korisničko ime ne postoji.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json("Netačna lozinka.");
    }

    const payload = { id: user.id, username: user.username, display_name: user.display_name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: payload });
  } catch (error) {
    console.error("Greška pri prijavi:", error);
    res.status(500).json("Greška na serveru.");
  }
}

module.exports = { registerUser, loginUser };