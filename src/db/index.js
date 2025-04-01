const { Pool } = require('pg')

// environment variables PGUSER, PGPASSWORD, PGHOST, PGDATABASE, PGPORT in .env
const pool = new Pool()

const createIngredients = `
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(6, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  price_per_kg NUMERIC(6, 2) NOT NULL
);
`

const createRecipes = `
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  servings SMALLINT NOT NULL,
  ingredients JSONB [] NOT NULL,
  ingredients_from_pantry JSONB [],
  instructions TEXT [] NOT NULL,
  price NUMERIC(6, 2),
  price_per_serving NUMERIC(6, 2)
);
`
// ingredients_from_pantry could be a text array of ids?
// or separate table for linked ingredients
// relationship table
// e.g. recipe_id | ingredient_id | quantity | price_per_kg
// dates are DATE -> e.g. 2017-05-29 in psql, will become js Date object in js
// for timestamp should use TIMESTAMPZ

const setup = async () => {
  try {
    await pool.query(createIngredients)
    await pool.query(createRecipes)
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