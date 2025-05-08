const db = require('../db/index')

const getAll = async (req, res) => {
  try {
    const query = 'SELECT * FROM recipes;'
    const { rows } = await db.query(query)
    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed getting data')
  }
}

const create = async (req, res) => {
  const { title, servings, ingredients, instructions, description, category, tags, difficulty, rating, minutes_to_make, notes, image, is_favorite } = req.body
  if (!title || !servings || !ingredients || !instructions) {
    return res.status(400).send('Required variables missing!')
  }

  try {
    const query = `
      INSERT INTO recipes (title, servings, ingredients, instructions, description, category, tags, difficulty, rating, minutes_to_make, notes, image, is_favorite)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `
    const values = [title, servings, ingredients, instructions, description, category, tags, difficulty, rating, minutes_to_make, notes, image, is_favorite]
    const { rows } = await db.query(query, values)
    if (rows.length === 0) {
      return res.status(404).send('No recipe found!')
    }
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed to add the recipe!')
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const query = 'SELECT * FROM recipes WHERE recipe_id = $1;'
    const { rows } = await db.query(query, [id])
    if (rows.length === 0) {
      return res.status(404).send('No recipe found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error getting a recipe!')
  }
}

const updateById = async (req, res) => {
  try {
    const { id } = req.params
    const { title, servings, ingredients, instructions, description, total_cost, category, tags, difficulty, rating, minutes_to_make, notes, image, is_favorite } = req.body

    // change this later to use Object.keys to pick columns
    // e.g. https://stackoverflow.com/questions/21759852/easier-way-to-update-data-with-node-postgres

    // is this necessary?
    if (!title  || !servings || !ingredients || !instructions) {
      return res.status(400).send('Required variables missing!')
    }

    const query = `
      UPDATE recipes
      SET title = COALESCE($1, title),
          servings = COALESCE($2, servings),
          ingredients = COALESCE($3, ingredients),
          instructions = COALESCE($4, instructions),
          description = $5,
          total_cost = $6,
          category = $7,
          tags = $8,
          difficulty = $9,
          rating = $10,
          minutes_to_make = $11,
          notes = $12,
          image = $13,
          is_favorite = $14
      WHERE recipe_id = $15
      RETURNING *;
    `
    const { rows } = await db.query(query, [title, servings, ingredients, instructions, description, total_cost, category, tags, difficulty, rating, minutes_to_make, notes, image, is_favorite, id])

    if (rows.length === 0) {
      return res.status(404).send('No recipe found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed updating the recipe!')
  }
}

const deleteById = async (req, res) => {
  try {
    const { id } = req.params
    const query = 'DELETE FROM recipes WHERE recipe_id = $1 RETURNING *;'
    const { rows } = await db.query(query, [id])

    if (rows.length === 0) {
      return res.status(404).send('No recipe found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error occurred while trying to delete the recipe!')
  }
}

module.exports = {
  getAll,
  create,
  getById,
  updateById,
  deleteById
}