const express = require('express')
const cors = require('cors')
require('dotenv').config()
const db = require('./db/index')
const middleware = require('./utils/middleware')

db.setup()

const app = express()

const pantryRouter = require('./routes/ingredients')
const recipesRouter = require('./routes/recipes')
const linkedIngredientsRouter = require('./routes/linked_ingredients')

app.use(cors())
app.use(express.json())

app.use('/api/pantry', pantryRouter)
app.use('/api/recipes', recipesRouter)
app.use('/api/linked_ingredients', linkedIngredientsRouter)

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.use(middleware.errorHandler)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})