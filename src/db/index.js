const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
})

// id: uuid, numeric values more specific?
const createIngredients = `
CREATE TABLE IF NOT EXISTS ingredients (
  "id" serial primary key,
  "name" varchar(100) not null,
  "amount" numeric not null,
  "unit" varchar(50) not null,
  "price_per_kg" numeric not null
);
`

const setup = async () => {
  try {
    await pool.query(createIngredients)
    console.log('Database setup is done.')
  } catch (err) {
    console.error(err)
  }
}

setup()

const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', { text, duration, rows: res.rowCount })
  return res
}

module.exports = { query }