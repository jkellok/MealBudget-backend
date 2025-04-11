const express = require('express')
const router = express.Router()
const linkedIngredientService = require('../services/linked_ingredients')

router.get('/', linkedIngredientService.getAll)

router.get('/:recipe_id', linkedIngredientService.getLinkedIngredientsByRecipe)

router.get('/:recipe_id/ingredient/:ingredient_id', linkedIngredientService.getOneLinkedIngredientByRecipe)

router.get('/ingredient/:ingredient_id', linkedIngredientService.getRecipesByIngredient)

router.post('/:recipe_id', linkedIngredientService.addLinkedIngredient)

//router.put('/:id', linkedIngredientService.updateById)

router.delete('/:recipe_id/ingredient/:ingredient_id', linkedIngredientService.deleteLinkedIngredientFromRecipe)

module.exports = router