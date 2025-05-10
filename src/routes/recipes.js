const express = require('express')
const router = express.Router()
const recipeService = require('../services/recipes')

router.get('/', recipeService.getAll)

router.get('/users/:user_id', recipeService.getAllByUser)

router.post('/users/:user_id', recipeService.create)

router.get('/users/:user_id/entry/:id', recipeService.getById)

router.put('/users/:user_id/entry/:id', recipeService.updateById)

router.delete('/users/:user_id/entry/:id', recipeService.deleteById)

module.exports = router