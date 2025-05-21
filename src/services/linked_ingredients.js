const db = require('../db/index')
const { calculateIngredientCost } = require('../utils/calculateCost')

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
    SELECT r_i.ingredient_id, r_i.recipe_id, r_i.ingredient_amount, r_i.ingredient_unit, r_i.ingredient_cost, i.name, i.cost_per_kg
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

const getLinkedIngredientCostPerKg = async (req, res) => {
  try {
    // is recipe_id needed?
    const { recipe_id, ingredient_id } = req.params
    const query = `
    SELECT i.cost_per_kg
    FROM recipes_ingredients r_i
    JOIN ingredients i ON r_i.ingredient_id = i.ingredient_id
    WHERE r_i.recipe_id = $1 AND r_i.ingredient_id = $2;
    `
    const { rows } = await db.query(query, [recipe_id, ingredient_id])
    if (rows.length === 0) {
      return res.status(404).send('No linked ingredient found!')
    }
    res.status(200).json(rows[0])
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
    const query = 'SELECT ingredient_id, cost_per_kg, weight_per_piece, cost_per_piece FROM ingredients WHERE name = $1;'
    const { rows } = await db.query(query, [name])
    if (rows.length === 0) {
      return res.status(404).send('No ingredient found in pantry!')
    }
    const ingredientToLink = rows[0]

    const { recipe_id } = req.params
    const ingredient_id = ingredientToLink.ingredient_id
    const ingredient_amount = amount
    const ingredient_unit = unit
    //const ingredient_cost = ingredientToLink.cost_per_kg

    if (!ingredient_id || !ingredient_amount || !ingredient_unit) {
      return res.status(400).send('Required variables missing!')
    }

    // calculate ingredient cost
    const ingredientForCostCalculation = {
      cost_per_kg: ingredientToLink.cost_per_kg,
      ingredient_unit: unit,
      ingredient_amount: amount,
      weight_per_piece: ingredientToLink.weight_per_piece,
      cost_per_piece: ingredientToLink.cost_per_piece
    }

    const calculatedCost = calculateIngredientCost(ingredientForCostCalculation)

    // then try linking the found ingredient to the recipe
    try {
      const query = `
        INSERT INTO recipes_ingredients (recipe_id, ingredient_id, ingredient_amount, ingredient_unit, ingredient_cost)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `
      const values = [recipe_id, ingredient_id, ingredient_amount, ingredient_unit, calculatedCost]
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

const updateLinkedIngredient = async (req, res) => {
  try {
    const { recipe_id } = req.params
    const { name, amount, unit } = req.body

    if (!name || !amount || !unit) {
      return res.status(400).send('Required variables missing!')
    }

    // find if a linked ingredient exists based on ingredient name
    const findQuery = `
      SELECT r_i.ingredient_id, i.cost_per_kg
      FROM recipes_ingredients r_i
      JOIN ingredients i ON r_i.ingredient_id = i.ingredient_id
      WHERE i.name = $1 AND r_i.recipe_id = $2;
    `
    const { rows } = await db.query(findQuery, [name, recipe_id])
    const foundLinkedIngredient = rows[0]
    if (rows.length === 0) {
      return res.status(404).send('No ingredient found in pantry!')
    }
    else {
      // if found linked ingredient, recalculate cost and update amount, unit, cost
      try {
        const ingredientForCostCalculation = {
          cost_per_kg: foundLinkedIngredient.cost_per_kg,
          ingredient_unit: unit,
          ingredient_amount: amount
        }
        const calculatedCost = calculateIngredientCost(ingredientForCostCalculation)

        const query = `
          UPDATE recipes_ingredients
          SET ingredient_amount = COALESCE($1, ingredient_amount),
              ingredient_unit = COALESCE($2, ingredient_unit),
              ingredient_cost = COALESCE($3, ingredient_cost)
          WHERE ingredient_id = $4 AND recipe_id = $5
          RETURNING *;
        `
        const values = [amount, unit, calculatedCost, foundLinkedIngredient.ingredient_id, recipe_id]
        const { rows } = await db.query(query, values)

        if (rows.length === 0) {
          return res.status(404).send('No ingredient found!')
        }
        res.status(200).json(rows[0])
      } catch (err) {
        console.error(err)
        res.status(500).send('Failed updating the linked ingredient!')
      }
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed updating the linked ingredient!')
  }
}

const updateLinkedIngredientCost = async (req, res) => {
  try {
    // could get cost_per_kg from ingredients here, if we do calculation in backend
    const { recipe_id, ingredient_id } = req.params
    const { ingredient_cost } = req.body

    if (!ingredient_cost) {
      return res.status(400).send('Required variables missing!')
    }

    const query = `
      UPDATE recipes_ingredients
      SET ingredient_cost = COALESCE($1, ingredient_cost)
      WHERE recipe_id = $2 AND ingredient_id = $3
      RETURNING *;
    `
    const { rows } = await db.query(query, [ingredient_cost, recipe_id, ingredient_id])

    if (rows.length === 0) {
      return res.status(404).send('No ingredient found!')
    }
    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed updating the cost of a linked ingredient!')
  }
}

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
  getLinkedIngredientCostPerKg,
  getOneLinkedIngredientByRecipe,
  getRecipesByIngredient,
  addLinkedIngredient,
  updateLinkedIngredient,
  updateLinkedIngredientCost,
  deleteLinkedIngredientFromRecipe
}