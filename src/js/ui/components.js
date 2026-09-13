const recipesGrid = document.getElementById("recipes-grid");
const categoriesGrid = document.getElementById("categories-grid");
const recipesCount = document.getElementById("recipes-count");
const productsCount = document.getElementById("products-count");
const loadingOverlay = document.getElementById("app-loading-overlay");
const productsGrid = document.getElementById("products-grid");
const productCategories = document.getElementById("product-categories");
const loggedItemsList = document.getElementById("logged-items-list");
const loggedItemsCount = document.querySelector("#foodlog-today-section h4");
const clearFoodLogButton = document.getElementById("clear-foodlog");
const foodLogDate = document.getElementById("foodlog-date");
const mealDetails = document.getElementById("meal-details");

const areasContainer = document.querySelector(
  "#search-filters-section .flex.items-center.gap-3"
);

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const colors = {
  blue: "#004D98",
  blueDark: "#003B73",
  red: "#A50044",
  redDark: "#7D0035",
  gold: "#EDBB00",
  background: "#07090D",
  surface: "#0D121A",
  surfaceLight: "#111923",
  border: "#202936",
  borderLight: "#2A3442",
  text: "#FFFFFF",
  muted: "#A7ADB8",
  mutedDark: "#6F7885",
};

const emptyState = ({
  icon = "fa-magnifying-glass",
  title = "Nothing found",
  description = "Try changing your search or filters.",
  accent = "blue",
} = {}) => {
  const accentColor = accent === "red" ? colors.red : colors.blue;

  return `
    <div class="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style="
          background: rgba(0, 77, 152, 0.10);
          border: 1px solid rgba(0, 77, 152, 0.25);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
        "
      >
        <i
          class="fa-solid ${icon} text-xl"
          style="color: ${accentColor};"
        ></i>
      </div>

      <p class="text-white text-lg font-bold tracking-tight">
        ${escapeHtml(title)}
      </p>

      <p class="text-[#7F8997] text-sm mt-2 max-w-md leading-relaxed">
        ${escapeHtml(description)}
      </p>
    </div>
  `;
};

export const renderMeals = (meals = []) => {
  if (!recipesGrid) return;

  if (!Array.isArray(meals) || meals.length === 0) {
    showEmptyState();
    return;
  }

  recipesGrid.innerHTML = meals
    .map((meal) => {
      const id = meal?.id ?? "";
      const name = meal?.name || "Unknown Recipe";
      const category = meal?.category || "Unknown";
      const area = meal?.area || "Unknown";

      const image =
        meal?.thumbnail ||
        meal?.image ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&h=600&q=85";

      return `
        <div
          class="recipe-card group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
          data-meal-id="${escapeHtml(id)}"
          style="
            background: ${colors.surface};
            border: 1px solid ${colors.border};
          "
        >
          <div class="relative h-52 overflow-hidden bg-[#090D13]">
            <img
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="${escapeHtml(image)}"
              alt="${escapeHtml(name)}"
              loading="lazy"
            />

            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style="
                background: linear-gradient(
                  to top,
                  rgba(7, 9, 13, 0.7),
                  transparent 60%
                );
              "
            ></div>

            <div class="absolute top-3 left-3">
              <span
                class="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                style="
                  background: rgba(7, 9, 13, 0.88);
                  color: ${colors.gold};
                  border: 1px solid rgba(237, 187, 0, 0.25);
                  backdrop-filter: blur(10px);
                "
              >
                ${escapeHtml(category)}
              </span>
            </div>

            <div class="absolute top-3 right-3">
              <span
                class="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                style="
                  background: rgba(0, 77, 152, 0.9);
                  color: white;
                  border: 1px solid rgba(255, 255, 255, 0.12);
                  backdrop-filter: blur(10px);
                "
              >
                ${escapeHtml(area)}
              </span>
            </div>
          </div>

          <div class="p-5">
            <div class="flex items-center justify-between gap-3 mb-2">
              <p
                class="text-[10px] font-bold uppercase tracking-[0.16em]"
                style="color: ${colors.gold};"
              >
                Jooe Culinary
              </p>

              <i
                class="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                style="color: ${colors.muted};"
              ></i>
            </div>

            <h3
              class="text-[17px] font-bold text-white mb-2 line-clamp-1 tracking-tight"
            >
              ${escapeHtml(name)}
            </h3>

            <p class="text-xs text-[#7F8997] mb-5 line-clamp-2 leading-relaxed">
              Curated recipe with ingredients, preparation guide and nutrition information.
            </p>

            <div
              class="flex items-center justify-between pt-3.5"
              style="border-top: 1px solid ${colors.border};"
            >
              <span class="text-xs font-medium text-[#B8C0CB]">
                <i
                  class="fa-solid fa-utensils mr-1.5"
                  style="color: ${colors.red};"
                ></i>
                ${escapeHtml(category)}
              </span>

              <span class="text-xs font-medium text-[#B8C0CB]">
                <i
                  class="fa-solid fa-earth-americas mr-1.5"
                  style="color: ${colors.blue};"
                ></i>
                ${escapeHtml(area)}
              </span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
};

export const renderCategories = (categories = []) => {
  if (!categoriesGrid) return;

  if (!Array.isArray(categories) || categories.length === 0) {
    categoriesGrid.innerHTML = "";
    return;
  }

  categoriesGrid.innerHTML = categories
    .map((category) => {
      const name = category?.name || category?.strCategory || "Unknown";

      return `
        <div
          class="category-card group rounded-xl p-4 cursor-pointer transition-all duration-300"
          data-category="${escapeHtml(name)}"
          style="
            background: ${colors.surface};
            border: 1px solid ${colors.border};
          "
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
              style="
                background: rgba(0, 77, 152, 0.12);
                border: 1px solid rgba(0, 77, 152, 0.3);
              "
            >
              <i
                class="fa-solid fa-drumstick-bite text-xs"
                style="color: ${colors.gold};"
              ></i>
            </div>

            <div class="min-w-0">
              <h3
                class="text-sm font-bold text-white group-hover:text-[#EDBB00] transition-colors truncate"
              >
                ${escapeHtml(name)}
              </h3>

              <p class="text-[10px] text-[#687280] uppercase tracking-wider mt-0.5">
                Recipe category
              </p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
};

export const renderMealCount = (meals = []) => {
  if (!recipesCount) return;

  const count = Array.isArray(meals) ? meals.length : 0;

  recipesCount.textContent = `Showing ${count} ${
    count === 1 ? "recipe" : "recipes"
  }`;
};

export const renderAreas = (areas = []) => {
  if (!areasContainer) return;

  let box = `
    <button
      type="button"
      class="area-filter active-area px-4 py-2 rounded-lg font-semibold text-xs whitespace-nowrap transition-all cursor-pointer"
      data-area=""
    >
      All Recipes
    </button>
  `;

  if (Array.isArray(areas)) {
    areas.forEach((area) => {
      const value =
        typeof area === "string"
          ? area
          : area?.name || area?.strArea || area?.area || "";

      if (!value) return;

      box += `
        <button
          type="button"
          class="area-filter px-4 py-2 rounded-lg font-semibold text-xs whitespace-nowrap transition-all cursor-pointer"
          data-area="${escapeHtml(value)}"
        >
          ${escapeHtml(value)}
        </button>
      `;
    });
  }

  areasContainer.innerHTML = box;
};

export const setActiveArea = (activeArea) => {
  if (!areasContainer) return;

  const buttons = areasContainer.querySelectorAll(".area-filter");

  buttons.forEach((button) => {
    const area = button.dataset.area || "";

    button.classList.remove("active-area");

    if (area === activeArea) {
      button.classList.add("active-area");
    }
  });
};

export const showLoading = () => {
  if (!loadingOverlay) return;

  loadingOverlay.classList.remove("hidden");
};

export const hideLoading = () => {
  if (!loadingOverlay) return;

  loadingOverlay.classList.add("hidden");
};

export const showEmptyState = (
  message = "No recipes found",
  description = "Try searching for a different ingredient or cuisine"
) => {
  if (!recipesGrid) return;

  recipesGrid.innerHTML = emptyState({
    icon: "fa-magnifying-glass",
    title: message,
    description,
    accent: "blue",
  });
};

export const renderErrorState = (
  message = "Something went wrong",
  description = "Please check your network and try again"
) => {
  if (!recipesGrid) return;

  recipesGrid.innerHTML = emptyState({
    icon: "fa-circle-exclamation",
    title: message,
    description,
    accent: "red",
  });
};

const getProductNutrition = (product) => {
  const nutrients =
    product?.nutrients || product?.nutrition || product?.nutritionalInfo || {};

  const calories =
    nutrients?.calories ??
    product?.calories ??
    product?.energy_kcal_100g ??
    product?.energyKcal100g ??
    null;

  const protein =
    nutrients?.protein ??
    nutrients?.proteins ??
    product?.protein ??
    product?.proteins_100g ??
    product?.protein_100g ??
    null;

  const carbs =
    nutrients?.carbs ??
    nutrients?.carbohydrates ??
    product?.carbs ??
    product?.carbohydrates_100g ??
    product?.carbohydrates ??
    null;

  const fat = nutrients?.fat ?? product?.fat ?? product?.fat_100g ?? null;

  const sugar =
    nutrients?.sugar ??
    nutrients?.sugars ??
    product?.sugar ??
    product?.sugars_100g ??
    product?.sugars ??
    null;

  return {
    calories,
    protein,
    carbs,
    fat,
    sugar,
  };
};

const formatProductNutrition = (value, unit = "") => {
  const number = Number(value);

  return Number.isFinite(number) ? `${number.toFixed(1)}${unit}` : "N/A";
};

const getNutriScore = (product) => {
  return (
    product?.nutritionGrade ||
    product?.nutriscore_grade ||
    product?.nutriScore ||
    product?.nutri_score ||
    "Unknown"
  );
};

const getNovaGroup = (product) => {
  return product?.novaGroup ?? product?.nova_group ?? product?.nova ?? "N/A";
};

export const renderProducts = (products = []) => {
  if (!productsGrid) return;

  if (!Array.isArray(products) || products.length === 0) {
    productsGrid.innerHTML = emptyState({
      icon: "fa-box-open",
      title: "No products found",
      description:
        "Search by brand, food name, or enter a valid barcode to continue.",
      accent: "blue",
    });

    return;
  }

  const getGradeColor = (grade) => {
    const g = String(grade || "").toLowerCase();

    if (g === "a") return "#1F9D72";
    if (g === "b") return "#5C9E35";
    if (g === "c") return colors.gold;
    if (g === "d") return "#C86B36";
    if (g === "e") return colors.red;

    return colors.blue;
  };

  productsGrid.innerHTML = products
    .map((product) => {
      const name = product?.name || "Unknown Product";
      const brand =
        product?.brand || product?.brands || "Verified Grocery Item";

      const image =
        product?.image || product?.image_url || product?.thumbnail || "";

      const quantity = product?.quantity || "Packaged";
      const barcode = product?.barcode || product?.code || "";

      const nutrition = getProductNutrition(product);
      const nutriScore = getNutriScore(product);
      const novaGroup = getNovaGroup(product);
      const scoreColor = getGradeColor(nutriScore);

      return `
        <div
          class="product-card group rounded-2xl overflow-hidden transition-all duration-300"
          data-barcode="${escapeHtml(barcode)}"
          style="
            background: ${colors.surface};
            border: 1px solid ${colors.border};
          "
        >
          <div
            class="relative h-48 bg-[#090D13] flex items-center justify-center overflow-hidden"
          >
            ${
              image
                ? `
                  <img
                    class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(name)}"
                    loading="lazy"
                  />
                `
                : `
                  <div class="text-[#303947] text-5xl">
                    <i class="fa-solid fa-box-open"></i>
                  </div>
                `
            }

            <div class="absolute top-3 left-3">
              <span
                class="inline-flex px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white"
                style="
                  background: ${scoreColor};
                  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
                "
              >
                Nutri-Score ${escapeHtml(nutriScore)}
              </span>
            </div>

            <div class="absolute top-3 right-3">
              <span
                class="w-9 h-9 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style="
                  background: rgba(7, 9, 13, 0.9);
                  border: 1px solid rgba(255,255,255,0.12);
                  backdrop-filter: blur(10px);
                "
                title="Nova Ultra-processing Group"
              >
                N${escapeHtml(novaGroup)}
              </span>
            </div>
          </div>

          <div class="p-5">
            <p
              class="text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5 truncate"
              style="color: ${colors.gold};"
            >
              ${escapeHtml(brand)}
            </p>

            <h3 class="font-bold text-white text-sm mb-2 line-clamp-2 leading-snug">
              ${escapeHtml(name)}
            </h3>

            <div class="flex items-center gap-3 text-[11px] text-[#7F8997] mb-4">
              <span>
                <i class="fa-solid fa-weight-scale mr-1.5"></i>
                ${escapeHtml(quantity)}
              </span>

              <span class="truncate">
                <i class="fa-solid fa-barcode mr-1.5"></i>
                ${escapeHtml(barcode || "N/A")}
              </span>
            </div>

            <div
              class="flex items-center justify-between mb-4 pt-3 border-t"
              style="border-color: ${colors.border};"
            >
              <div>
                <p class="text-[10px] text-[#6F7885] uppercase tracking-wider">
                  Calories
                </p>

                <p class="font-black text-white text-sm mt-0.5">
                  ${escapeHtml(formatProductNutrition(nutrition.calories))}
                  <span class="text-[9px] font-normal text-[#6F7885]">
                    kcal/100g
                  </span>
                </p>
              </div>

              <button
                type="button"
                class="quick-log-product-btn px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                data-barcode="${escapeHtml(barcode)}"
                style="
                  background: rgba(0, 77, 152, 0.12);
                  color: ${colors.gold};
                  border: 1px solid rgba(0, 77, 152, 0.3);
                "
              >
                <i class="fa-solid fa-plus mr-1"></i>
                Log Item
              </button>
            </div>

            <div class="grid grid-cols-4 gap-1.5">
              <div
                class="rounded-lg p-2 text-center"
                style="
                  background: rgba(0, 77, 152, 0.08);
                  border: 1px solid rgba(0, 77, 152, 0.2);
                "
              >
                <p class="text-[11px] font-black" style="color: #70B4FF;">
                  ${escapeHtml(formatProductNutrition(nutrition.protein, "g"))}
                </p>
                <p class="text-[9px] text-[#6F7885] mt-0.5">Protein</p>
              </div>

              <div
                class="rounded-lg p-2 text-center"
                style="
                  background: rgba(237, 187, 0, 0.07);
                  border: 1px solid rgba(237, 187, 0, 0.18);
                "
              >
                <p
                  class="text-[11px] font-black"
                  style="color: ${colors.gold};"
                >
                  ${escapeHtml(formatProductNutrition(nutrition.carbs, "g"))}
                </p>
                <p class="text-[9px] text-[#6F7885] mt-0.5">Carbs</p>
              </div>

              <div
                class="rounded-lg p-2 text-center"
                style="
                  background: rgba(165, 0, 68, 0.08);
                  border: 1px solid rgba(165, 0, 68, 0.2);
                "
              >
                <p
                  class="text-[11px] font-black"
                  style="color: #FF709B;"
                >
                  ${escapeHtml(formatProductNutrition(nutrition.fat, "g"))}
                </p>
                <p class="text-[9px] text-[#6F7885] mt-0.5">Fat</p>
              </div>

              <div
                class="rounded-lg p-2 text-center"
                style="
                  background: rgba(255,255,255,0.025);
                  border: 1px solid ${colors.border};
                "
              >
                <p
                  class="text-[11px] font-black"
                  style="color: ${colors.muted};"
                >
                  ${escapeHtml(formatProductNutrition(nutrition.sugar, "g"))}
                </p>
                <p class="text-[9px] text-[#6F7885] mt-0.5">Sugar</p>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
};

export const renderProductCount = (products = []) => {
  if (!productsCount) return;

  const count = Array.isArray(products) ? products.length : 0;

  productsCount.textContent = `Showing ${count} ${
    count === 1 ? "product" : "products"
  }`;
};

export const renderProductCategories = (categories = []) => {
  if (!productCategories) return;

  if (!Array.isArray(categories) || categories.length === 0) {
    productCategories.innerHTML = "";
    return;
  }

  productCategories.innerHTML = categories
    .map((category) => {
      const name = category?.name || category?.category || "Unknown";
      const id = category?.id || category?.slug || name;
      const productCount = Number.isFinite(Number(category?.products))
        ? String(Number(category.products))
        : "N/A";

      return `
        <button
          type="button"
          class="product-category-btn"
          data-category="${escapeHtml(id)}"
        >
          ${escapeHtml(name)}
          <span class="ml-1 text-[10px] text-[#A7ADB8]">(${escapeHtml(productCount)})</span>
        </button>
      `;
    })
    .join("");
};

export const setActiveProductCategory = (activeCategory) => {
  if (!productCategories) return;

  const buttons = productCategories.querySelectorAll(
    ".product-category-btn"
  );

  buttons.forEach((button) => {
    const id = button.dataset.category || "";
    const isActive = Boolean(activeCategory) && id === activeCategory;

    button.classList.toggle("product-category-active", isActive);
  });
};

export const renderProductPagination = ({
  page = 1,
  totalPages = 0,
} = {}) => {
  const container = document.getElementById("products-pagination");

  if (!container) return;

  if (!totalPages || totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const currentPage = Number(page) || 1;
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  container.innerHTML = `
    <div
      class="pagination-bar"
      style="
        background: ${colors.surface};
        border: 1px solid ${colors.border};
        border-radius: 14px;
        padding: 8px;
      "
    >
      <button
        id="products-prev-page"
        type="button"
        class="pagination-btn"
        ${isFirstPage ? "disabled" : ""}
      >
        <i class="fa-solid fa-chevron-left text-[9px]"></i>
        <span>Previous</span>
      </button>

      <span class="pagination-label">
        Page
        <span class="pagination-label-strong">${currentPage}</span>
        of
        <span class="pagination-label-strong">${totalPages}</span>
      </span>

      <button
        id="products-next-page"
        type="button"
        class="pagination-btn"
        ${isLastPage ? "disabled" : ""}
      >
        <span>Next</span>
        <i class="fa-solid fa-chevron-right text-[9px]"></i>
      </button>
    </div>
  `;
};

export const showProductSearchMessage = (title, description) => {
  if (!productsGrid) return;

  productsGrid.innerHTML = emptyState({
    icon: "fa-magnifying-glass",
    title,
    description,
    accent: "blue",
  });

  if (productsCount) {
    productsCount.textContent = "Search for products to see results";
  }

  const container = document.getElementById("products-pagination");

  if (container) {
    container.innerHTML = "";
  }
};

export const renderMealDetails = (meal) => {
  if (!mealDetails || !meal) return;

  const name = meal?.name || "Unknown Recipe";
  const category = meal?.category || "Culinary";
  const area = meal?.area || "International";

  const image =
    meal?.thumbnail ||
    meal?.image ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&h=700&q=85";

  mealDetails.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <button
        type="button"
        id="back-to-meals-btn"
        class="flex items-center gap-2.5 mb-7 font-semibold text-xs uppercase tracking-wider text-[#A7ADB8] hover:text-white transition-colors cursor-pointer"
      >
        <i
          class="fa-solid fa-arrow-left text-[10px]"
          style="color: ${colors.gold};"
        ></i>
        <span>Back to Recipes</span>
      </button>

      <div
        class="rounded-3xl overflow-hidden mb-9"
        style="
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          box-shadow: 0 25px 70px rgba(0,0,0,0.3);
        "
      >
        <div class="relative h-[360px] sm:h-[430px]">
          <img
            src="${escapeHtml(image)}"
            alt="${escapeHtml(name)}"
            class="w-full h-full object-cover"
          />

          <div
            class="absolute inset-0"
            style="
              background:
                linear-gradient(
                  to top,
                  rgba(7, 9, 13, 0.98) 0%,
                  rgba(7, 9, 13, 0.55) 48%,
                  rgba(7, 9, 13, 0.05) 100%
                );
            "
          ></div>

          <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-9">
            <div class="flex flex-wrap items-center gap-2.5 mb-4">
              <span
                class="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg"
                style="
                  background: rgba(237, 187, 0, 0.12);
                  color: ${colors.gold};
                  border: 1px solid rgba(237, 187, 0, 0.3);
                "
              >
                ${escapeHtml(category)}
              </span>

              <span
                class="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg text-white"
                style="
                  background: rgba(0, 77, 152, 0.85);
                  border: 1px solid rgba(255, 255, 255, 0.12);
                "
              >
                ${escapeHtml(area)}
              </span>
            </div>

            <p
              class="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
              style="color: ${colors.muted};"
            >
              Jooe Culinary Archive
            </p>

            <h1
              class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl"
            >
              ${escapeHtml(name)}
            </h1>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mb-9">
        <button
          type="button"
          id="log-meal-btn"
          class="btn-jooe-primary cursor-pointer"
        >
          <i class="fa-solid fa-clipboard-list"></i>
          <span>Log This Meal</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-9">
        <div class="lg:col-span-2 space-y-7">
          <div id="ingredients-container"></div>
          <div id="instructions-container"></div>
          <div id="video-container"></div>
        </div>

        <div id="nutrition-container"></div>
      </div>
    </div>
  `;
};

export const renderIngredients = (ingredients = []) => {
  const container = document.getElementById("ingredients-container");

  if (!container) return;

  const valid = Array.isArray(ingredients)
    ? ingredients.filter(
        (item) => item && (item.ingredient || item.name || item.measure)
      )
    : [];

  const html =
    valid.length > 0
      ? valid
          .map(
            (ingredient) => `
              <div
                class="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                style="
                  background: rgba(255,255,255,0.018);
                  border: 1px solid ${colors.border};
                "
              >
                <input
                  type="checkbox"
                  class="ingredient-checkbox w-4 h-4 rounded cursor-pointer accent-[#004D98]"
                />

                <span class="text-[#B8C0CB] text-sm leading-relaxed">
                  <span
                    class="font-bold mr-1"
                    style="color: ${colors.gold};"
                  >
                    ${escapeHtml(ingredient.measure || "")}
                  </span>
                  ${escapeHtml(
                    ingredient.ingredient || ingredient.name || ""
                  )}
                </span>
              </div>
            `
          )
          .join("")
      : `
          <p class="text-[#7F8997] text-center py-7 text-sm">
            No ingredients available for this recipe.
          </p>
        `;

  container.innerHTML = `
    <div
      class="p-6 sm:p-7 rounded-2xl"
      style="
        background: ${colors.surface};
        border: 1px solid ${colors.border};
      "
    >
      <div class="flex items-center gap-2.5 mb-5">
        <i
          class="fa-solid fa-list-check text-sm"
          style="color: ${colors.gold};"
        ></i>

        <h2 class="text-xl font-black text-white">
          Recipe Ingredients
        </h2>

        <span
          class="text-[10px] font-bold text-[#7F8997] ml-auto px-2.5 py-1 rounded-lg uppercase tracking-wider"
          style="
            background: rgba(255,255,255,0.03);
            border: 1px solid ${colors.border};
          "
        >
          ${valid.length} items
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        ${html}
      </div>
    </div>
  `;
};

export const renderInstructions = (instructions = []) => {
  const container = document.getElementById("instructions-container");

  if (!container) return;

  let steps = [];

  if (Array.isArray(instructions)) {
    steps = instructions
      .map((step) => String(step ?? "").trim())
      .filter(Boolean);
  } else if (typeof instructions === "string") {
    steps = instructions
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean);
  }

  if (!steps.length) {
    container.innerHTML = `
      <div
        class="p-6 rounded-2xl"
        style="
          background: ${colors.surface};
          border: 1px solid ${colors.border};
        "
      >
        <p class="text-[#7F8997] text-center text-sm">
          No preparation instructions available.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div
      class="p-6 sm:p-7 rounded-2xl"
      style="
        background: ${colors.surface};
        border: 1px solid ${colors.border};
      "
    >
      <div class="flex items-center gap-2.5 mb-6">
        <i
          class="fa-solid fa-kitchen-set text-sm"
          style="color: ${colors.red};"
        ></i>

        <h2 class="text-xl font-black text-white">
          Preparation Guide
        </h2>
      </div>

      <div class="space-y-3">
        ${steps
          .map(
            (step, index) => `
              <div
                class="flex gap-4 p-4 rounded-xl transition-all"
                style="
                  background: rgba(255,255,255,0.015);
                  border: 1px solid ${colors.border};
                "
              >
                <div
                  class="w-8 h-8 rounded-lg font-black text-[11px] flex items-center justify-center text-white shrink-0"
                  style="
                    background: ${colors.blue};
                    border: 1px solid rgba(255,255,255,0.08);
                  "
                >
                  ${index + 1}
                </div>

                <p class="text-[#B8C0CB] text-sm leading-relaxed pt-1">
                  ${escapeHtml(step)}
                </p>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
};

export const renderVideo = (youtubeUrl) => {
  const container = document.getElementById("video-container");

  if (!container) return;

  if (!youtubeUrl || typeof youtubeUrl !== "string") {
    container.innerHTML = `
      <div
        class="p-6 rounded-2xl"
        style="
          background: ${colors.surface};
          border: 1px solid ${colors.border};
        "
      >
        <p class="text-[#7F8997] text-center text-sm">
          No video tutorial available.
        </p>
      </div>
    `;

    return;
  }

  let videoId = "";

  try {
    const url = new URL(youtubeUrl);

    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.split("/")[1] || "";
    } else if (url.pathname.includes("/embed/")) {
      videoId = url.pathname.split("/embed/")[1]?.split("/")[0] || "";
    } else if (url.pathname.includes("/shorts/")) {
      videoId = url.pathname.split("/shorts/")[1]?.split("/")[0] || "";
    } else {
      videoId = url.searchParams.get("v") || "";
    }
  } catch {
    videoId = "";
  }

  if (!videoId) {
    container.innerHTML = `
      <div
        class="p-6 rounded-2xl"
        style="
          background: ${colors.surface};
          border: 1px solid ${colors.border};
        "
      >
        <p class="text-[#7F8997] text-center text-sm">
          Invalid video URL format.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div
      class="p-6 sm:p-7 rounded-2xl"
      style="
        background: ${colors.surface};
        border: 1px solid ${colors.border};
      "
    >
      <div class="flex items-center gap-2.5 mb-5">
        <i
          class="fa-solid fa-video text-sm"
          style="color: ${colors.red};"
        ></i>

        <h2 class="text-xl font-black text-white">
          Video Tutorial
        </h2>
      </div>

      <div
        class="relative aspect-video rounded-2xl overflow-hidden bg-[#090D13]"
        style="border: 1px solid ${colors.border};"
      >
        <iframe
          src="https://www.youtube.com/embed/${escapeHtml(videoId)}"
          class="absolute inset-0 w-full h-full"
          title="Recipe video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;
};

export const renderNutrition = (nutrition = {}) => {
  const container = document.getElementById("nutrition-container");

  if (!container) return;

  if (nutrition.available === false) {
    container.innerHTML = `
      <div class="p-6 rounded-2xl" style="background: ${colors.surface}; border: 1px solid ${colors.border};">
        <p class="text-[#A7ADB8] text-center text-sm">
          Nutrition data is unavailable for this recipe.
        </p>
      </div>
    `;
    return;
  }

  const calories = Number(nutrition.calories) || 0;
  const protein = Number(nutrition.protein) || 0;
  const carbs = Number(nutrition.carbs) || 0;
  const fat = Number(nutrition.fat) || 0;
  const fiber = Number(nutrition.fiber) || 0;
  const sugar = Number(nutrition.sugar) || 0;

  const proteinPercent = Math.min((protein / 50) * 100, 100);
  const carbsPercent = Math.min((carbs / 250) * 100, 100);
  const fatPercent = Math.min((fat / 65) * 100, 100);
  const fiberPercent = Math.min((fiber / 25) * 100, 100);
  const sugarPercent = Math.min((sugar / 50) * 100, 100);

  const nutritionBar = (label, value, goal, percentage, color) => {
    return `
      <div>
        <div class="flex items-center justify-between mb-2 text-xs">
          <span class="font-semibold text-[#B8C0CB]">${label}</span>

          <span class="font-bold" style="color: ${color};">
            ${value}g
            <span class="text-[#596270] font-normal">
              / ${goal}g
            </span>
          </span>
        </div>

        <div class="w-full bg-[#1A212B] rounded-full h-1.5 overflow-hidden">
          <div
            class="h-1.5 rounded-full transition-all duration-500"
            style="
              width: ${percentage}%;
              background: ${color};
            "
          ></div>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div
      class="p-6 sm:p-7 rounded-2xl lg:sticky lg:top-24"
      style="
        background: ${colors.surface};
        border: 1px solid ${colors.border};
        box-shadow: 0 20px 55px rgba(0,0,0,0.2);
      "
    >
      <div class="flex items-center gap-2.5 mb-2">
        <i
          class="fa-solid fa-chart-pie text-sm"
          style="color: ${colors.gold};"
        ></i>

        <h2 class="text-xl font-black text-white">
          Nutrition Facts
        </h2>
      </div>

      <p class="text-xs text-[#6F7885] mb-6 leading-relaxed">
        Calculated estimate per standard serving
      </p>

      <div
        class="text-center py-6 mb-7 rounded-xl"
        style="
          background:
            linear-gradient(
              135deg,
              rgba(0,77,152,0.12),
              rgba(165,0,68,0.08)
            );
          border: 1px solid rgba(0,77,152,0.2);
        "
      >
        <p class="text-[10px] font-bold text-[#7F8997] uppercase tracking-[0.16em]">
          Calories Per Serving
        </p>

        <p
          class="text-4xl font-black mt-1"
          style="color: ${colors.gold};"
        >
          ${calories}
          <span class="text-sm font-medium text-[#6F7885]">
            kcal
          </span>
        </p>
      </div>

      <div class="space-y-5">
        ${nutritionBar(
          "Protein",
          protein,
          50,
          proteinPercent,
          "#70B4FF"
        )}

        ${nutritionBar(
          "Carbohydrates",
          carbs,
          250,
          carbsPercent,
          colors.gold
        )}

        ${nutritionBar(
          "Total Fat",
          fat,
          65,
          fatPercent,
          "#FF709B"
        )}

        ${nutritionBar(
          "Dietary Fiber",
          fiber,
          25,
          fiberPercent,
          "#8FA3B8"
        )}

        ${nutritionBar(
          "Sugars",
          sugar,
          50,
          sugarPercent,
          "#C0C6CF"
        )}
      </div>
    </div>
  `;
};

const normalizeFoodLogNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatFoodLogNumber = (value, decimals = 1) => {
  return normalizeFoodLogNumber(value).toFixed(decimals);
};

const getTodayKey = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getTodayFoodLog = (foodLog = []) => {
  if (!Array.isArray(foodLog)) {
    return [];
  }

  const today = getTodayKey();

  return foodLog.filter((item) => {
    return !item?.date || item.date === today;
  });
};

const getWeekData = (foodLog = []) => {
  const items = Array.isArray(foodLog) ? foodLog : [];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    const dayItems = items.filter((item) => item?.date === dateKey);

    const calories = dayItems.reduce(
      (total, item) => total + normalizeFoodLogNumber(item?.calories),
      0
    );

    days.push({
      dateKey,
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      number: date.getDate(),
      calories,
      items: dayItems.length,
      today: i === 0,
    });
  }

  return days;
};

export const renderFoodLog = (foodLog = []) => {
  if (!loggedItemsList) return;

  const items = getTodayFoodLog(foodLog);

  if (items.length === 0) {
    loggedItemsList.innerHTML = `
      <div
        class="text-center py-14 px-5 rounded-2xl"
        style="
          background: ${colors.surface};
          border: 1px dashed ${colors.borderLight};
        "
      >
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style="
            background: rgba(0,77,152,0.1);
            border: 1px solid rgba(0,77,152,0.22);
          "
        >
          <i
            class="fa-solid fa-utensils text-xl"
            style="color: ${colors.blue};"
          ></i>
        </div>

        <p class="text-white font-bold mb-2">
          No entries recorded today
        </p>

        <p class="text-[#7F8997] text-xs mb-6 max-w-sm mx-auto leading-relaxed">
          Your food log is empty. Add recipes from the culinary archive or scan products to start tracking.
        </p>

        <div class="flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            data-foodlog-page="meals"
            id="browse_recipes"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            style="
              background: ${colors.blue};
              color: white;
              border: 1px solid rgba(255,255,255,0.08);
            "
          >
            <i class="fa-solid fa-compass"></i>
            Browse Archive
          </button>

          <button
            type="button"
            data-foodlog-page="products"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            style="
              background: rgba(255,255,255,0.025);
              color: white;
              border: 1px solid ${colors.border};
            "
          >
            <i
              class="fa-solid fa-barcode"
              style="color: ${colors.gold};"
            ></i>
            Scan Product
          </button>
        </div>
      </div>
    `;

    return;
  }

  loggedItemsList.innerHTML = `
    <div class="space-y-2.5 max-h-96 overflow-y-auto pr-1">
      ${items
        .map((item) => {
          const image = item?.thumbnail || item?.image || "";
          const name = item?.name || "Unknown Food";
          const isProduct = item?.type === "product";
          const type = isProduct ? "Product" : "Recipe";

          const sourceName =
            item?.brand || item?.brands || item?.servings || "";

          const calories = normalizeFoodLogNumber(item?.calories);
          const protein = normalizeFoodLogNumber(item?.protein);
          const carbs = normalizeFoodLogNumber(item?.carbs);
          const fat = normalizeFoodLogNumber(item?.fat);

          let loggedTime = getCurrentTime();

          if (item?.time) {
            loggedTime = item.time;
          } else if (item?.loggedAt) {
            const parsedDate = new Date(item.loggedAt);

            if (!Number.isNaN(parsedDate.getTime())) {
              loggedTime = parsedDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              });
            }
          }

          const productOrRecipeText = sourceName || type;

          return `
            <div
              class="flex items-center justify-between rounded-xl p-3.5 transition-all"
              data-item-id="${escapeHtml(item?.id ?? "")}"
              style="
                background: ${colors.surface};
                border: 1px solid ${colors.border};
              "
            >
              <div class="flex items-center gap-3.5 min-w-0">
                ${
                  image
                    ? `
                      <img
                        src="${escapeHtml(image)}"
                        alt="${escapeHtml(name)}"
                        class="w-12 h-12 rounded-lg object-cover shrink-0"
                        style="border: 1px solid ${colors.border};"
                      />
                    `
                    : `
                      <div
                        class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style="
                          background: rgba(0,77,152,0.1);
                          border: 1px solid rgba(0,77,152,0.2);
                          color: ${colors.blue};
                        "
                      >
                        <i class="fa-solid ${
                          isProduct ? "fa-box" : "fa-utensils"
                        } text-sm"></i>
                      </div>
                    `
                }

                <div class="min-w-0">
                  <p class="font-semibold text-sm text-white truncate">
                    ${escapeHtml(name)}
                  </p>

                  <p class="text-[11px] text-[#7F8997] truncate mt-0.5">
                    ${escapeHtml(productOrRecipeText)}

                    <span class="mx-1 text-[#3E4652]">•</span>

                    <span
                      class="font-medium"
                      style="
                        color: ${
                          isProduct ? colors.blue : colors.gold
                        };
                      "
                    >
                      ${type}
                    </span>
                  </p>

                  <p class="text-[10px] text-[#596270] mt-1">
                    ${escapeHtml(loggedTime)}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right">
                  <p class="text-sm font-bold text-white">
                    ${formatFoodLogNumber(calories, 1)}
                  </p>

                  <p
                    class="text-[9px] font-bold uppercase tracking-wider"
                    style="color: ${colors.gold};"
                  >
                    kcal
                  </p>
                </div>

                <div class="hidden md:flex gap-1">
                  <span
                    class="px-2 py-1 rounded-md text-[9px] font-bold"
                    style="
                      background: rgba(0,77,152,0.1);
                      color: #70B4FF;
                      border: 1px solid rgba(0,77,152,0.2);
                    "
                  >
                    ${formatFoodLogNumber(protein, 0)}g P
                  </span>

                  <span
                    class="px-2 py-1 rounded-md text-[9px] font-bold"
                    style="
                      background: rgba(237,187,0,0.08);
                      color: ${colors.gold};
                      border: 1px solid rgba(237,187,0,0.18);
                    "
                  >
                    ${formatFoodLogNumber(carbs, 0)}g C
                  </span>

                  <span
                    class="px-2 py-1 rounded-md text-[9px] font-bold"
                    style="
                      background: rgba(165,0,68,0.08);
                      color: #FF709B;
                      border: 1px solid rgba(165,0,68,0.18);
                    "
                  >
                    ${formatFoodLogNumber(fat, 0)}g F
                  </span>
                </div>

                <button
                  type="button"
                  class="remove-foodlog-btn text-[#687280] hover:text-[#FF709B] hover:bg-[rgba(165,0,68,0.08)] rounded-lg transition-all p-2 cursor-pointer"
                  data-item-id="${escapeHtml(item?.id ?? "")}"
                  title="Remove entry"
                >
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
};

export const renderFoodLogCount = (foodLog = []) => {
  if (!loggedItemsCount) return;

  const items = getTodayFoodLog(foodLog);

  loggedItemsCount.textContent = `Logged Entries (${items.length})`;
};

export const renderNutritionSummary = (foodLog = [], calorieTarget = 2000) => {
  const section = document.getElementById("foodlog-today-section");

  if (!section) return;

  const progressGrid = section.querySelector(
    ".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4"
  );

  if (!progressGrid) return;

  const cards = progressGrid.querySelectorAll(":scope > div");

  if (cards.length < 4) return;

  const items = getTodayFoodLog(foodLog);

  const goals = {
    calories: calorieTarget,
    protein: 50,
    carbs: 250,
    fat: 65,
  };

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  items.forEach((item) => {
    totals.calories += normalizeFoodLogNumber(item?.calories);
    totals.protein += normalizeFoodLogNumber(item?.protein);
    totals.carbs += normalizeFoodLogNumber(item?.carbs);
    totals.fat += normalizeFoodLogNumber(item?.fat);
  });

  const updateCard = ({
    card,
    value,
    goal,
    normalText,
    normalBar,
  }) => {
    const percentage = Math.min(Math.round((value / goal) * 100), 100);
    const exceeded = value > goal;

    const percentageElement = card.querySelector(
      ".flex.items-center.justify-between span:last-child"
    );

    const bar = card.querySelector(".w-full > div");

    const valueElement = card.querySelector(
      ".flex.items-center.justify-between.text-xs span:first-child"
    );

    const goalElement = card.querySelector(
      ".flex.items-center.justify-between.text-xs span:last-child"
    );

    if (percentageElement) {
      percentageElement.textContent = `${percentage}%`;

      percentageElement.className = exceeded
        ? "text-xs text-[#FF709B] font-bold"
        : `text-xs font-bold ${normalText}`;
    }

    if (bar) {
      bar.style.width = `${percentage}%`;

      bar.classList.remove(
        "bg-emerald-400",
        "bg-sky-400",
        "bg-amber-400",
        "bg-rose-400",
        "bg-red-500"
      );

      bar.style.background = exceeded ? colors.red : "";
      bar.classList.add(exceeded ? "bg-red-500" : normalBar);
    }

    if (valueElement) {
      valueElement.textContent = `${Math.round(value)} ${
        goal === goals.calories ? "kcal" : "g"
      }`;

      valueElement.className = exceeded
        ? "font-bold text-[#FF709B]"
        : "font-bold text-white";
    }

    if (goalElement) {
      goalElement.textContent = `/ ${goal} ${
        goal === goals.calories ? "kcal" : "g"
      }`;
    }
  };

  updateCard({
    card: cards[0],
    value: totals.calories,
    goal: goals.calories,
    normalText: "text-[#8FA3B8]",
    normalBar: "bg-[#004D98]",
  });

  updateCard({
    card: cards[1],
    value: totals.protein,
    goal: goals.protein,
    normalText: "text-[#70B4FF]",
    normalBar: "bg-[#004D98]",
  });

  updateCard({
    card: cards[2],
    value: totals.carbs,
    goal: goals.carbs,
    normalText: "text-[#EDBB00]",
    normalBar: "bg-[#EDBB00]",
  });

  updateCard({
    card: cards[3],
    value: totals.fat,
    goal: goals.fat,
    normalText: "text-[#FF709B]",
    normalBar: "bg-[#A50044]",
  });
};

export const toggleClearFoodLog = (foodLog = []) => {
  if (!clearFoodLogButton) return;

  const items = getTodayFoodLog(foodLog);

  clearFoodLogButton.style.display =
    items.length > 0 ? "inline-flex" : "none";
};

export const renderFoodLogDate = () => {
  if (!foodLogDate) return;

  foodLogDate.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export const renderWeeklyOverview = (foodLog = []) => {
  const container = document.getElementById("weekly-chart");

  if (!container) return;

  const days = getWeekData(foodLog);

  container.innerHTML = days
    .map(
      (day) => `
        <div
          class="text-center p-3.5 rounded-xl transition-all"
          style="
            background: ${
              day.today
                ? "rgba(0,77,152,0.1)"
                : colors.surface
            };
            border: 1px solid ${
              day.today
                ? "rgba(0,77,152,0.35)"
                : colors.border
            };
          "
        >
          <p class="text-[10px] font-bold uppercase tracking-wider text-[#687280] mb-1">
            ${escapeHtml(day.day)}
          </p>

          <p class="text-sm font-semibold text-white">
            ${day.number}
          </p>

          <div
            class="mt-3"
            style="
              color: ${
                day.calories > 0
                  ? colors.gold
                  : "#424A56"
              };
            "
          >
            <p class="text-base font-bold">
              ${Math.round(day.calories)}
            </p>

            <p class="text-[9px] uppercase font-bold tracking-wider opacity-70">
              kcal
            </p>
          </div>

          ${
            day.items > 0
              ? `
                <p class="text-[9px] text-[#687280] mt-1.5">
                  ${day.items}
                  ${day.items === 1 ? "entry" : "entries"}
                </p>
              `
              : ""
          }
        </div>
      `
    )
    .join("");
};

export const renderFoodLogStats = (foodLog = [], calorieTarget = 2000) => {
  const section = document.getElementById("foodlog-section");

  if (!section) return;

  const days = getWeekData(foodLog);

  const weeklyCalories = days.reduce(
    (total, day) => total + day.calories,
    0
  );

  const weeklyAverage = Math.round(weeklyCalories / 7);

  const totalItems = days.reduce(
    (total, day) => total + day.items,
    0
  );

  const daysOnGoal = days.filter(
    (day) => day.calories >= calorieTarget
  ).length;

  const cards = section.querySelectorAll(
    ".grid.grid-cols-1.md\\:grid-cols-3 > div"
  );

  if (cards.length < 3) return;

  const average = cards[0].querySelector(".weekly-avg");
  const total = cards[1].querySelector(".total-items");
  const goal = cards[2].querySelector(".goal");

  if (average) {
    average.textContent = `${weeklyAverage} kcal`;
  }

  if (total) {
    total.textContent = `${totalItems} items`;
  }

  if (goal) {
    goal.textContent = `${daysOnGoal} / 7`;
  }
};