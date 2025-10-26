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

async function findUserById(id, connection = dbPool) {
  const [users] = await connection.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  return users[0];
}

async function createUser({ username, display_name, hashedPassword, role }, connection = dbPool) {
  const [result] = await connection.query(
    "INSERT INTO users (username, display_name, password, role) VALUES (?, ?, ?, ?)",
    [username, display_name, hashedPassword, role]
  );
  return result.insertId;
}

async function updateUserCore({ id, username, display_name }, connection = dbPool) {
  await connection.query(
    "UPDATE users SET username = ?, display_name = ? WHERE id = ?",
    [username, display_name, id]
  );
}

async function updateUserPassword(id, hashedPassword, connection = dbPool) {
  await connection.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedPassword, id]
  );
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
  findUserById,
  createUser,
  updateUserCore,
  updateUserPassword,
  linkAthleteToUser
};