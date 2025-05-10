const db = require('../db/index')
const bcrypt = require('bcryptjs')

// sign up, create new user
const create = async (req, res) => {
  const { username, password } = req.body
  console.log('create new user with', username, password)
  try {
    // check if user already exists
    const existingUserQuery = `
      SELECT * FROM users
      WHERE username = $1
    `
    const existingUser = await db.query(existingUserQuery, [username])
    console.log('existinguser', existingUser.rows.length)

    if (existingUser.rows.length > 0) {
      return res.status(400).send('User already exists!')
    }
    // hash password
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('passwordhash is', passwordHash)
    const query = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING user_id, username
    `
    const values = [username, passwordHash]
    const { rows } = await db.query(query, values)
    if (rows.length === 0) {
      return res.status(404).send('Registration failed!')
    }
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error in registration')
  }
}

// if user wants to change name/password
const updateById = async (req, res) => {
  /* try {
    const { id } = req.params
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).send('Required variables missing!')
    }

    // compare hashed password here

    const query = `
      UPDATE users
      SET username = COALESCE($1, username),
          amount = COALESCE($2, amount),
      WHERE user_id = $13
      RETURNING *;
    `
    const values = [username, passwordHash]
    const { rows } = await db.query(query, values)

    if (rows.length === 0) {
      return res.status(404).send('No user found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed updating the user!')
  } */
}

// delete user
const deleteById = async (req, res) => {
  try {
    const { id } = req.params
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *;'
    const { rows } = await db.query(query, [id])

    if (rows.length === 0) {
      return res.status(404).send('No user found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error occurred while trying to delete the user!')
  }
}

module.exports = {
  create,
  updateById,
  deleteById
}