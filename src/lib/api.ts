const API_BASE_URL = "http://localhost:5001/api";

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  let data;
  
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(data?.message || data || "Request failed");
  }

  return data;
};

export const authAPI = {
  register: async (firstName: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, email, password }),
      });

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Network error - is the server running on port 5001?");
      }
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Network error - is the server running on port 5001?");
      }
      throw error;
    }
  },

  getMe: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Network error - is the server running on port 5001?");
      }
      throw error;
    }
  },
};

export const dashboardAPI = {
  getDashboard: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Network error - is the server running on port 5001?");
      }
      throw error;
    }
  },

  updateDashboard: async (
    token: string,
    data: {
      dietaryConstraints?: string[];
      allergies?: string[];
      availableIngredients?: string[];
      favoriteCuisines?: string[];
    }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Network error - is the server running on port 5001?");
      }
      throw error;
    }
  },

  addDishToHistory: async (
    token: string,
    title: string,
    ingredients: string[]
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, ingredients }),
      });

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Network error - is the server running on port 5001?");
      }
      throw error;
    }
  },
};

export const recipeAPI = {
  generateRecipe: async (
    token: string,
    dishName: string,
    dietaryConstraints: string[] = [],
    allergies: string[] = [],
    availableIngredients: string[] = []
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipe/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dishName,
          dietaryConstraints,
          allergies,
          availableIngredients,
        }),
      });

      return await handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Network error - is the server running on port 5001?");
      }
      throw error;
    }
  },
};
