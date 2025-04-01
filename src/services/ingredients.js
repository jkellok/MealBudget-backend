const db = require('../db/index')

const getAll = async (req, res) => {
  try {
    // ORDER BY ?
    const query = 'SELECT * FROM ingredients;'
    const { rows } = await db.query(query)
    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed getting data')
  }
}

const create = async (req, res) => {
  // change later
  const { name, amount, unit, pricePerKg } = req.body
  if (!name || !amount || !unit || !pricePerKg) {
    return res.status(400).send('Required variables missing!')
  }

  try {
    const query = `
      INSERT INTO ingredients (name, amount, unit, price_per_kg)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `
    const values = [name, amount, unit, pricePerKg]
    const { rows } = await db.query(query, values)
    if (rows.length === 0) {
      return res.status(404).send('No ingredient found!')
    }
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed to add the ingredient!')
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const query = 'SELECT * FROM ingredients WHERE id = $1;'
    const { rows } = await db.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).send('No ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error getting an ingredient!')
  }
}

const updateById = async (req, res) => {
  try {
    const { id } = req.params
    const { name, amount, unit, pricePerKg } = req.body

    console.log('REQ PARAMS', req.params)
    console.log('REQ BODY', req.body)

    // change this later to use Object.keys to pick columns
    // e.g. https://stackoverflow.com/questions/21759852/easier-way-to-update-data-with-node-postgres

    if (!name || !amount || !unit || !pricePerKg) {
      return res.status(400).send('Required variables missing!')
    }

    const query = `
      UPDATE ingredients
      SET name = COALESCE($1, name),
          amount = COALESCE($2, amount),
          unit = COALESCE($3, unit),
          price_per_kg = COALESCE($4, price_per_kg)
      WHERE id = $5
      RETURNING *;
    `
    const { rows } = await db.query(query, [name, amount, unit, pricePerKg, id])

    if (rows.length === 0) {
      return res.status(404).send('No ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed updating the ingredient!')
  }
}

const deleteById = async (req, res) => {
  console.log('IN DELETE BY ID')
  try {
    console.log('req params', req.params)
    const { id } = req.params
    const query = 'DELETE FROM ingredients WHERE id = $1 RETURNING *;'
    const { rows } = await db.query(query, [id])

    if (rows.length === 0) {
      return res.status(404).send('No ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error occurred while trying to delete the ingredient!')
  }
}

module.exports = {
  getAll,
  create,
  getById,
  updateById,
  deleteById
}