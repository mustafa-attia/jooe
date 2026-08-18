const ROUTES = {
  meals: "meals",
  products: "products",
  foodlog: "foodlog",
};

let currentRoute = null;
let routeListener = null;

const normalizeHash = (hash = window.location.hash) => {
  const clean = String(hash || "")
    .replace(/^#\/?/, "")
    .split("?")[0]
    .split("#")[0];

  if (!clean || clean === "meals") {
    return "/meals";
  }

  if (clean === "products") {
    return "/products";
  }

  if (clean === "foodlog") {
    return "/foodlog";
  }

  if (clean.startsWith("meals/")) {
    return `/${clean}`;
  }

  return "/meals";
};

const getRouteFromHash = () => {
  const normalized = normalizeHash();

  if (normalized === "/products") {
    return "products";
  }

  if (normalized === "/foodlog") {
    return "foodlog";
  }

  if (normalized.startsWith("/meals/")) {
    return "meal-details";
  }

  return "meals";
};

const getMealIdFromHash = () => {
  const normalized = normalizeHash();

  if (!normalized.startsWith("/meals/")) {
    return null;
  }

  const mealId = normalized.slice("/meals/".length);

  if (!mealId) {
    return null;
  }

  try {
    return decodeURIComponent(mealId);
  } catch {
    return null;
  }
};

export const getCurrentRoute = () => {
  return getRouteFromHash();
};

export const getCurrentMealId = () => {
  return getMealIdFromHash();
};

export const navigate = (path, options = {}) => {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const targetHash = `#/${cleanPath}`;

  if (window.location.hash === targetHash) {
    notifyRouteChange();
    return;
  }

  if (options.replace) {
    window.location.replace(targetHash);
  } else {
    window.location.hash = targetHash;
  }
};

export const navigateTo = (route, options = {}) => {
  const target = ROUTES[route] || ROUTES.meals;
  navigate(`/${target}`, options);
};

export const navigateToMeal = (mealId, options = {}) => {
  if (!mealId) {
    navigateTo("meals", options);
    return;
  }

  navigate(`/meals/${encodeURIComponent(mealId)}`, options);
};

const notifyRouteChange = () => {
  const route = getRouteFromHash();
  const mealId = getMealIdFromHash();

  if (
    currentRoute?.route === route &&
    currentRoute?.mealId === mealId
  ) {
    return;
  }

  currentRoute = {
    route,
    mealId,
  };

  if (typeof routeListener === "function") {
    routeListener(route, mealId);
  }
};

export const onRouteChange = (callback) => {
  if (typeof callback !== "function") {
    return;
  }

  routeListener = callback;

  window.addEventListener("hashchange", notifyRouteChange);

  notifyRouteChange();
};

export const getRoutes = () => ({
  ...ROUTES,
});

export const initRouter = () => {
  if (!window.location.hash || window.location.hash === "#") {
    window.location.hash = "#/meals";
  }
  return true;
};

export default {
  navigate,
  navigateTo,
  navigateToMeal,
  getCurrentRoute,
  getCurrentMealId,
  getRoutes,
  onRouteChange,
  initRouter,
};