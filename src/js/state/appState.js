const FOOD_LOG_KEY = "nutriplan_food_log";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const loadFoodLog = () => {
  try {
    const saved = localStorage.getItem(FOOD_LOG_KEY);

    if (!saved) return [];

    const foodLog = JSON.parse(saved);

    return Array.isArray(foodLog) ? foodLog : [];
  } catch {
    return [];
  }
};

const saveFoodLog = () => {
  try {
    localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(state.foodLog));
  } catch {}
}

export const state = {
  meals: [],
  categories: [],
  areas: [],

  selectedMeal: null,
  selectedMealNutrition: {},

  selectedCategory: "",
  selectedArea: "",
  searchQuery: "",

  products: [],
  productPool: [],
  productCategories: [],
  selectedProduct: null,
  productSearchQuery: "",
  selectedProductCategory: "",
  selectedNutriScore: "",

  productPage: 1,
  productLimit: 24,
  productTotal: 0,
  productTotalPages: 0,

  currentPage: "meals",

  foodLog: loadFoodLog(),

  isLoading: false,
  error: null,
};

export const setMeals = (meals) => {
  state.meals = Array.isArray(meals) ? meals : [];
};

export const setCategories = (categories) => {
  state.categories = Array.isArray(categories) ? categories : [];
};

export const setAreas = (areas) => {
  state.areas = Array.isArray(areas) ? areas : [];
};

export const setSelectedMeal = (meal) => {
  state.selectedMeal = meal || null;
};

export const setSelectedMealNutrition = (nutrition) => {
  state.selectedMealNutrition =
    nutrition && typeof nutrition === "object" ? nutrition : {};
};

export const setSelectedCategory = (category) => {
  state.selectedCategory = typeof category === "string" ? category : "";
};

export const setSelectedArea = (area) => {
  state.selectedArea = typeof area === "string" ? area : "";
};

export const setSearchQuery = (query) => {
  state.searchQuery = typeof query === "string" ? query : "";
};

export const setProducts = (products) => {
  state.products = Array.isArray(products) ? products : [];
};

export const setProductPool = (products) => {
  state.productPool = Array.isArray(products) ? products : [];
};

export const setProductCategories = (categories) => {
  state.productCategories = Array.isArray(categories) ? categories : [];
};

export const setSelectedProduct = (product) => {
  state.selectedProduct = product || null;
};

export const setProductSearchQuery = (query) => {
  state.productSearchQuery = typeof query === "string" ? query : "";
};

export const setSelectedProductCategory = (category) => {
  state.selectedProductCategory = typeof category === "string" ? category : "";
};

export const setSelectedNutriScore = (grade) => {
  state.selectedNutriScore = typeof grade === "string" ? grade : "";
};

export const setProductPagination = ({
  page = 1,
  limit = 24,
  total = 0,
  totalPages = 0,
} = {}) => {
  state.productPage = Number(page) || 1;
  state.productLimit = Number(limit) || 24;
  state.productTotal = Number(total) || 0;
  state.productTotalPages = Number(totalPages) || 0;
};

export const setCurrentPage = (page) => {
  state.currentPage = typeof page === "string" && page ? page : "meals";
};

export const setLoading = (loading) => {
  state.isLoading = Boolean(loading);
};

export const setError = (error) => {
  state.error = error || null;
};

export const setFoodLog = (foodLog) => {
  state.foodLog = Array.isArray(foodLog) ? foodLog : [];
  saveFoodLog();
};

export const addToFoodLog = (item) => {
  if (!item || typeof item !== "object") return;

  const newItem = {
    ...item,
    id:
      item.id ||
      `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: item.date || getToday(),
  };

  state.foodLog.push(newItem);
  saveFoodLog();
};

export const removeFromFoodLog = (id) => {
  if (!id) return;

  state.foodLog = state.foodLog.filter((item) => item.id !== id);
  saveFoodLog();
};

export const clearFoodLog = () => {
  state.foodLog = [];
  saveFoodLog();
};