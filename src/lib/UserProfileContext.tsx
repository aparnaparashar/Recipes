import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface HistoryEntry {
  id: string;
  dishName: string;
  createdAt: string;
  constraints: string[];
  allergies: string[];
  regionId: string | null;
}

export interface UserProfile {
  id?: string;
  firstName: string;
  email: string;
  createdAt?: string;
}

interface UserProfileContextValue {
  user: UserProfile | null;
  token: string | null;
  history: HistoryEntry[];
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  addHistoryEntry: (entry: Omit<HistoryEntry, "id" | "createdAt">) => void;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("authToken") || null
  );

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
  };

  const logout = () => {
    setUser(null);
    handleSetToken(null);
    localStorage.removeItem("authUser");
  };

  const addHistoryEntry: UserProfileContextValue["addHistoryEntry"] = (
    entry
  ) => {
    setHistory((prev) => [
      {
        ...entry,
        id: `${Date.now()}-${prev.length + 1}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <UserProfileContext.Provider
      value={{
        user,
        token,
        history,
        setUser,
        setToken: handleSetToken,
        logout,
        addHistoryEntry,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return ctx;
}
