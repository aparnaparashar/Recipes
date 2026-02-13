const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✓ MongoDB Connected"))
  .catch((err) => {
    console.error("Mongo Error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/recipe", require("./routes/recipe"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server running" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () =>
  console.log(`✓ Server running on port ${PORT}`)
);
