const ROUTES = {
  meals: "/meals",
  products: "/products",
  foodlog: "/foodlog",
};

let currentRoute = null;
let routeListener = null;

const normalizePath = (path) => {
  const cleanPath = String(path || "/").split("?")[0].split("#")[0];

  if (cleanPath === "/") {
    return "/meals";
  }

  const normalized = cleanPath.replace(/\/+$/, "");

  return normalized || "/meals";
};

const getRouteFromPath = (path = window.location.pathname) => {
  const normalizedPath = normalizePath(path);

  if (normalizedPath === "/products") {
    return "products";
  }

  if (normalizedPath === "/foodlog") {
    return "foodlog";
  }

  if (normalizedPath === "/meals") {
    return "meals";
  }

  if (normalizedPath.startsWith("/meals/")) {
    return "meal-details";
  }

  return "meals";
};

const getMealIdFromPath = (path = window.location.pathname) => {
  const normalizedPath = normalizePath(path);

  if (!normalizedPath.startsWith("/meals/")) {
    return null;
  }

  const mealId = normalizedPath.split("/")[2];

  return mealId ? decodeURIComponent(mealId) : null;
};

export const getCurrentRoute = () => {
  return getRouteFromPath();
};

export const getCurrentMealId = () => {
  return getMealIdFromPath();
};

export const navigate = (path, options = {}) => {
  const normalizedPath = normalizePath(path);
  const { replace = false } = options;

  if (window.location.pathname === normalizedPath) {
    notifyRouteChange();
    return;
  }

  if (replace) {
    window.history.replaceState({}, "", normalizedPath);
  } else {
    window.history.pushState({}, "", normalizedPath);
  }

  notifyRouteChange();
};

export const navigateTo = (route, options = {}) => {
  const path = ROUTES[route] || ROUTES.meals;
  navigate(path, options);
};

export const navigateToMeal = (mealId, options = {}) => {
  if (!mealId) {
    navigateTo("meals", options);
    return;
  }

  navigate(`/meals/${encodeURIComponent(mealId)}`, options);
};

const notifyRouteChange = () => {
  const route = getRouteFromPath();
  const mealId = getMealIdFromPath();

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

  window.addEventListener("popstate", notifyRouteChange);

  notifyRouteChange();
};

export const getRoutes = () => ({
  ...ROUTES,
});

export const initRouter = () => {
  const path = normalizePath(window.location.pathname);

  if (window.location.pathname !== path) {
    window.history.replaceState({}, "", path);
  }

  notifyRouteChange();
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