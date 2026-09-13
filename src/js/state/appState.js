const FOOD_LOG_KEY = "jooe_food_log";
const LEGACY_FOOD_LOG_KEY = "nutriplan_food_log";
const CALORIE_TARGET_KEY = "jooe_calorie_target";
const DEFAULT_CALORIE_TARGET = 2000;

const loadCalorieTarget = () => {
  try {
    const target = Number(localStorage.getItem(CALORIE_TARGET_KEY));

    return Number.isFinite(target) && target >= 500 && target <= 10000
      ? Math.round(target)
      : DEFAULT_CALORIE_TARGET;
  } catch {
    return DEFAULT_CALORIE_TARGET;
  }
};

const saveCalorieTarget = (target) => {
  try {
    localStorage.setItem(CALORIE_TARGET_KEY, String(target));
  } catch {}
};

export const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const loadFoodLog = () => {
  try {
    const saved =
      localStorage.getItem(FOOD_LOG_KEY) ||
      localStorage.getItem(LEGACY_FOOD_LOG_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);
    const entries = Array.isArray(parsed)
      ? parsed
      : Object.values(parsed || {}).flatMap((items) =>
          Array.isArray(items) ? items : []
        );

    return entries
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        ...item,
        date: item.date || getToday(),
        loggedAt: item.loggedAt || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
};

const saveFoodLog = () => {
  try {
    const byDate = state.foodLog.reduce((log, item) => {
      const date = item?.date || getToday();

      if (!log[date]) {
        log[date] = [];
      }

      log[date].push(item);
      return log;
    }, {});

    localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(byDate));
  } catch {}
};

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

  currentPage: "home",

  foodLog: loadFoodLog(),
  calorieTarget: loadCalorieTarget(),

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

export const setCalorieTarget = (target) => {
  const numericTarget = Number(target);

  if (!Number.isFinite(numericTarget)) {
    return;
  }

  state.calorieTarget = Math.min(
    10000,
    Math.max(500, Math.round(numericTarget))
  );
  saveCalorieTarget(state.calorieTarget);
};

export const setFoodLog = (foodLog) => {
  state.foodLog = Array.isArray(foodLog)
    ? foodLog
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          ...item,
          date: item.date || getToday(),
          loggedAt: item.loggedAt || new Date().toISOString(),
        }))
    : [];
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
    loggedAt: item.loggedAt || new Date().toISOString(),
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

export const clearTodayFoodLog = () => {
  const today = getToday();

  state.foodLog = state.foodLog.filter((item) => item?.date !== today);
  saveFoodLog();
};