const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com/recipes";

// POST /api/recipe/generate
router.post("/generate", async (req, res) => {
  try {
    const { dishName } = req.body;

    if (!dishName || !dishName.trim()) {
      return res.status(400).json({
        message: "Please provide a dish name",
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        message: "SPOONACULAR_API_KEY not found in .env",
      });
    }

    // 🔎 STEP 1: Search Recipe
    const searchUrl = `${BASE_URL}/complexSearch?query=${dishName}&number=1&apiKey=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.status(404).json({
        message: `No recipes found for "${dishName}"`,
      });
    }

    const recipeId = searchData.results[0].id;

    // 📖 STEP 2: Get Full Details
    const detailUrl = `${BASE_URL}/${recipeId}/information?apiKey=${API_KEY}`;
    const detailResponse = await fetch(detailUrl);
    const recipeDetail = await detailResponse.json();

    const formattedRecipe = {
      id: recipeDetail.id,
      title: recipeDetail.title,
      cuisine: recipeDetail.cuisines?.[0] || "International",
      servings: recipeDetail.servings || 4,
      totalTime: recipeDetail.readyInMinutes || 45,
      description:
        recipeDetail.summary?.replace(/<[^>]*>/g, "") ||
        "Delicious recipe",
      ingredients:
        recipeDetail.extendedIngredients?.map((ing) => ({
          name: ing.original,
        })) || [],
      steps:
        recipeDetail.analyzedInstructions?.[0]?.steps?.map((step) => ({
          number: step.number,
          text: step.step,
        })) || [],
    };

    return res.status(200).json({
      message: "Recipe generated successfully",
      recipe: formattedRecipe,
    });

  } catch (error) {
    console.error("Recipe Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch recipe from Spoonacular",
    });
  }
});

module.exports = router;
