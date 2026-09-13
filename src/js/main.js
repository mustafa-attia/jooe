import * as API from "./apis/mealdb.js";
import * as AppState from "./state/appState.js";
import * as UI from "./ui/components.js";
import { navigate, onRouteChange, initRouter } from "./router.js";

const homeSection = document.getElementById("home-section");
const pageMainTitle = document.getElementById("page-main-title");
const pageMainSubtitle = document.getElementById("page-main-subtitle");
const calorieTargetInput = document.getElementById("calorie-target-input");
const heroCtaMeals = document.getElementById("hero-cta-meals");
const heroCtaProducts = document.getElementById("hero-cta-products");
const heroCtaFoodLog = document.getElementById("hero-cta-foodlog");
const pillarCardMeals = document.getElementById("pillar-card-meals");
const pillarCardProducts = document.getElementById("pillar-card-products");
const pillarCardFoodLog = document.getElementById("pillar-card-foodlog");

const searchInput = document.getElementById("search-input");
const categoriesGrid = document.getElementById("categories-grid");
const recipesGrid = document.getElementById("recipes-grid");

const areasContainer = document.querySelector(
  "#search-filters-section .flex.items-center.gap-3"
);

const searchFiltersSection = document.getElementById("search-filters-section");
const mealCategoriesSection = document.getElementById(
  "meal-categories-section"
);
const allRecipesSection = document.getElementById("all-recipes-section");
const mealDetailsSection = document.getElementById("meal-details");

const productsSection = document.getElementById("products-section");
const productSearchInput = document.getElementById("product-search-input");
const barcodeInput = document.getElementById("barcode-input");
const searchProductButton = document.getElementById("search-product-btn");
const lookupBarcodeButton = document.getElementById("lookup-barcode-btn");
const productCategories = document.getElementById("product-categories");
const productsPagination = document.getElementById("products-pagination");
const productsGrid = document.getElementById("products-grid");

const foodlogSection = document.getElementById("foodlog-section");
const clearFoodLogButton = document.getElementById("clear-foodlog");

const navLinks = document.querySelectorAll(".nav-link");
const nutriScoreButtons = document.querySelectorAll(".nutri-score-filter");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const sidebarCloseButton = document.getElementById("sidebar-close-btn");
const headerMenuButton = document.getElementById("header-menu-btn");

let searchTimeout = null;
let categoryRequestInProgress = false;
let mealSearchRequestId = 0;

const showToast = (title, icon = "success") => {
  if (!window.Swal) {
    return;
  }

  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: "#0D1320",
    color: "#F5F5F5",
  });
};

const showAlert = (title, text, icon = "error") => {
  if (!window.Swal) {
    return;
  }

  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
    confirmButtonColor: "#A50044",
    background: "#0D1320",
    color: "#F5F5F5",
  });
};

const showConfirm = async (title, text) => {
  if (!window.Swal) {
    return true;
  }

  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, clear it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#A50044",
    cancelButtonColor: "#252B35",
    background: "#0D1320",
    color: "#F5F5F5",
  });

  return result.isConfirmed;
};

const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normalizeOptionalNumber = (value) =>
  value === null || value === undefined || value === ""
    ? null
    : normalizeNumber(value);

const normalizeNutrition = (nutrition = {}) => {
  const source = nutrition?.perServing || nutrition;
  const available = ["calories", "protein", "carbs", "fat"].some(
    (key) => source[key] !== undefined && source[key] !== null
  );

  return {
    available,
    calories: normalizeNumber(
      source?.calories ?? source?.energy ?? source?.energyKcal
    ),
    protein: normalizeNumber(source?.protein ?? source?.proteins),
    carbs: normalizeNumber(
      source?.carbs ?? source?.carbohydrates ?? source?.carbohydratesTotal
    ),
    fat: normalizeNumber(source?.fat ?? source?.totalFat),
    fiber: normalizeNumber(source?.fiber ?? source?.fibers),
    sugar: normalizeNumber(source?.sugar ?? source?.sugars),
  };
};

const hasNutritionValues = (nutrition = {}) =>
  nutrition.available === true ||
  (nutrition.available !== false &&
    ["calories", "protein", "carbs", "fat"].some(
      (key) => nutrition[key] !== undefined && nutrition[key] !== null
    ));

const extractNutrition = (data) => {
  if (data?.success !== true || !data?.data) {
    return null;
  }

  return {
    ...normalizeNutrition(data.data.perServing),
    totals: normalizeNutrition(data.data.totals),
  };
};

const getProductLimit = () => {
  const limit = Number(AppState.state?.productLimit);

  return Number.isFinite(limit) && limit > 0 ? limit : 24;
};

const getProductPool = () => {
  return Array.isArray(AppState.state?.productPool)
    ? AppState.state.productPool
    : [];
};

const getProductSearchQuery = () => {
  return String(AppState.state?.productSearchQuery || "").trim();
};

const getSelectedProductCategory = () => {
  return String(AppState.state?.selectedProductCategory || "").trim();
};

const getSelectedNutriScore = () => {
  return String(AppState.state?.selectedNutriScore || "").trim();
};

const setProductPool = (products) => {
  if (typeof AppState.setProductPool === "function") {
    AppState.setProductPool(products);
    return;
  }

  AppState.state.productPool = Array.isArray(products) ? products : [];
};

const setProductPagination = (pagination) => {
  if (typeof AppState.setProductPagination === "function") {
    AppState.setProductPagination(pagination);
    return;
  }

  AppState.state.productPage = Number(pagination?.page) || 1;
  AppState.state.productLimit =
    Number(pagination?.limit) || getProductLimit();
  AppState.state.productTotal = Number(pagination?.total) || 0;
  AppState.state.productTotalPages = Number(pagination?.totalPages) || 0;
};

const setProductSearchQuery = (query) => {
  if (typeof AppState.setProductSearchQuery === "function") {
    AppState.setProductSearchQuery(query);
    return;
  }

  AppState.state.productSearchQuery = String(query || "");
};

const setSelectedProductCategory = (category) => {
  if (typeof AppState.setSelectedProductCategory === "function") {
    AppState.setSelectedProductCategory(category);
    return;
  }

  AppState.state.selectedProductCategory = String(category || "");
};

const setSelectedNutriScore = (score) => {
  if (typeof AppState.setSelectedNutriScore === "function") {
    AppState.setSelectedNutriScore(score);
    return;
  }

  AppState.state.selectedNutriScore = String(score || "");
};

const normalizeProduct = (product = {}) => {
  const nutrition =
    product?.nutrients ||
    product?.nutrition ||
    product?.nutritionalInfo ||
    {};

  const name =
    product?.name ||
    product?.product_name ||
    product?.product_name_en ||
    "Unknown Product";

  const brand = product?.brand || product?.brands || "";

  const image =
    product?.image ||
    product?.image_url ||
    product?.image_front_url ||
    product?.thumbnail ||
    product?.thumbnailImage ||
    product?.image_front_small_url ||
    "";

  const barcode = product?.barcode || product?.code || product?._id || "";

  const nutritionGrade =
    product?.nutritionGrade ||
    product?.nutriscore_grade ||
    product?.nutriScore ||
    product?.nutri_score ||
    product?.nutrition_grades ||
    product?.nutrition_grade_fr ||
    "unknown";

  const novaGroup =
    product?.novaGroup ??
    product?.nova_group ??
    product?.nova ??
    "N/A";

  const calories =
    nutrition?.calories ??
    nutrition?.energy ??
    nutrition?.energy_kcal ??
    product?.calories ??
    product?.energy_kcal_100g ??
    product?.energyKcal100g;

  const protein =
    nutrition?.protein ??
    nutrition?.proteins ??
    product?.protein ??
    product?.proteins_100g ??
    product?.protein_100g;

  const carbs =
    nutrition?.carbs ??
    nutrition?.carbohydrates ??
    product?.carbs ??
    product?.carbohydrates_100g ??
    product?.carbohydrates;

  const fat =
    nutrition?.fat ??
    product?.fat ??
    product?.fat_100g;

  const sugar =
    nutrition?.sugar ??
    nutrition?.sugars ??
    product?.sugar ??
    product?.sugars_100g ??
    product?.sugars;

  const categories =
    product?.categories ??
    product?.category ??
    product?.categoryName ??
    product?.category_name ??
    "";

  return {
    ...product,
    barcode,
    name,
    brand,
    image,
    categories,
    quantity:
      product?.quantity ||
      product?.servingSize ||
      product?.serving_size ||
      "",
    nutritionGrade: String(nutritionGrade).toLowerCase(),
    novaGroup,
    nutrients: {
      calories: normalizeOptionalNumber(calories),
      protein: normalizeOptionalNumber(protein),
      carbs: normalizeOptionalNumber(carbs),
      fat: normalizeOptionalNumber(fat),
      sugar: normalizeOptionalNumber(sugar),
    },
  };
};

const extractProducts = (data) => {
  const results = Array.isArray(data?.results) ? data.results : [];

  return results.map(normalizeProduct);
};

const extractPagination = (
  data,
  fallbackPage = 1,
  fallbackLimit = 24,
  fallbackLength = 0
) => {
  const pagination = data?.pagination || {};

  const page =
    Number(pagination.currentPage ?? data?.page ?? fallbackPage) ||
    fallbackPage;

  const limit =
    Number(pagination.limit ?? data?.pageSize ?? fallbackLimit) ||
    fallbackLimit;

  const total =
    Number(pagination.total ?? data?.count ?? fallbackLength) || 0;

  const totalPages =
    Number(
      pagination.totalPages ??
        (total > 0 ? Math.ceil(total / limit) : 0)
    ) || 0;

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

const clearProductsUI = () => {
  if (typeof UI.renderProducts === "function") {
    UI.renderProducts([]);
  }

  if (typeof UI.renderProductCount === "function") {
    UI.renderProductCount([]);
  }

  if (typeof UI.renderProductPagination === "function") {
    UI.renderProductPagination({
      page: 1,
      totalPages: 0,
    });
  }
};

const showProductMessage = (title, description) => {
  if (typeof UI.showProductSearchMessage === "function") {
    UI.showProductSearchMessage(title, description);
    return;
  }

  if (!productsGrid) {
    return;
  }

  productsGrid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div class="w-20 h-20 rounded-full bg-[#11151C] border border-[#252B35] flex items-center justify-center mb-5">
        <i class="fa-solid fa-magnifying-glass text-[#EDBB00] text-2xl"></i>
      </div>

      <h3 class="text-lg font-bold text-[#F5F5F5]">
        ${title}
      </h3>

      <p class="text-sm text-[#A7ADB8] mt-2 max-w-md">
        ${description}
      </p>
    </div>
  `;

  if (typeof UI.renderProductCount === "function") {
    UI.renderProductCount([]);
  }
};

const resetNutriScoreButtons = () => {
  nutriScoreButtons.forEach((button) => {
    button.classList.remove(
      "bg-emerald-600",
      "text-white",
      "border-emerald-600",
      "bg-gray-100",
      "text-gray-700",
      "bg-[#004D98]",
      "border-[#004D98]"
    );

    button.classList.add(
      "bg-[#11151C]",
      "text-[#A7ADB8]",
      "border-[#252B35]"
    );
  });
};

const updateActiveNutriScore = (activeButton) => {
  resetNutriScoreButtons();

  if (!activeButton) {
    return;
  }

  activeButton.classList.remove(
    "bg-[#11151C]",
    "text-[#A7ADB8]",
    "border-[#252B35]"
  );

  activeButton.classList.add(
    "bg-[#004D98]",
    "text-white",
    "border-[#004D98]"
  );
};

const filterProductsByScore = (products = []) => {
  const grade = getSelectedNutriScore().toLowerCase();

  if (!grade) {
    return products;
  }

  return products.filter((product) => {
    const score = String(product?.nutritionGrade || "").toLowerCase();

    return score === grade;
  });
};

const getProductCategoryText = (product) => {
  const categories =
    product?.categories ||
    product?.category ||
    product?.categoryName ||
    "";

  if (Array.isArray(categories)) {
    return categories.join(" ");
  }

  return String(categories || "");
};

const productMatchesCategory = (product, category) => {
  const normalizedCategory = String(category || "")
    .trim()
    .toLowerCase();

  if (!normalizedCategory) {
    return true;
  }

  const categoryText = getProductCategoryText(product).toLowerCase();

  return categoryText.includes(normalizedCategory);
};

const applyProductFilters = (products = []) => {
  let filtered = Array.isArray(products) ? products : [];

  const selectedCategory = getSelectedProductCategory();

  if (selectedCategory) {
    filtered = filtered.filter((product) =>
      productMatchesCategory(product, selectedCategory)
    );
  }

  return filterProductsByScore(filtered);
};

const renderFoodLogPage = () => {
  const calorieTarget = AppState.state.calorieTarget || 2000;

  UI.renderFoodLog(AppState.state.foodLog);
  UI.renderFoodLogCount(AppState.state.foodLog);
  UI.renderNutritionSummary(AppState.state.foodLog, calorieTarget);
  UI.toggleClearFoodLog(AppState.state.foodLog);
  UI.renderFoodLogDate();
  UI.renderWeeklyOverview(AppState.state.foodLog);
  UI.renderFoodLogStats(AppState.state.foodLog, calorieTarget);
};

const syncCalorieTargetUI = () => {
  const calorieTarget = AppState.state.calorieTarget || 2000;

  if (calorieTargetInput) {
    calorieTargetInput.value = String(calorieTarget);
  }

  const foodLogTarget = document.getElementById("foodlog-calorie-target");

  if (foodLogTarget) {
    foodLogTarget.textContent = `Target: ${calorieTarget.toLocaleString()} kcal`;
  }
};

const handleCalorieTargetChange = () => {
  if (!calorieTargetInput) {
    return;
  }

  AppState.setCalorieTarget(calorieTargetInput.value);
  syncCalorieTargetUI();
  renderFoodLogPage();
};

const updateActiveNav = (activeLink) => {
  navLinks.forEach((link) => {
    link.classList.remove(
      "active-nav",
      "bg-emerald-50",
      "text-emerald-700",
      "bg-[#004D98]",
      "text-white"
    );

    link.classList.add("text-[#A7ADB8]");

    const span = link.querySelector("span");

    if (span) {
      span.classList.remove("font-semibold");
      span.classList.add("font-medium");
    }
  });

  if (!activeLink) {
    return;
  }

  activeLink.classList.remove("text-[#A7ADB8]");
  activeLink.classList.add("active-nav");

  const span = activeLink.querySelector("span");

  if (span) {
    span.classList.remove("font-medium");
    span.classList.add("font-semibold");
  }
};

const hideAllPages = () => {
  [
    homeSection,
    searchFiltersSection,
    mealCategoriesSection,
    allRecipesSection,
    mealDetailsSection,
    productsSection,
    foodlogSection,
  ].forEach((element) => {
    if (element) {
      element.style.display = "none";
    }
  });
};

const closeSidebar = () => {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.add("-translate-x-full");
  sidebarOverlay.classList.remove("active");
};

const openSidebar = () => {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.remove("-translate-x-full");
  sidebarOverlay.classList.add("active");
};

const toggleSidebar = () => {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  if (sidebar.classList.contains("-translate-x-full")) {
    openSidebar();
  } else {
    closeSidebar();
  }
};

const showPage = (page) => {
  hideAllPages();

  if (page === "home" && homeSection) {
    homeSection.style.display = "";
  }

  if (page === "meals") {
    if (searchFiltersSection) {
      searchFiltersSection.style.display = "";
    }

    if (mealCategoriesSection) {
      mealCategoriesSection.style.display = "";
    }

    if (allRecipesSection) {
      allRecipesSection.style.display = "";
    }
  }

  if (page === "products" && productsSection) {
    productsSection.style.display = "";
  }

  if (page === "foodlog" && foodlogSection) {
    foodlogSection.style.display = "";
    renderFoodLogPage();
  }

  AppState.setCurrentPage(page);
};

const showHomePage = () => {
  showPage("home");
  updateActiveNav(navLinks[0]);

  if (pageMainTitle) {
    pageMainTitle.textContent = "Jooe";
  }

  if (pageMainSubtitle) {
    pageMainSubtitle.textContent =
      "Your personal nutrition and culinary intelligence hub";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const showMealsPage = () => {
  showPage("meals");
  updateActiveNav(navLinks[1]);

  if (pageMainTitle) {
    pageMainTitle.textContent = "Culinary Archive";
  }

  if (pageMainSubtitle) {
    pageMainSubtitle.textContent =
      "Discover recipes, ingredients and nutrition insights";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const showProductsPage = () => {
  showPage("products");
  updateActiveNav(navLinks[2]);

  if (pageMainTitle) {
    pageMainTitle.textContent = "Food Intelligence & Barcodes";
  }

  if (pageMainSubtitle) {
    pageMainSubtitle.textContent =
      "Scan, search and understand packaged food";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const showFoodLogPage = () => {
  showPage("foodlog");
  updateActiveNav(navLinks[3]);

  if (pageMainTitle) {
    pageMainTitle.textContent = "Performance Protocol";
  }

  if (pageMainSubtitle) {
    pageMainSubtitle.textContent =
      "Track meals, macros and daily nutrition consistency";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const showMealDetailsPage = () => {
  hideAllPages();

  if (mealDetailsSection) {
    mealDetailsSection.style.display = "block";
  }

  AppState.setCurrentPage("details");

  navLinks.forEach((link) => {
    link.classList.remove(
      "active-nav",
      "bg-emerald-50",
      "text-emerald-700",
      "bg-[#004D98]",
      "text-white"
    );

    link.classList.add("text-[#A7ADB8]");

    const span = link.querySelector("span");

    if (span) {
      span.classList.remove("font-semibold");
      span.classList.add("font-medium");
    }
  });

  if (pageMainTitle) {
    pageMainTitle.textContent = "Culinary Blueprint";
  }

  if (pageMainSubtitle) {
    pageMainSubtitle.textContent =
      "Ingredients, preparation and detailed nutrition profile";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const handleNavigation = (event) => {
  const link = event.target.closest(".nav-link");

  if (!link) {
    return;
  }

  event.preventDefault();

  const index = Array.from(navLinks).indexOf(link);

  if (window.innerWidth < 1024) {
    closeSidebar();
  }

  if (index === 0) {
    navigate("/home");
    return;
  }

  if (index === 1) {
    navigate("/meals");
    return;
  }

  if (index === 2) {
    navigate("/products");
    return;
  }

  if (index === 3) {
    navigate("/foodlog");
  }
};

const handleFoodLogPageClick = (event) => {
  const button = event.target.closest("[data-foodlog-page]");

  if (!button) {
    return;
  }

  const page = button.dataset.foodlogPage;

  if (page === "meals") {
    navigate("/meals");
  } else if (page === "products") {
    navigate("/products");
  }
};

const loadProductCategories = async () => {
  try {
    const data = await API.getProductCategories(1, 50);

    const categories = data.results;

    AppState.setProductCategories(categories);

    UI.renderProductCategories(categories);
  } catch (error) {
    showAlert(
      "Failed to load product categories",
      error.message || "Please try again later."
    );
  }
};

const initializeProductsPage = () => {
  AppState.setProducts([]);
  setProductPool([]);

  AppState.setSelectedProduct(null);

  setProductSearchQuery("");
  setSelectedProductCategory("");
  setSelectedNutriScore("");

  setProductPagination({
    page: 1,
    limit: getProductLimit(),
    total: 0,
    totalPages: 0,
  });

  if (productSearchInput) {
    productSearchInput.value = "";
  }

  if (barcodeInput) {
    barcodeInput.value = "";
  }

  resetNutriScoreButtons();
  clearProductsUI();

  showProductMessage(
    "Search for a product first",
    "Enter a product name to see matching products."
  );
};

const handleProductSearch = async (page = 1) => {
  if (!productSearchInput) {
    return;
  }

  const query = productSearchInput.value.trim();

  if (!query) {
    initializeProductsPage();
    showToast("Please enter a product name", "warning");
    return;
  }

  try {
    UI.showLoading();

    setProductSearchQuery(query);
    setSelectedProductCategory("");
    setSelectedNutriScore("");
    resetNutriScoreButtons();

    const data = await API.searchProducts(query);

    const products = extractProducts(data);

    const pagination = {
      page: 1,
      limit: products.length,
      total: Number(data?.count) || products.length,
      totalPages: 1,
    };

    setProductPagination(pagination);

    if (!products.length) {
      setProductPool([]);
      AppState.setProducts([]);
      clearProductsUI();

      showProductMessage(
        "No products found",
        `No products found for "${query}".`
      );

      showToast("No products found", "info");

      return;
    }

    const normalizedProducts = products.map(normalizeProduct);

    setProductPool(normalizedProducts);
    AppState.setProducts(normalizedProducts);

    UI.renderProducts(normalizedProducts);
    UI.renderProductCount(normalizedProducts);

    if (typeof UI.renderProductPagination === "function") {
      UI.renderProductPagination(pagination);
    }

    showToast("Products loaded successfully");
  } catch (error) {
    setProductPool([]);
    AppState.setProducts([]);
    clearProductsUI();

    showProductMessage(
      "Search failed",
      "Please try searching again."
    );

    showAlert(
      "Product search failed",
      error.message || "Please try again later."
    );
  } finally {
    UI.hideLoading();
  }
};

const handleProductCategory = async (category, page = 1) => {
  if (!category) {
    return;
  }

  try {
    UI.showLoading();

    setSelectedProductCategory(category);
    setSelectedNutriScore("");
    resetNutriScoreButtons();

    const data = await API.getProductsByCategory(
      category,
      page,
      getProductLimit()
    );

    const products = extractProducts(data);

    const pagination = extractPagination(
      data,
      page,
      getProductLimit(),
      products.length
    );

    setProductPagination(pagination);

    if (!products.length) {
      setProductPool([]);
      AppState.setProducts([]);
      clearProductsUI();

      showProductMessage(
        "No products found",
        `No products found in category "${category}".`
      );

      showToast("No products found", "info");

      return;
    }

    const normalizedProducts = products.map(normalizeProduct);

    setProductPool(normalizedProducts);
    AppState.setProducts(normalizedProducts);

    UI.renderProducts(normalizedProducts);
    UI.renderProductCount(normalizedProducts);

    if (typeof UI.renderProductPagination === "function") {
      UI.renderProductPagination(pagination);
    }

    showToast(`${category} products loaded successfully`);
  } catch (error) {
    setProductPool([]);
    AppState.setProducts([]);
    clearProductsUI();

    showProductMessage(
      "Failed to load category",
      "Please try selecting another category."
    );

    showAlert(
      "Failed to load category",
      error.message || "Please try again later."
    );
  } finally {
    UI.hideLoading();
  }
};

const handleBarcodeLookup = async () => {
  if (!barcodeInput) {
    return;
  }

  const barcode = barcodeInput.value.trim();

  if (!barcode) {
    showToast("Please enter a barcode", "warning");
    return;
  }

  try {
    UI.showLoading();

    const data = await API.getProductByBarcode(barcode);

    const product =
      data?.result ||
      data?.product ||
        data?.data?.product ||
      data?.data ||
        (data?.id ? data : null);

    if (!product) {
      setProductPool([]);
      AppState.setProducts([]);
      clearProductsUI();

      showProductMessage(
        "Product not found",
        `No product was found for barcode "${barcode}".`
      );

      showToast("Product not found", "warning");

      return;
    }

    const normalizedProduct = normalizeProduct(product);

    AppState.setSelectedProduct(normalizedProduct);
    setProductPool([normalizedProduct]);
    AppState.setProducts([normalizedProduct]);

    setProductSearchQuery("");
    setSelectedProductCategory("");
    setSelectedNutriScore("");

    setProductPagination({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });

    resetNutriScoreButtons();

    UI.renderProducts([normalizedProduct]);
    UI.renderProductCount([normalizedProduct]);

    if (typeof UI.renderProductPagination === "function") {
      UI.renderProductPagination({
        page: 1,
        totalPages: 1,
      });
    }

    showToast("Product found successfully");
  } catch (error) {
    setProductPool([]);
    AppState.setProducts([]);
    clearProductsUI();

    showProductMessage(
      "Barcode lookup failed",
      error.message || "Unable to find this product."
    );

    showAlert(
      "Barcode lookup failed",
      error.message || "Unable to find this product."
    );
  } finally {
    UI.hideLoading();
  }
};

const handleNutriScoreFilter = (event) => {
  const button = event.target.closest(".nutri-score-filter");

  if (!button) {
    return;
  }

  const productPool = getProductPool();

  if (!productPool.length) {
    resetNutriScoreButtons();
    setSelectedNutriScore("");

    showProductMessage(
      "Search for a product first",
      "Search for a product before using Nutri-Score filters."
    );

    showToast("Search for a product first", "warning");

    return;
  }

  const grade = String(button.dataset.grade || "").toLowerCase();

  setSelectedNutriScore(grade);
  updateActiveNutriScore(button);

  const filtered = applyProductFilters(productPool);

  AppState.setProducts(filtered);

  setProductPagination({
    page: 1,
    limit: filtered.length || 1,
    total: filtered.length,
    totalPages: filtered.length ? 1 : 0,
  });

  if (!filtered.length) {
    clearProductsUI();

    showProductMessage(
      "No matching products",
      "No products match the selected filters."
    );

    showToast("No matching products found", "info");

    return;
  }

  UI.renderProducts(filtered);
  UI.renderProductCount(filtered);

  if (typeof UI.renderProductPagination === "function") {
    UI.renderProductPagination({
      page: 1,
      totalPages: 1,
    });
  }

  showToast(
    grade
      ? `Nutri-Score ${grade.toUpperCase()} applied`
      : "All Nutri-Scores shown"
  );
};

const handleProductPagination = async (event) => {
  const nextButton = event.target.closest("#products-next-page");
  const prevButton = event.target.closest("#products-prev-page");

  if (!nextButton && !prevButton) {
    return;
  }

  const currentPage =
    Number(AppState.state?.productPage) || 1;

  const totalPages =
    Number(AppState.state?.productTotalPages) || 0;

  let nextPage = currentPage;

  if (nextButton && currentPage < totalPages) {
    nextPage = currentPage + 1;
  }

  if (prevButton && currentPage > 1) {
    nextPage = currentPage - 1;
  }

  if (nextPage === currentPage) {
    return;
  }

  const query = getProductSearchQuery();
  const category = getSelectedProductCategory();

  if (query) {
    await handleProductSearch(nextPage);
  } else if (category) {
    await handleProductCategory(category, nextPage);
  }
};

const handleQuickLogProduct = (event) => {
  const button = event.target.closest(".quick-log-product-btn");

  if (!button) {
    return;
  }

  const barcode = button.dataset.barcode;

  if (!barcode) {
    return;
  }

  const product = getProductPool().find(
    (item) =>
      String(item?.barcode || "") === String(barcode)
  );

  if (!product) {
    showToast("Product not found", "error");
    return;
  }

  const nutrients = product.nutrients || {};

  if (
    !["calories", "protein", "carbs", "fat"].every(
      (key) => Number.isFinite(Number(nutrients[key]))
    )
  ) {
    showToast("Nutrition data is unavailable for this product", "warning");
    return;
  }

  const logItem = {
    id: `product_${barcode}_${Date.now()}`,
    name: product.name || "Unknown Product",
    image: product.image || "",
    type: "product",
    sourceId: barcode || product.name || "product",
    brand: product.brand || "",
    barcode,
    calories: normalizeNumber(nutrients.calories),
    protein: normalizeNumber(nutrients.protein),
    carbs: normalizeNumber(nutrients.carbs),
    fat: normalizeNumber(nutrients.fat),
  };

  AppState.addToFoodLog(logItem);
  renderFoodLogPage();

  showToast(
    `${logItem.name} has been added to your food log`
  );
};

const handleSearch = () => {
  if (!searchInput) {
    return;
  }

  const query = searchInput.value.trim();

  AppState.setSearchQuery(query);

  clearTimeout(searchTimeout);
  const requestId = ++mealSearchRequestId;

  searchTimeout = setTimeout(async () => {
    try {
      UI.showLoading();

      const data = await API.searchMeals(query || "chicken");

      if (requestId !== mealSearchRequestId) {
        return;
      }

      const meals = data.results;

      AppState.setMeals(meals);
      AppState.setSelectedCategory("");
      AppState.setSelectedArea("");

      if (typeof UI.setActiveArea === "function") {
        UI.setActiveArea("");
      }

      if (!meals.length) {
        UI.showEmptyState(
          "No recipes found",
          "Try searching for something else."
        );
      } else {
        UI.renderMeals(meals);
      }

      UI.renderMealCount(meals);
    } catch (error) {
      UI.renderErrorState(
        "Search failed",
        "Please try again later."
      );

      showAlert(
        "Search failed",
        error.message || "Please try again later."
      );
    } finally {
      UI.hideLoading();
    }
  }, 400);
};

const handleCategoryFilter = async (event) => {
  const categoryCard =
    event.target.closest(".category-card");

  if (!categoryCard) {
    return;
  }

  const category = categoryCard.dataset.category;

  if (!category || categoryRequestInProgress) {
    return;
  }

  categoryRequestInProgress = true;

  try {
    clearTimeout(searchTimeout);

    UI.showLoading();

    AppState.setSelectedCategory(category);
    AppState.setSelectedArea("");

    const data = await API.filterMeals({
      category,
    });

    const meals = data.results;

    AppState.setMeals(meals);

    if (!meals.length) {
      UI.showEmptyState(
        "No recipes found",
        `No recipes found in ${category}.`
      );
    } else {
      UI.renderMeals(meals);
    }

    UI.renderMealCount(meals);
  } catch (error) {
    UI.renderErrorState(
      "Failed to filter recipes",
      error.message || "Please try again later."
    );

    showAlert(
      "Failed to filter recipes",
      error.message || "Please try again later."
    );
  } finally {
    categoryRequestInProgress = false;
    UI.hideLoading();
  }
};

const handleAreaFilter = async (event) => {
  const button = event.target.closest(".area-filter");

  if (!button) {
    return;
  }

  const area = button.dataset.area || "";

  try {
    clearTimeout(searchTimeout);

    UI.showLoading();

    AppState.setSelectedCategory("");
    AppState.setSelectedArea(area);

    if (typeof UI.setActiveArea === "function") {
      UI.setActiveArea(area);
    }

    const data = area
      ? await API.filterMeals({
          area,
        })
      : await API.searchMeals("chicken");

    const meals = data.results;

    AppState.setMeals(meals);

    if (!meals.length) {
      UI.showEmptyState(
        "No recipes found",
        area
          ? `No recipes found in ${area}.`
          : "No recipes found."
      );
    } else {
      UI.renderMeals(meals);
    }

    UI.renderMealCount(meals);
  } catch (error) {
    UI.renderErrorState(
      "Failed to filter recipes",
      "Please try again later."
    );

    showAlert(
      "Failed to filter recipes",
      error.message || "Please try again later."
    );
  } finally {
    UI.hideLoading();
  }
};

const loadMealDetails = async (mealId) => {
  if (!mealId) {
    navigate("/meals");
    return;
  }

  try {
    UI.showLoading();

    const data = await API.getMealById(mealId);

    const meal = data?.result || null;

    if (!meal) {
      UI.renderErrorState(
        "Recipe not found",
        "This recipe is no longer available."
      );

      showAlert(
        "Recipe not found",
        "This recipe is no longer available."
      );

      return;
    }

    AppState.setSelectedMeal(meal);

    const existingNutrition = normalizeNutrition(
      meal?.nutrition ||
        meal?.nutrients ||
        meal?.nutritionFacts ||
        {}
    );
    const hasExistingNutrition = hasNutritionValues(
      meal?.nutrition || meal?.nutrients || meal?.nutritionFacts || {}
    );

    AppState.setSelectedMealNutrition(existingNutrition);

    showMealDetailsPage();

    UI.renderMealDetails(meal);

    UI.renderIngredients(
      Array.isArray(meal.ingredients)
        ? meal.ingredients
        : []
    );

    UI.renderInstructions(meal.instructions || "");

    UI.renderVideo(
      meal.youtube ||
        meal.youtubeUrl ||
        meal.video ||
        ""
    );

    UI.renderNutrition(existingNutrition);

    if (
      Array.isArray(meal.ingredients) &&
      meal.ingredients.length
    ) {
      try {
        const ingredientStrings = meal.ingredients
          .map(
            (ingredient) =>
              `${ingredient?.measure || ""} ${
                ingredient?.ingredient ||
                ingredient?.name ||
                ""
              }`.trim()
          )
          .filter(Boolean);

        const nutritionData =
          await API.analyzeNutrition({
            recipeName: meal.name || "Recipe",
            ingredients: ingredientStrings,
          });

        const apiNutrition =
          extractNutrition(nutritionData);

        if (apiNutrition) {
          AppState.setSelectedMealNutrition(apiNutrition);
          UI.renderNutrition(apiNutrition);
        }
      } catch (nutritionError) {
        showAlert(
          "Nutrition analysis unavailable",
          nutritionError.message || "Nutrition data could not be analyzed."
        );

        if (
          hasExistingNutrition
        ) {
          AppState.setSelectedMealNutrition(
            existingNutrition
          );

          UI.renderNutrition(existingNutrition);
        }
      }
    }
  } catch (error) {
    UI.renderErrorState(
      "Failed to load recipe",
      "Please try again later."
    );

    showAlert(
      "Failed to load recipe",
      error.message || "Please try again later."
    );
  } finally {
    UI.hideLoading();
  }
};

const handleMealClick = (event) => {
  const card = event.target.closest(".recipe-card");

  if (!card) {
    return;
  }

  const mealId = card.dataset.mealId;

  if (!mealId) {
    return;
  }

  navigate(
    `/meals/${encodeURIComponent(mealId)}`
  );
};

const handleBackToMeals = (event) => {
  const button =
    event.target.closest("#back-to-meals-btn");

  if (!button) {
    return;
  }

  navigate("/meals");
};

const handleLogMeal = (event) => {
  const button =
    event.target.closest("#log-meal-btn");

  if (!button) {
    return;
  }

  const meal = AppState.state.selectedMeal;

  if (!meal) {
    showToast("No meal selected", "warning");
    return;
  }

  const nutrition =
    AppState.state.selectedMealNutrition || {};

  if (!hasNutritionValues(nutrition)) {
    showToast("Nutrition data is unavailable for this meal", "warning");
    return;
  }

  AppState.addToFoodLog({
    id: `meal_${meal.id}_${Date.now()}`,
    name: meal.name || "Unknown Meal",
    thumbnail:
      meal.thumbnail ||
      meal.image ||
      "",
    type: "meal",
    calories: normalizeNumber(
      nutrition.calories
    ),
    protein: normalizeNumber(
      nutrition.protein
    ),
    carbs: normalizeNumber(
      nutrition.carbs
    ),
    fat: normalizeNumber(
      nutrition.fat
    ),
  });

  renderFoodLogPage();

  showToast(
    `${meal.name} has been added to your food log`
  );
};

const handleRemoveFoodLog = (event) => {
  const button =
    event.target.closest(".remove-foodlog-btn");

  if (!button) {
    return;
  }

  const id = button.dataset.itemId;

  if (!id) {
    return;
  }

  AppState.removeFromFoodLog(id);
  renderFoodLogPage();

  showToast("Item removed from food log");
};

const handleClearFoodLog = async () => {
  const today = typeof AppState.getToday === "function"
    ? AppState.getToday()
    : new Date().toISOString().slice(0, 10);
  const todayItems = AppState.state.foodLog.filter(
    (item) => item?.date === today
  );

  if (!todayItems.length) {
    showToast(
      "Your food log is already empty",
      "info"
    );

    return;
  }

  const confirmed = await showConfirm(
    "Clear today's food log?",
    "This will permanently remove today's logged meals and products."
  );

  if (!confirmed) {
    return;
  }

  if (typeof AppState.clearTodayFoodLog === "function") {
    AppState.clearTodayFoodLog();
  } else {
    AppState.setFoodLog(
      AppState.state.foodLog.filter((item) => item?.date !== today)
    );
  }
  renderFoodLogPage();

  showToast("Food log cleared successfully");
};

const handleRouteChange = (route, mealId) => {
  if (route === "home") {
    showHomePage();
    return;
  }

  if (route === "meals") {
    showMealsPage();
    return;
  }

  if (route === "products") {
    showProductsPage();
    initializeProductsPage();
    return;
  }

  if (route === "foodlog") {
    showFoodLogPage();
    return;
  }

  if (route === "meal-details") {
    loadMealDetails(mealId);
    return;
  }

  navigate("/home", {
    replace: true,
  });
};

const initApp = async () => {
  const shouldContinue = initRouter();

  if (!shouldContinue) {
    return;
  }

  onRouteChange(handleRouteChange);

  try {
    UI.showLoading();

    const [
      mealsData,
      categoriesData,
      areasData,
    ] = await Promise.all([
      API.searchMeals("chicken"),
      API.getCategories(),
      API.getAreas(),
    ]);

    const meals = mealsData.results;

    const categories = categoriesData.results;

    const areas = areasData.results;

    AppState.setMeals(meals);
    AppState.setCategories(categories);
    AppState.setAreas(areas);
    AppState.setSelectedMeal(null);
    AppState.setSelectedMealNutrition({});
    AppState.setSelectedCategory("");
    AppState.setSelectedArea("");
    AppState.setSearchQuery("");

    UI.renderMeals(meals);
    UI.renderCategories(categories);
    UI.renderAreas(areas);
    UI.renderMealCount(meals);

    renderFoodLogPage();

    await loadProductCategories();
  } catch (error) {
    UI.renderErrorState(
      "Failed to load data",
      "Please check your internet connection and try again."
    );

    showAlert(
      "Failed to load data",
      error.message ||
        "Please check your internet connection and try again."
    );
  } finally {
    UI.hideLoading();
  }
};

document.addEventListener(
  "click",
  handleNavigation
);

document.addEventListener(
  "click",
  handleFoodLogPageClick
);

recipesGrid?.addEventListener(
  "click",
  handleMealClick
);

categoriesGrid?.addEventListener(
  "click",
  handleCategoryFilter
);

areasContainer?.addEventListener(
  "click",
  handleAreaFilter
);

searchInput?.addEventListener(
  "input",
  handleSearch
);

document.addEventListener(
  "click",
  handleBackToMeals
);

document.addEventListener(
  "click",
  handleLogMeal
);

document.addEventListener(
  "click",
  handleRemoveFoodLog
);

document.addEventListener(
  "click",
  handleQuickLogProduct
);

heroCtaMeals?.addEventListener(
  "click",
  () => navigate("/meals")
);

heroCtaProducts?.addEventListener(
  "click",
  () => navigate("/products")
);

heroCtaFoodLog?.addEventListener(
  "click",
  () => navigate("/foodlog")
);

pillarCardMeals?.addEventListener(
  "click",
  () => navigate("/meals")
);

pillarCardProducts?.addEventListener(
  "click",
  () => navigate("/products")
);

pillarCardFoodLog?.addEventListener(
  "click",
  () => navigate("/foodlog")
);

clearFoodLogButton?.addEventListener(
  "click",
  handleClearFoodLog
);

calorieTargetInput?.addEventListener(
  "change",
  handleCalorieTargetChange
);

searchProductButton?.addEventListener(
  "click",
  () => handleProductSearch()
);

productSearchInput?.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      handleProductSearch();
    }
  }
);

lookupBarcodeButton?.addEventListener(
  "click",
  handleBarcodeLookup
);

barcodeInput?.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      handleBarcodeLookup();
    }
  }
);

productCategories?.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        ".product-category-btn"
      );

    if (!button) {
      return;
    }

    handleProductCategory(
      button.dataset.category
    );
  }
);

productsPagination?.addEventListener(
  "click",
  handleProductPagination
);

document.addEventListener(
  "click",
  handleNutriScoreFilter
);

sidebarCloseButton?.addEventListener(
  "click",
  closeSidebar
);

sidebarOverlay?.addEventListener(
  "click",
  closeSidebar
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
  }
});

const syncSidebarForViewport = () => {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  if (window.innerWidth >= 1024) {
    sidebar.classList.remove("-translate-x-full");
    sidebarOverlay.classList.remove("active");
    return;
  }

  closeSidebar();
};

window.addEventListener("resize", syncSidebarForViewport);
syncSidebarForViewport();
syncCalorieTargetUI();

headerMenuButton?.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
    toggleSidebar();
  }
);

initApp();