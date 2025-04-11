const db = require('../db/index')

// prob not needed
const getAll = async (req, res) => {
  try {
    const query = 'SELECT * FROM recipes_ingredients;'
    const { rows } = await db.query(query)
    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed getting data')
  }
}

const getLinkedIngredientsByRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params
    const query = `
    SELECT r_i.ingredient_id, r_i.recipe_id, r_i.amount_for_recipe, r_i.unit_for_recipe, r_i.price_per_kg_for_recipe, i.name
    FROM recipes_ingredients r_i
    JOIN ingredients i ON r_i.ingredient_id = i.ingredient_id
    WHERE r_i.recipe_id = $1;
    `
    const { rows } = await db.query(query, [recipe_id])
    if (rows.length === 0) {
      return res.status(404).send('No linked ingredients found!')
    }
    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed getting data')
  }
}

// not sure if this is a good solution
const getOneLinkedIngredientByRecipe = async (req, res) => {
  try {
    const { recipe_id, ingredient_id } = req.params
    const query = 'SELECT * FROM recipes_ingredients WHERE recipe_id = $1 AND ingredient_id = $2;'
    const { rows } = await db.query(query, [recipe_id, ingredient_id])
    if (rows.length === 0) {
      return res.status(404).send('No linked ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error getting a linked ingredient!')
  }
}

// if we want to show linked recipes in the pantry section
const getRecipesByIngredient = async (req, res) => {
  try {
    const { ingredient_id } = req.params
    const query = `
    SELECT r_i.recipe_id, r.title
    FROM recipes_ingredients r_i
    JOIN recipes r ON r_i.recipe_id = r.recipe_id
    WHERE r_i.ingredient_id = $1;
    `
    const { rows } = await db.query(query, [ingredient_id])
    if (rows.length === 0) {
      return res.status(404).send('No linked recipes found!')
    }
    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed getting data')
  }
}

const addLinkedIngredient = async (req, res) => {
  // first find ingredient with same name in the pantry
  try {
    const { name, amount, unit } = req.body
    const query = 'SELECT ingredient_id, price_per_kg FROM ingredients WHERE name = $1;'
    const { rows } = await db.query(query, [name])
    if (rows.length === 0) {
      return res.status(404).send('No ingredient found in pantry!')
    }
    const ingredientToLink = rows[0]

    const { recipe_id } = req.params
    const ingredient_id = ingredientToLink.ingredient_id
    const amount_for_recipe = amount
    const unit_for_recipe = unit
    const price_per_kg_for_recipe = ingredientToLink.price_per_kg

    if (!ingredient_id || !amount_for_recipe || !unit_for_recipe || !price_per_kg_for_recipe) {
      return res.status(400).send('Required variables missing!')
    }

    // then try linking the found ingredient to the recipe
    try {
      const query = `
        INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount_for_recipe, unit_for_recipe, price_per_kg_for_recipe)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `
      const values = [recipe_id, ingredient_id, amount_for_recipe, unit_for_recipe, price_per_kg_for_recipe]
      const { rows } = await db.query(query, values)
      if (rows.length === 0) {
        return res.status(404).send('Adding ingredient failed!')
      }
      res.status(201).json(rows[0])
    } catch (err) {
      console.error(err)
      res.status(500).send('Failed to link the selected ingredient!')
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed to link the ingredient!')
  }
}

// CHANGE
/* const updateLinkedIngredient = async (req, res) => {
  try {
    const { id } = req.params
    const { name, amount, unit, pricePerKg } = req.body

    if (!name || !amount || !unit || !pricePerKg) {
      return res.status(400).send('Required variables missing!')
    }

    const query = `
      UPDATE ingredients
      SET name = COALESCE($1, name),
          amount = COALESCE($2, amount),
          unit = COALESCE($3, unit),
          price_per_kg = COALESCE($4, price_per_kg)
      WHERE ingredient_id = $5
      RETURNING *;
    `
    const { rows } = await db.query(query, [name, amount, unit, pricePerKg, id])

    if (rows.length === 0) {
      return res.status(404).send('No ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed updating the linked ingredient!')
  }
} */

const deleteLinkedIngredientFromRecipe = async (req, res) => {
  try {
    const { recipe_id, ingredient_id } = req.params
    const query = 'DELETE FROM recipes_ingredients WHERE recipe_id = $1 AND ingredient_id = $2 RETURNING *;'
    const { rows } = await db.query(query, [recipe_id, ingredient_id])

    if (rows.length === 0) {
      return res.status(404).send('No linked ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error occurred while trying to delete the linked ingredient!')
  }
}

module.exports = {
  getAll,
  getLinkedIngredientsByRecipe,
  getOneLinkedIngredientByRecipe,
  getRecipesByIngredient,
  addLinkedIngredient,
  //updateById,
  deleteLinkedIngredientFromRecipe
}