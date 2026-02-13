import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RegionCard } from "@/components/ui/RegionCard";
import { TagChip } from "@/components/ui/TagChip";
import { ProcessingLoader } from "@/components/ui/ProcessingLoader";
import { regions } from "@/lib/mockData";
import { useUserProfile } from "@/lib/UserProfileContext";
import { dashboardAPI, recipeAPI } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, addHistoryEntry } = useUserProfile();
  const [dishName, setDishName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardAPI.getDashboard(token);
        const dashboard = data.dashboard;

        // Populate form with existing data
        setSelectedConstraints(dashboard.dietaryConstraints || []);
        setAllergies(dashboard.allergies || []);
        setAvailableIngredients(dashboard.availableIngredients || []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [token, navigate]);

  const saveDashboard = async () => {
    if (!token) return;

    try {
      setIsSaving(true);
      setError(null);
      await dashboardAPI.updateDashboard(token, {
        dietaryConstraints: selectedConstraints,
        allergies,
        availableIngredients,
      });
    } catch (err) {
      console.error("Failed to save dashboard:", err);
      setError(err instanceof Error ? err.message : "Failed to save dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  const addConstraint = () => {
    const value = constraintInput.trim();
    if (value && !selectedConstraints.includes(value)) {
      const updatedConstraints = [...selectedConstraints, value];
      setSelectedConstraints(updatedConstraints);
    }
    setConstraintInput("");
  };

  const removeConstraint = (value: string) => {
    setSelectedConstraints((prev) => prev.filter((c) => c !== value));
  };

  const addAllergy = () => {
    const value = allergyInput.trim();
    if (value && !allergies.includes(value)) {
      const updatedAllergies = [...allergies, value];
      setAllergies(updatedAllergies);
    }
    setAllergyInput("");
  };

  const removeAllergy = (value: string) => {
    setAllergies((prev) => prev.filter((a) => a !== value));
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !availableIngredients.includes(ingredientInput.trim())) {
      setAvailableIngredients((prev) => [...prev, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setAvailableIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleRegenerate = async () => {
    if (!dishName.trim() || !token) return;

    try {
      setIsSaving(true);
      setError(null);
      setIsProcessing(true);

      // Save current preferences first
      await saveDashboard();

      // Call recipe generation API
      const recipeResponse = await recipeAPI.generateRecipe(
        token,
        dishName.trim(),
        selectedConstraints,
        allergies,
        availableIngredients
      );

      const generatedRecipe = recipeResponse.recipe;
      console.log("✓ Recipe generated:", generatedRecipe.title);

      // Save recipe to dashboard history
      await dashboardAPI.addDishToHistory(
        token,
        generatedRecipe.title,
        generatedRecipe.ingredients.map((ing: { name: string }) => ing.name)
      );

      // Store recipe in sessionStorage for Recipe page to display
      sessionStorage.setItem("generatedRecipe", JSON.stringify(generatedRecipe));

      // Add to history
      addHistoryEntry({
        dishName: generatedRecipe.title,
        constraints: selectedConstraints,
        allergies,
        regionId: selectedRegion,
      });

      // Navigate to recipe page
      navigate("/recipe/generated");
    } catch (err) {
      console.error("Failed to generate recipe:", err);
      setError(err instanceof Error ? err.message : "Failed to generate recipe");
      setIsProcessing(false);
      setIsSaving(false);
    }
  };

  const handleProcessingComplete = () => {
    // Recipe page will load the recipe from sessionStorage
    // No need to do anything here as we already navigated
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header />
        <div className="text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {isProcessing && <ProcessingLoader onComplete={handleProcessingComplete} />}

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold mb-3">
              Smart Kitchen Input
            </h1>
            <p className="text-muted-foreground">
              Tell us what you want to cook, and we'll regenerate it for your needs.
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Dish Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <label className="block text-sm font-semibold mb-2">What dish would you like to cook?</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g., Butter Chicken, Paneer Tikka, Dal Makhani..."
                className="pl-12 h-14 text-lg rounded-full border-border/60"
              />
            </div>
          </motion.div>

          {/* Region Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-6"
          >
            <label className="block text-sm font-semibold mb-4">Select Cuisine Region</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {regions.map((region, index) => (
                <RegionCard
                  key={region.id}
                  region={region}
                  selected={selectedRegion === region.id}
                  onSelect={setSelectedRegion}
                  index={index}
                />
              ))}
            </div>
          </motion.div>

          {/* Dietary Constraints & Allergies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mb-6"
          >
            <label className="block text-sm font-semibold mb-2">
              Dietary Constraints
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Type anything that matters to you – e.g., Vegan, Jain, Keto, low
              FODMAP, high protein.
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={constraintInput}
                onChange={(e) => setConstraintInput(e.target.value)}
                placeholder="e.g., Vegan, Jain, Keto..."
                className="flex-1 rounded-full"
                onKeyDown={(e) => e.key === "Enter" && addConstraint()}
              />
              <Button
                onClick={addConstraint}
                variant="outline"
                className="rounded-full px-6"
              >
                Add
              </Button>
            </div>
            {selectedConstraints.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedConstraints.map((value) => (
                  <TagChip
                    key={value}
                    label={value}
                    active
                    onToggle={() => removeConstraint(value)}
                  />
                ))}
              </div>
            )}

            <label className="block text-sm font-semibold mb-2 mt-4">
              Allergies (Optional)
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              List ingredients you must avoid – e.g., peanuts, shellfish,
              lactose.
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder="e.g., Peanuts, gluten..."
                className="flex-1 rounded-full"
                onKeyDown={(e) => e.key === "Enter" && addAllergy()}
              />
              <Button
                onClick={addAllergy}
                variant="outline"
                className="rounded-full px-6"
              >
                Add
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allergies.map((value) => (
                  <TagChip
                    key={value}
                    label={value}
                    active
                    onToggle={() => removeAllergy(value)}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Available Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 mb-8"
          >
            <label className="block text-sm font-semibold mb-2">
              Available Ingredients (Optional)
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              Add ingredients you have on hand for smarter substitutions.
            </p>
            <div className="flex gap-2 mb-4">
              <Input
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="e.g., Cashews, Coconut milk..."
                className="flex-1 rounded-full"
                onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              />
              <Button onClick={addIngredient} variant="outline" className="rounded-full px-6">
                Add
              </Button>
            </div>
            {availableIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableIngredients.map((ingredient) => (
                  <motion.span
                    key={ingredient}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-sm font-medium"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Regenerate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleRegenerate}
                disabled={!dishName.trim() || isProcessing || isSaving}
                className="w-full btn-hero text-lg py-7 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {isSaving ? "Saving..." : "Regenerate Recipe"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
