const dbPool = require("../db/pool");

async function findUserByUsername(username, connection = dbPool) {
  const [users] = await connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return users[0];
}

async function findAthleteByUsername(username, connection = dbPool) {
  const [athletes] = await connection.query(
    "SELECT * FROM athletes WHERE username = ?",
    [username]
  );
  return athletes[0];
}

async function createUser({ username, display_name, hashedPassword, role }, connection = dbPool) {
  const [result] = await connection.query(
    "INSERT INTO users (username, display_name, password, role) VALUES (?, ?, ?, ?)",
    [username, display_name, hashedPassword, role]
  );
  return result.insertId;
}

async function linkAthleteToUser(userId, username, connection = dbPool) {
  await connection.query(
    "UPDATE athletes SET user_id = ? WHERE username = ?",
    [userId, username]
  );
}

module.exports = {
  findUserByUsername,
  findAthleteByUsername,
  createUser,
  linkAthleteToUser
};