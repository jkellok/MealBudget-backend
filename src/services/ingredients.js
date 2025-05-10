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

const getAllByUser = async (req, res) => {
  try {
    const { user_id } = req.params
    console.log('user id in get by user backend', user_id)
    // ORDER BY ?
    const query = 'SELECT * FROM ingredients WHERE user_id = $1;'
    const { rows } = await db.query(query, [user_id])
    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed getting data')
  }
}

const create = async (req, res) => {
  // change later
  const { name, amount, unit, costPerKg, costPerUnit, expirationDate, buyDate, aisle, brand, store, onSale, inPantry} = req.body
  const { user_id } = req.params
  console.log('user id req params create', user_id)
  if (!name || !amount || !unit || !costPerKg) {
    return res.status(400).send('Required variables missing!')
  }

  try {
    const query = `
      INSERT INTO ingredients (name, amount, unit, cost_per_kg, cost_per_unit, expiration_date, buy_date, aisle, brand, store, on_sale, in_pantry, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `
    const values = [name, amount, unit, costPerKg, costPerUnit, expirationDate, buyDate, aisle, brand, store, onSale, inPantry, user_id]
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
    const { id, user_id } = req.params
    const query = 'SELECT * FROM ingredients WHERE ingredient_id = $1 AND user_id = $2;'
    const { rows } = await db.query(query, [id, user_id])
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
    const { id, user_id } = req.params
    const { name, amount, unit, costPerKg, costPerUnit, expirationDate, buyDate, aisle, brand, store, onSale, inPantry } = req.body

    // change this later to use Object.keys to pick columns
    // e.g. https://stackoverflow.com/questions/21759852/easier-way-to-update-data-with-node-postgres

    if (!name || !amount || !unit || !costPerKg) {
      return res.status(400).send('Required variables missing!')
    }

    const query = `
      UPDATE ingredients
      SET name = COALESCE($1, name),
          amount = COALESCE($2, amount),
          unit = COALESCE($3, unit),
          cost_per_kg = COALESCE($4, cost_per_kg),
          cost_per_unit = $5,
          expiration_date = $6,
          buy_date = $7,
          aisle = $8,
          brand = $9,
          store = $10,
          on_sale = $11,
          in_pantry = $12
      WHERE ingredient_id = $13 AND user_id = $14
      RETURNING *;
    `
    const values = [name, amount, unit, costPerKg, costPerUnit, expirationDate, buyDate, aisle, brand, store, onSale, inPantry, id, user_id]
    const { rows } = await db.query(query, values)

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
  try {
    const { id, user_id } = req.params
    const query = 'DELETE FROM ingredients WHERE ingredient_id = $1 AND user_id = $2 RETURNING *;'
    const { rows } = await db.query(query, [id, user_id])

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
  getAllByUser,
  create,
  getById,
  updateById,
  deleteById
}