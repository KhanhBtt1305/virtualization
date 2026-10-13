const db = require('./db');

const getUserByUsername = async (username) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  const [rows] = await db.query(sql, [username]);
  return rows;
};


module.exports = { getUserByUsername };