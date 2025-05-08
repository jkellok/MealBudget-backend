const express = require('express')
const router = express.Router()
const linkedIngredientService = require('../services/linked_ingredients')

router.get('/', linkedIngredientService.getAll)

router.get('/:recipe_id', linkedIngredientService.getLinkedIngredientsByRecipe)

// change these?
router.get('/:recipe_id/ingredient/:ingredient_id', linkedIngredientService.getLinkedIngredientCostPerKg)

router.get('/:recipe_id/ingredient/:ingredient_id', linkedIngredientService.getOneLinkedIngredientByRecipe)

router.get('/ingredient/:ingredient_id', linkedIngredientService.getRecipesByIngredient)

router.post('/:recipe_id', linkedIngredientService.addLinkedIngredient)

router.put('/:recipe_id/', linkedIngredientService.updateLinkedIngredient)

router.put('/:recipe_id/ingredient/:ingredient_id', linkedIngredientService.updateLinkedIngredientCost)

router.delete('/:recipe_id/ingredient/:ingredient_id', linkedIngredientService.deleteLinkedIngredientFromRecipe)

module.exports = router