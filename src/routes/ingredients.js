const express = require('express')
const router = express.Router()
const ingredientService = require('../services/ingredients')

router.get('/', ingredientService.getAll)

router.post('/', ingredientService.create)

router.get('/:id', ingredientService.getById)

router.put('/:id', ingredientService.updateById)

router.delete('/:id', ingredientService.deleteById)

module.exports = router