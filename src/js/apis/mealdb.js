const baseURL = "https://nutriplan-api.vercel.app/api";

const getErrorMessage = async (res, fallback) => {
  try {
    const data = await res.json();
    return data?.error?.message || data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
};

const getJsonResponse = async (res, label, isValid = () => true) => {
  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }

  if ((data === null || typeof data !== "object") || !isValid(data)) {
    throw new Error(`${label} returned an unexpected response shape`);
  }

  return data;
};

const isIngredient = (ingredient) =>
  ingredient &&
  typeof ingredient === "object" &&
  typeof ingredient.ingredient === "string" &&
  typeof ingredient.measure === "string";

const isMeal = (meal) =>
  meal &&
  typeof meal === "object" &&
  typeof meal.id === "string" &&
  typeof meal.name === "string" &&
  typeof meal.category === "string" &&
  (typeof meal.area === "string" || meal.area === null) &&
  typeof meal.thumbnail === "string" &&
  Array.isArray(meal.instructions) &&
  meal.instructions.every((instruction) => typeof instruction === "string") &&
  Array.isArray(meal.ingredients) &&
  meal.ingredients.every(isIngredient);

const isMealList = (data) =>
  Array.isArray(data?.results) && data.results.every(isMeal);

const isProduct = (product) =>
  product &&
  typeof product === "object" &&
  typeof product.barcode === "string" &&
  typeof product.name === "string" &&
  typeof product.nutritionGrade === "string" &&
  product.nutrients &&
  typeof product.nutrients === "object";

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

  return await getJsonResponse(res, "Meal search", isMealList);
};

export const getCategories = async () => {
  const res = await fetch(`${baseURL}/meals/categories`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get categories: ${res.status}`)
    );
  }

  return await getJsonResponse(res, "Meal categories", (data) =>
    Array.isArray(data?.results) &&
    data.results.every(
      (category) =>
        category &&
        typeof category.id === "string" &&
        typeof category.name === "string" &&
        typeof category.thumbnail === "string"
    )
  );
};

export const getAreas = async () => {
  const res = await fetch(`${baseURL}/meals/areas`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get areas: ${res.status}`)
    );
  }

  return await getJsonResponse(res, "Meal areas", (data) =>
    Array.isArray(data?.results) &&
    data.results.every(
      (area) => area && typeof area.name === "string"
    )
  );
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

  return await getJsonResponse(res, "Meal details", (data) =>
    isMeal(data?.result)
  );
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

  return await getJsonResponse(res, "Meal filter", isMealList);
};

export const getRandomMeals = async (count = 1) => {
  const params = new URLSearchParams({ count });

  const res = await fetch(`${baseURL}/meals/random?${params.toString()}`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to get random meal: ${res.status}`)
    );
  }

  return await getJsonResponse(res, "Random meals", isMealList);
};

export const analyzeNutrition = async (recipeData) => {
  if (
    !recipeData ||
    typeof recipeData.recipeName !== "string" ||
    !Array.isArray(recipeData.ingredients) ||
    !recipeData.ingredients.every((ingredient) => typeof ingredient === "string")
  ) {
    throw new Error("Recipe data is required");
  }

  const nutritionApiKey = window.NUTRIPLAN_NUTRITION_API_KEY;

  if (!nutritionApiKey) {
    throw new Error(
      "Nutrition analysis is not configured. Set NUTRIPLAN_NUTRITION_API_KEY in the application environment."
    );
  }

  const res = await fetch(`${baseURL}/nutrition/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": nutritionApiKey,
    },
    body: JSON.stringify(recipeData),
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to analyze nutrition: ${res.status}`)
    );
  }

  return await getJsonResponse(
    res,
    "Nutrition analysis",
    (data) => data?.success === true && data?.data?.perServing
  );
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

  return await getJsonResponse(res, "Product categories", (data) =>
    Array.isArray(data?.results) &&
    data.results.every(
      (category) =>
        category &&
        typeof category.id === "string" &&
        typeof category.name === "string"
    )
  );
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

  return await getJsonResponse(res, "Category products", (data) =>
    Array.isArray(data?.results) && data.results.every(isProduct)
  );
};

export const searchProducts = async (query = "") => {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    throw new Error("Product search query is required");
  }

  const params = new URLSearchParams({ q: cleanQuery });

  const res = await fetch(`${baseURL}/products/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, `Failed to search products: ${res.status}`)
    );
  }

  return await getJsonResponse(res, "Product search", (data) =>
    Array.isArray(data?.results) && data.results.every(isProduct)
  );
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

  return await getJsonResponse(res, "Barcode product", (data) =>
    isProduct(data?.result)
  );
};