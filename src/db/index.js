const { Pool } = require('pg')

// environment variables PGUSER, PGPASSWORD, PGHOST, PGDATABASE, PGPORT in .env
const pool = new Pool()

const createIngredients = `
CREATE TABLE IF NOT EXISTS ingredients (
  ingredient_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(6, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  price_per_kg NUMERIC(6, 2) NOT NULL,
  expiration_date DATE
);
`

const createRecipes = `
CREATE TABLE IF NOT EXISTS recipes (
  recipe_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  servings SMALLINT NOT NULL,
  ingredients JSONB [] NOT NULL,
  instructions TEXT [] NOT NULL,
  recipe_price NUMERIC(6, 2),
  price_per_serving NUMERIC(6, 2)
);
`

const createRecipesIngredients = `
CREATE TABLE IF NOT EXISTS recipes_ingredients (
  recipe_id INT REFERENCES recipes (recipe_id) ON UPDATE CASCADE ON DELETE CASCADE,
  ingredient_id INT REFERENCES ingredients (ingredient_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT recipe_ingredient_pkey PRIMARY KEY (recipe_id, ingredient_id),
  amount_for_recipe NUMERIC(6, 2) NOT NULL,
  unit_for_recipe VARCHAR(50) NOT NULL,
  price_per_kg_for_recipe NUMERIC(6, 2) NOT NULL
);
`

// dates are DATE -> e.g. 2017-05-29 in psql, will become js Date object in js
// for timestamp should use TIMESTAMPZ

const setup = async () => {
  try {
    await pool.query(createIngredients)
    await pool.query(createRecipes)
    await pool.query(createRecipesIngredients)
    console.log('Database setup is done.')
  } catch (err) {
    console.error(err)
  }
}

const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', { text, duration, rows: res.rowCount })
  return res
}

module.exports = { setup, query }