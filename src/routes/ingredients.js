const express = require('express')
const router = express.Router()
const db = require('../db/index.js')

// get all ingredients
router.get('/', async (req, res) => {
  try {
    // ORDER BY ?
    const query = 'SELECT * FROM ingredients;'
    const { rows } = await db.query(query)
    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed getting data')
  }
})

// post an ingredient
router.post('/', async (req, res) => {
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
})

// get specific ingredient
router.get('/:id', async (req, res) => {
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
})

// update an ingredient
router.put('/:id', async (req, res) => {
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
    res.status(500).send('Failed updating ingredient!')
  }
})

// delete an ingredient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const query = 'DELETE FROM ingredients WHERE id = $1 RETURNING *;'
    const { rows } = await db.query(query, [id])

    if (rows.length === 0) {
      return res.status(404).send('No ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error occurred while trying to delete an ingredient!')
  }
})

module.exports = router