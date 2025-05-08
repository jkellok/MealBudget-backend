const { Pool } = require('pg')

// environment variables PGUSER, PGPASSWORD, PGHOST, PGDATABASE, PGPORT in .env
const pool = new Pool()

const createIngredients = `
CREATE TABLE IF NOT EXISTS ingredients (
  ingredient_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(6, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost_per_kg NUMERIC(6, 2) NOT NULL,
  cost_per_unit NUMERIC(6, 2),
  expiration_date DATE,
  buy_date DATE DEFAULT CURRENT_DATE,
  aisle VARCHAR(50),
  brand VARCHAR(100),
  store VARCHAR(100),
  on_sale BOOLEAN DEFAULT false,
  in_pantry BOOLEAN DEFAULT true
);
`
// unit cost, if we use pcs in recipes then could calculate cost maybe if user can define how many pieces bought
// e.g. 1 carton of eggs, 580g, has 10 eggs, cost 2.15€, so each egg weights 58g -> 0.058kg, 3,71€/kg -> 0.058 * 3.71 = 0.22€
// or 2.15€ / 10 = 0.22€
// we can also assume that if ingredient is eggs, they usually weigh about 60g
// columns with DEFAULT could also have NOT NULL, though passing DEFAULT into query requires some extra code

const createRecipes = `
CREATE TABLE IF NOT EXISTS recipes (
  recipe_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  servings SMALLINT NOT NULL,
  ingredients JSONB [] NOT NULL,
  instructions TEXT [] NOT NULL,
  cost_per_serving NUMERIC(6, 2) GENERATED ALWAYS AS (total_cost / servings) STORED,
  total_cost NUMERIC(6, 2),
  category VARCHAR(100),
  tags TEXT [],
  difficulty VARCHAR(20),
  rating SMALLINT,
  minutes_to_make INTEGER,
  notes TEXT,
  image TEXT,
  is_favorite BOOLEAN DEFAULT FALSE
);
`
// minutes to make, could also break down in active and passive time
// nutrition, based on ingredients?
// columns for dietary restrictions? vegan: true, gluten_free: false, etc.

const createRecipesIngredients = `
CREATE TABLE IF NOT EXISTS recipes_ingredients (
  recipe_id INT REFERENCES recipes (recipe_id) ON UPDATE CASCADE ON DELETE CASCADE,
  ingredient_id INT REFERENCES ingredients (ingredient_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT recipe_ingredient_pkey PRIMARY KEY (recipe_id, ingredient_id),
  ingredient_amount NUMERIC(6, 2) NOT NULL,
  ingredient_unit VARCHAR(20) NOT NULL,
  ingredient_cost NUMERIC(6, 2)
);
`

// based on ingredient name?
// old ingredients might be deleted or they are updated
// cost changes or new ingredients should add a new row
const createPriceHistory = `
CREATE TABLE IF NOT EXISTS price_history (
  price_history_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ingredient_id INT REFERENCES ingredients (ingredient_id),
  ingredient_name VARCHAR(100) NOT NULL,
  buy_date DATE DEFAULT CURRENT_DATE,
  cost_per_kg NUMERIC(6, 2) NOT NULL
);
`

// nutrition table? calories, fat, carbohydrates, protein, etc.
// grocery list table, id, item
// meal plan table
// user table and user id to all

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