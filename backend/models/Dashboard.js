const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dietaryConstraints: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    availableIngredients: {
      type: [String],
      default: [],
    },
    dishHistory: [
      {
        title: String,
        ingredients: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    favoriteCuisines: {
      type: [String],
      default: [],
    },
    totalDishes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dashboard", dashboardSchema);
