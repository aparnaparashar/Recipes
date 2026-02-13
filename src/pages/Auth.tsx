import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/lib/UserProfileContext";
import { authAPI } from "@/lib/api";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useUserProfile();

  const from =
    (location.state as { from?: string } | null)?.from || "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;

      if (mode === "signup") {
        if (!firstName.trim()) {
          throw new Error("First name is required");
        }
        response = await authAPI.register(firstName, email, password);
      } else {
        response = await authAPI.login(email, password);
      }

      // Store token and user data
      setToken(response.token);
      setUser({
        id: response.user.id,
        firstName: response.user.firstName,
        email: response.user.email,
      });

      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-heading font-extrabold mb-2">
              {mode === "signup" ? "Create your RasSetu profile" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              Save your dietary profile, allergies, and favorite dishes.
            </p>
          </motion.div>

          <Card className="glass-card p-6">
            <div className="flex mb-6 rounded-full bg-muted overflow-hidden">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                  mode === "signup"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                  mode === "login"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Log in
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    First name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g., Ananya"
                    required={mode === "signup"}
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-hero mt-2"
                disabled={loading}
              >
                {loading
                  ? mode === "signup"
                    ? "Creating account..."
                    : "Signing in..."
                  : mode === "signup"
                    ? "Create account"
                    : "Continue"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Secure authentication with your MongoDB account.
              </p>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Just want to cook?{" "}
              <Link to="/dashboard" className="underline font-medium">
                Go to Smart Kitchen
              </Link>
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;

