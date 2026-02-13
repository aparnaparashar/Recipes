import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Users,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IngredientList } from "@/components/ui/IngredientList";

const Recipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSmartKitchenMode, setIsSmartKitchenMode] = useState(false);

  useEffect(() => {
    if (id === "generated") {
      const stored = sessionStorage.getItem("generatedRecipe");

      if (!stored) {
        navigate("/dashboard");
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        setRecipe(parsed);
      } catch (err) {
        console.error("Failed to parse recipe:", err);
        navigate("/dashboard");
      }
    }

    setLoading(false);
  }, [id, navigate]);

  if (loading || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* Back */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-3">
            {recipe.title}
          </h1>

          <p className="text-muted-foreground mb-6">
            {recipe.description}
          </p>

          {/* Meta Info */}
          <div className="flex gap-6 mb-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {recipe.totalTime} mins
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {recipe.servings} servings
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">

            {/* Ingredients */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4">
                  Ingredients
                </h2>

                <IngredientList
                  ingredients={recipe.ingredients || []}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-6">
                  Instructions
                </h2>

                <div className="space-y-4">
                  {recipe.steps?.map(
                    (step: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4"
                      >
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {step.number}
                        </span>

                        <p>{step.text}</p>
                      </motion.div>
                    )
                  )}
                </div>
              </div>

              {/* Start Cooking Button */}
              <div className="mt-6">
                <Button
                  onClick={() =>
                    setIsSmartKitchenMode(true)
                  }
                  className="btn-hero"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Cooking
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Recipe;
