// login and logout and sign up

const db = require('../db/index')
const bcrypt = require('bcryptjs')

const login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).send('Required credentials missing!')
  }

  try {
    const query = `
      SELECT * FROM users
      WHERE username = $1
    `
    const { rows } = await db.query(query, [username])
    if (rows.length === 0) {
      return res.status(404).send({ message: 'No user found!' })
    }
    const passwordIsMatch = await bcrypt.compare(password, rows[0].password)
    if (!passwordIsMatch) {
      return res.status(400).send({ message: 'Invalid credentials!' })
    }
    // could generate token here if want to use jwt
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Login failed!' })
  }
}

const logout = async (req, res) => {
  // logout
  // remove token? if we generate token
}

module.exports = {
  login,
  logout,
}