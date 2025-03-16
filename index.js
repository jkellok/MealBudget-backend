const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

const pantryRouter = require('./src/routes/ingredients')

app.use(cors())
app.use(express.json())

app.use('/api/pantry', pantryRouter)

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})