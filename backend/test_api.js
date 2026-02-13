const fetch = require('node-fetch');

async function test() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGYyZDY0Y2ZlYWQwNWI1M2NlYjA1ZSIsImlhdCI6MTc3MDk5MDk0OCwiZXhwIjoxNzcxNTk1NzQ4fQ.1h5ElgqLeavQl1g5bFoG50PiQ04m0ZfxCIAqIcPP3Yo';
  
  console.log('Testing recipe generation API...');
  
  const res = await fetch('http://localhost:5001/api/recipe/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      dishName: 'Butter Chicken',
      dietaryConstraints: [],
      allergies: [],
      availableIngredients: []
    })
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Message:', data.message);
  if (data.recipe) {
    console.log('Recipe Title:', data.recipe.title);
    console.log('Ingredients Count:', data.recipe.ingredients.length);
    console.log('First Ingredient:', data.recipe.ingredients[0]);
  } else {
    console.log('Error:', data);
  }
}

test().catch(console.error);
