const baseURL = "https://nutriplan-api.vercel.app/api";

const NUTRITION_API_KEY = "FZUBNuHaKQ0VuFbfbqBJAc8NX2eQVRNd5ocwtgk1";

const getErrorMessage = async (res, fallback) => {
  try {
    const data = await res.json();
    return data?.error?.message || data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
};

export const searchMeals = async (query = "chicken") => {
  const searchQuery = query.trim() || "chicken";

  const res = await fetch(
    `${baseURL}/meals/search?q=${encodeURIComponent(searchQuery)}`
  );

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to search meals: ${res.status}`)
    );
  }

  return await res.json();
};

export const getCategories = async () => {
  const res = await fetch(`${baseURL}/meals/categories`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get categories: ${res.status}`)
    );
  }

  return await res.json();
};

export const getAreas = async () => {
  const res = await fetch(`${baseURL}/meals/areas`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get areas: ${res.status}`)
    );
  }

  return await res.json();
};

export const getMealById = async (id) => {
  if (!id) {
    throw new Error("Meal ID is required");
  }

  const res = await fetch(`${baseURL}/meals/${encodeURIComponent(id)}`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get meal: ${res.status}`)
    );
  }

  return await res.json();
};

export const filterMeals = async (filters = {}) => {
  const category = filters.category?.trim() || "";
  const area = filters.area?.trim() || "";
  const ingredient = filters.ingredient?.trim() || "";

  if (!category && !area && !ingredient) {
    throw new Error("At least one filter is required");
  }

  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (area) params.set("area", area);
  if (ingredient) params.set("ingredient", ingredient);

  const res = await fetch(`${baseURL}/meals/filter?${params.toString()}`);

  if (res.status === 429) {
    throw new Error(
      "Too many requests. Please wait a few seconds and try again."
    );
  }

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to filter meals: ${res.status}`)
    );
  }

  return await res.json();
};

export const getRandomMeals = async (count = 1) => {
  const params = new URLSearchParams({ count });

  const res = await fetch(`${baseURL}/meals/random?${params.toString()}`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get random meal: ${res.status}`)
    );
  }

  return await res.json();
};

export const analyzeNutrition = async (recipeData) => {
  if (!recipeData) {
    throw new Error("Recipe data is required");
  }

  const res = await fetch(`${baseURL}/nutrition/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": NUTRITION_API_KEY,
    },
    body: JSON.stringify(recipeData),
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to analyze nutrition: ${res.status}`)
    );
  }

  return await res.json();
};

export const getProductCategories = async (page = 1, limit = 50) => {
  const params = new URLSearchParams({ page, limit });

  const res = await fetch(
    `${baseURL}/products/categories?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(
        res,
        `Failed to get product categories: ${res.status}`
      )
    );
  }

  return await res.json();
};

export const getProductsByCategory = async (category, page = 1, limit = 24) => {
  if (!category) {
    throw new Error("Product category is required");
  }

  const params = new URLSearchParams({ page, limit });

  const res = await fetch(
    `${baseURL}/products/category/${encodeURIComponent(
      category
    )}?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get products: ${res.status}`)
    );
  }

  return await res.json();
};

export const searchProducts = async (query = "", page = 1, limit = 24) => {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    throw new Error("Product search query is required");
  }

  const params = new URLSearchParams({ q: cleanQuery, page, limit });

  const res = await fetch(`${baseURL}/products/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to search products: ${res.status}`)
    );
  }

  return await res.json();
};

export const getProductByBarcode = async (barcode) => {
  if (!barcode) {
    throw new Error("Barcode is required");
  }

  const res = await fetch(
    `${baseURL}/products/barcode/${encodeURIComponent(barcode)}`
  );

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get product: ${res.status}`)
    );
  }

  return await res.json();
};