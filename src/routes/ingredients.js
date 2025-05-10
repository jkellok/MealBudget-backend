const express = require('express')
const router = express.Router()
const ingredientService = require('../services/ingredients')

router.get('/', ingredientService.getAll)

router.get('/users/:user_id', ingredientService.getAllByUser)

router.post('/users/:user_id', ingredientService.create)

router.get('/users/:user_id/ingredient/:id', ingredientService.getById)

router.put('/users/:user_id/ingredient/:id', ingredientService.updateById)

router.delete('/users/:user_id/ingredient/:id', ingredientService.deleteById)

module.exports = router