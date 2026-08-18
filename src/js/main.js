import * as API from "./apis/mealdb.js";
import * as AppState from "./state/appState.js";
import * as UI from "./ui/components.js";
import { navigate, onRouteChange, initRouter } from "./router.js";

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
    confirmButtonColor: "#10b981",
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
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
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
  AppState.state.productLimit = Number(pagination?.limit) || getProductLimit();
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
    product?.nutrients || product?.nutrition || product?.nutritionalInfo || {};

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
    product?.novaGroup ?? product?.nova_group ?? product?.nova ?? "N/A";

  const calories =
    nutrition?.calories ??
    nutrition?.energy ??
    nutrition?.energy_kcal ??
    product?.calories ??
    product?.energy_kcal_100g ??
    product?.energyKcal100g ??
    0;

  const protein =
    nutrition?.protein ??
    nutrition?.proteins ??
    product?.protein ??
    product?.proteins_100g ??
    product?.protein_100g ??
    0;

  const carbs =
    nutrition?.carbs ??
    nutrition?.carbohydrates ??
    product?.carbs ??
    product?.carbohydrates_100g ??
    product?.carbohydrates ??
    0;

  const fat = nutrition?.fat ?? product?.fat ?? product?.fat_100g ?? 0;

  const sugar =
    nutrition?.sugar ??
    nutrition?.sugars ??
    product?.sugar ??
    product?.sugars_100g ??
    product?.sugars ??
    0;

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
      product?.quantity || product?.servingSize || product?.serving_size || "",
    nutritionGrade: String(nutritionGrade).toLowerCase(),
    novaGroup,
    nutrients: {
      calories: normalizeNumber(calories),
      protein: normalizeNumber(protein),
      carbs: normalizeNumber(carbs),
      fat: normalizeNumber(fat),
      sugar: normalizeNumber(sugar),
    },
  };
};

const extractProducts = (data) => {
  const results = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.products)
    ? data.products
    : data?.result
    ? [data.result]
    : [];

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

  const total = Number(pagination.total ?? data?.count ?? fallbackLength) || 0;

  const totalPages =
    Number(
      pagination.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 0)
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
      <div class="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
        <i class="fa-solid fa-magnifying-glass text-emerald-500 text-2xl"></i>
      </div>

      <h3 class="text-lg font-bold text-gray-800">
        ${title}
      </h3>

      <p class="text-sm text-gray-500 mt-2 max-w-md">
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
      "border-emerald-600"
    );

    button.classList.add("bg-gray-100", "text-gray-700");
  });
};

const updateActiveNutriScore = (activeButton) => {
  resetNutriScoreButtons();

  if (!activeButton) {
    return;
  }

  activeButton.classList.remove("bg-gray-100", "text-gray-700");

  activeButton.classList.add(
    "bg-emerald-600",
    "text-white",
    "border-emerald-600"
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
    product?.categories || product?.category || product?.categoryName || "";

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
  UI.renderFoodLog(AppState.state.foodLog);
  UI.renderFoodLogCount(AppState.state.foodLog);
  UI.renderNutritionSummary(AppState.state.foodLog);
  UI.toggleClearFoodLog(AppState.state.foodLog);
  UI.renderFoodLogDate();
  UI.renderWeeklyOverview(AppState.state.foodLog);
  UI.renderFoodLogStats(AppState.state.foodLog);
};

const updateActiveNav = (activeLink) => {
  navLinks.forEach((link) => {
    link.classList.remove("bg-emerald-50", "text-emerald-700");
    link.classList.add("text-gray-600");

    const span = link.querySelector("span");

    if (span) {
      span.classList.remove("font-semibold");
      span.classList.add("font-medium");
    }
  });

  if (!activeLink) {
    return;
  }

  activeLink.classList.remove("text-gray-600");
  activeLink.classList.add("bg-emerald-50", "text-emerald-700");

  const span = activeLink.querySelector("span");

  if (span) {
    span.classList.remove("font-medium");
    span.classList.add("font-semibold");
  }
};

const hideAllPages = () => {
  [
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

const showMealsPage = () => {
  showPage("meals");
  updateActiveNav(navLinks[0]);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const showProductsPage = () => {
  showPage("products");
  updateActiveNav(navLinks[1]);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const showFoodLogPage = () => {
  showPage("foodlog");
  updateActiveNav(navLinks[2]);

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
    link.classList.remove("bg-emerald-50", "text-emerald-700");
    link.classList.add("text-gray-600");
  });

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

  closeSidebar();

  if (index === 0) {
    navigate("/meals");
    return;
  }

  if (index === 1) {
    navigate("/products");
    return;
  }

  if (index === 2) {
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

    const categories = Array.isArray(data?.results) ? data.results : [];

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

    const data = await API.searchProducts(query, page, getProductLimit());

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

    showProductMessage("Search failed", "Please try searching again.");

    showAlert(
      "Product search failed",
      error.message || "Please try again later."
    );
  } finally {
    UI.hideLoading();
  }
};

const handleProductCategory = (category) => {
  if (!category) {
    return;
  }

  const query = productSearchInput?.value.trim() || getProductSearchQuery();

  if (!query) {
    setSelectedProductCategory("");
    AppState.setProducts([]);
    setProductPool([]);
    clearProductsUI();

    showProductMessage(
      "Search for a product first",
      "You need to search for a product before using categories."
    );

    showToast("Search for a product first", "warning");

    return;
  }

  const productPool = getProductPool();

  if (!productPool.length) {
    AppState.setProducts([]);
    clearProductsUI();

    showProductMessage(
      "No search results",
      `No products were found for "${query}".`
    );

    showToast("No search results", "info");

    return;
  }

  setSelectedProductCategory(category);

  const categoryProducts = productPool.filter((product) =>
    productMatchesCategory(product, category)
  );

  const filtered = filterProductsByScore(categoryProducts);

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
      `No ${category} products found`,
      `No products from your "${query}" search belong to this category.`
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

  showToast(`${category} products loaded`);
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

    const product = data?.result || data?.product || data?.data || null;

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

  const currentPage = Number(AppState.state?.productPage) || 1;
  const totalPages = Number(AppState.state?.productTotalPages) || 0;

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

  if (!query) {
    return;
  }

  await handleProductSearch(nextPage);
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
    (item) => String(item?.barcode || "") === String(barcode)
  );

  if (!product) {
    showToast("Product not found", "error");
    return;
  }

  const nutrients = product.nutrients || {};

  const logItem = {
    id: `product_${barcode}_${Date.now()}`,
    name: product.name || "Unknown Product",
    image: product.image || "",
    type: "product",
    calories: normalizeNumber(nutrients.calories),
    protein: normalizeNumber(nutrients.protein),
    carbs: normalizeNumber(nutrients.carbs),
    fat: normalizeNumber(nutrients.fat),
  };

  AppState.addToFoodLog(logItem);
  renderFoodLogPage();
  showToast(`${logItem.name} has been added to your food log`);
};

const handleSearch = () => {
  if (!searchInput) {
    return;
  }

  const query = searchInput.value.trim();

  AppState.setSearchQuery(query);

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    try {
      UI.showLoading();

      const data = await API.searchMeals(query || "chicken");

      const meals = Array.isArray(data?.results) ? data.results : [];

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
      UI.renderErrorState("Search failed", "Please try again later.");
      showAlert("Search failed", error.message || "Please try again later.");
    } finally {
      UI.hideLoading();
    }
  }, 400);
};

const handleCategoryFilter = async (event) => {
  const categoryCard = event.target.closest(".category-card");

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

    const meals = Array.isArray(data?.results) ? data.results : [];

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

    const meals = Array.isArray(data?.results) ? data.results : [];

    AppState.setMeals(meals);

    if (!meals.length) {
      UI.showEmptyState(
        "No recipes found",
        area ? `No recipes found in ${area}.` : "No recipes found."
      );
    } else {
      UI.renderMeals(meals);
    }

    UI.renderMealCount(meals);
  } catch (error) {
    UI.renderErrorState("Failed to filter recipes", "Please try again later.");

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

    const meal = data?.result || data?.results?.[0] || data?.meal || null;

    if (!meal) {
      UI.renderErrorState(
        "Recipe not found",
        "This recipe is no longer available."
      );

      showAlert("Recipe not found", "This recipe is no longer available.");
      return;
    }

    AppState.setSelectedMeal(meal);
    AppState.setSelectedMealNutrition({});

    showMealDetailsPage();

    UI.renderMealDetails(meal);

    UI.renderIngredients(
      Array.isArray(meal.ingredients) ? meal.ingredients : []
    );

    UI.renderInstructions(meal.instructions || "");

    UI.renderVideo(meal.youtube || meal.youtubeUrl || meal.video || "");

    UI.renderNutrition({});

    if (Array.isArray(meal.ingredients) && meal.ingredients.length) {
      try {
        const ingredients = meal.ingredients
          .map(
            (ingredient) =>
              `${ingredient?.measure || ""} ${
                ingredient?.ingredient || ingredient?.name || ""
              }`.trim()
          )
          .filter(Boolean);

        const nutritionData = await API.analyzeNutrition({
          recipeName: meal.name || "Recipe",
          ingredients,
        });

        const nutrition = nutritionData?.data?.perServing;

        if (nutrition) {
          AppState.setSelectedMealNutrition(nutrition);
          UI.renderNutrition(nutrition);
        }
      } catch {
        UI.renderNutrition({});
      }
    }
  } catch (error) {
    UI.renderErrorState("Failed to load recipe", "Please try again later.");

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

  navigate(`/meals/${encodeURIComponent(mealId)}`);
};

const handleBackToMeals = (event) => {
  const button = event.target.closest("#back-to-meals-btn");

  if (!button) {
    return;
  }

  navigate("/meals");
};

const handleLogMeal = (event) => {
  const button = event.target.closest("#log-meal-btn");

  if (!button) {
    return;
  }

  const meal = AppState.state.selectedMeal;

  if (!meal) {
    showToast("No meal selected", "warning");
    return;
  }

  const nutrition = AppState.state.selectedMealNutrition || {};

  AppState.addToFoodLog({
    id: `meal_${meal.id}_${Date.now()}`,
    name: meal.name || "Unknown Meal",
    thumbnail: meal.thumbnail || meal.image || "",
    type: "meal",
    calories: normalizeNumber(nutrition.calories),
    protein: normalizeNumber(nutrition.protein),
    carbs: normalizeNumber(nutrition.carbs),
    fat: normalizeNumber(nutrition.fat),
  });

  renderFoodLogPage();
  showToast(`${meal.name} has been added to your food log`);
};

const handleRemoveFoodLog = (event) => {
  const button = event.target.closest(".remove-foodlog-btn");

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
  if (!AppState.state.foodLog.length) {
    showToast("Your food log is already empty", "info");
    return;
  }

  const confirmed = await showConfirm(
    "Clear food log?",
    "This will permanently remove all logged meals and products."
  );

  if (!confirmed) {
    return;
  }

  AppState.clearFoodLog();
  renderFoodLogPage();
  showToast("Food log cleared successfully");
};

const handleRouteChange = (route, mealId) => {
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

  navigate("/meals", {
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

    const [mealsData, categoriesData, areasData] = await Promise.all([
      API.searchMeals("chicken"),
      API.getCategories(),
      API.getAreas(),
    ]);

    const meals = Array.isArray(mealsData?.results) ? mealsData.results : [];

    const categories = Array.isArray(categoriesData?.results)
      ? categoriesData.results
      : [];

    const areas = Array.isArray(areasData?.results) ? areasData.results : [];

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
      error.message || "Please check your internet connection and try again."
    );
  } finally {
    UI.hideLoading();
  }
};

document.addEventListener("click", handleNavigation);
document.addEventListener("click", handleFoodLogPageClick);

recipesGrid?.addEventListener("click", handleMealClick);
categoriesGrid?.addEventListener("click", handleCategoryFilter);
areasContainer?.addEventListener("click", handleAreaFilter);
searchInput?.addEventListener("input", handleSearch);

document.addEventListener("click", handleBackToMeals);
document.addEventListener("click", handleLogMeal);
document.addEventListener("click", handleRemoveFoodLog);
document.addEventListener("click", handleQuickLogProduct);

clearFoodLogButton?.addEventListener("click", handleClearFoodLog);
searchProductButton?.addEventListener("click", () => handleProductSearch());

productSearchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleProductSearch();
  }
});

lookupBarcodeButton?.addEventListener("click", handleBarcodeLookup);

barcodeInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleBarcodeLookup();
  }
});

productCategories?.addEventListener("click", (event) => {
  const button = event.target.closest(".product-category-btn");

  if (!button) {
    return;
  }

  handleProductCategory(button.dataset.category);
});

productsPagination?.addEventListener("click", handleProductPagination);
document.addEventListener("click", handleNutriScoreFilter);

sidebarCloseButton?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);
headerMenuButton?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleSidebar();
});

initApp();
