const express = require("express");
const router = express.Router();
const Dashboard = require("../models/Dashboard");
const authMiddleware = require("../middleware/authmiddleware");

// GET /api/dashboard - Get dashboard for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("GET /dashboard for user:", req.userId);

    let dashboard = await Dashboard.findOne({ user: req.userId });

    if (!dashboard) {
      console.log("Creating new dashboard for user:", req.userId);
      dashboard = await Dashboard.create({ user: req.userId });
    }

    res.status(200).json({
      message: "Dashboard retrieved successfully",
      dashboard,
    });
  } catch (error) {
    console.error("✗ Get dashboard error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// POST /api/dashboard - Create dashboard if not exists
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("POST /dashboard for user:", req.userId);

    // Check if dashboard already exists
    let dashboard = await Dashboard.findOne({ user: req.userId });

    if (dashboard) {
      return res.status(400).json({ message: "Dashboard already exists" });
    }

    // Create new dashboard
    dashboard = await Dashboard.create({ user: req.userId });

    console.log("✓ Dashboard created:", dashboard._id);

    res.status(201).json({
      message: "Dashboard created successfully",
      dashboard,
    });
  } catch (error) {
    console.error("✗ Create dashboard error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// PUT /api/dashboard - Update dashboard data
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { dietaryConstraints, allergies, availableIngredients, favoriteCuisines } = req.body;
    
    console.log("PUT /dashboard for user:", req.userId, {
      dietaryConstraints: dietaryConstraints?.length,
      allergies: allergies?.length,
      availableIngredients: availableIngredients?.length,
      favoriteCuisines: favoriteCuisines?.length,
    });

    // Find and update dashboard
    const dashboard = await Dashboard.findOneAndUpdate(
      { user: req.userId },
      {
        ...(dietaryConstraints !== undefined && { dietaryConstraints }),
        ...(allergies !== undefined && { allergies }),
        ...(availableIngredients !== undefined && { availableIngredients }),
        ...(favoriteCuisines !== undefined && { favoriteCuisines }),
      },
      { new: true, upsert: true }
    );

    console.log("✓ Dashboard updated");

    res.status(200).json({
      message: "Dashboard updated successfully",
      dashboard,
    });
  } catch (error) {
    console.error("✗ Update dashboard error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// POST /api/dashboard/history - Add new generated dish
router.post("/history", authMiddleware, async (req, res) => {
  try {
    const { title, ingredients } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Please provide dish title" });
    }

    console.log("POST /dashboard/history for user:", req.userId, { title });

    // Find dashboard and add to history
    const dashboard = await Dashboard.findOneAndUpdate(
      { user: req.userId },
      {
        $push: {
          dishHistory: {
            title,
            ingredients: ingredients || [],
            createdAt: new Date(),
          },
        },
        $inc: { totalDishes: 1 },
      },
      { new: true, upsert: true }
    );

    console.log("✓ Dish added to history. Total dishes:", dashboard.totalDishes);

    res.status(201).json({
      message: "Dish added to history successfully",
      dashboard,
    });
  } catch (error) {
    console.error("✗ Add history error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;
