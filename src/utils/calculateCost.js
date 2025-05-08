// calculate ingredient cost in a recipe

// units: kg, g, l, dl, cup, oz, lbs, tbsp, tsp, ...

// could send cost to backend also
// could use some ready-made API for unit conversion

// convert unit to kg and assign amount as kg
// this is just a simple one, not accounting for density differences (yet)
function getAmountInKilograms({ingredient_amount, ingredient_unit}) {
  switch (ingredient_unit) {
  case 'kg':
  case 'l':
    return ingredient_amount
  case 'g':
  case 'ml':
    return ingredient_amount * 0.001
  case 'cl':
    return ingredient_amount * 0.01
  case 'dl':
    return ingredient_amount * 0.1
  case 'tbsp':
    // assume tbsp is 15 ml = 15 g = 0.015 kg
    return ingredient_amount * 0.015
  case 'tsp':
    // assume tps is 5 ml = 5 g = 0.005 kg
    return ingredient_amount * 0.005
  case 'cup':
    // assume cup is 240 ml = 240 g = 0.24 kg (standard is 236.588 ml)
    return ingredient_amount * 0.24
  case 'oz':
    return ingredient_amount * 0.028
  case 'fl oz':
    // assume fl oz is 2 tbsp = 30 ml = 30 g = 0.03 kg
    return ingredient_amount * 0.03
  case 'lbs':
    return ingredient_amount * 0.454
  case 'pcs':
    // TEMPORARY FOR EGGS, CHANGE LATER
    return ingredient_amount * 0.06
  default:
    console.error('Error in calculating ingredient cost!')
  }
}

const calculateIngredientCost = (ingredient) => {
  const amountInKg = getAmountInKilograms(ingredient)
  const calculatedCost = (amountInKg * ingredient.cost_per_kg).toFixed(2)
  return calculatedCost
}

module.exports = { calculateIngredientCost }