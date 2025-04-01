const express = require('express')
const router = express.Router()
const recipeService = require('../services/recipes')

router.get('/', recipeService.getAll)

router.post('/', recipeService.create)

router.get('/:id', recipeService.getById)

router.put('/:id', recipeService.updateById)

router.delete('/:id', recipeService.deleteById)

module.exports = router