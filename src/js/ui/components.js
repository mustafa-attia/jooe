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
  "#search-filters-section .flex.items-center.gap-3",
);

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
        "https://via.placeholder.com/400x300?text=No+Image";

      return `
        <div
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          data-meal-id="${escapeHtml(id)}"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              src="${escapeHtml(image)}"
              alt="${escapeHtml(name)}"
              loading="lazy"
            />

            <div class="absolute bottom-3 left-3 flex gap-2">
              <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
                ${escapeHtml(category)}
              </span>

              <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
                ${escapeHtml(area)}
              </span>
            </div>
          </div>

          <div class="p-4">
            <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
              ${escapeHtml(name)}
            </h3>

            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              Delicious recipe to try!
            </p>

            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-gray-900">
                <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                ${escapeHtml(category)}
              </span>

              <span class="font-semibold text-gray-500">
                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
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
          class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
          data-category="${escapeHtml(name)}"
        >
          <div class="flex items-center gap-2.5">
            <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <i class="fa-solid fa-drumstick-bite"></i>
            </div>

            <div>
              <h3 class="text-sm font-bold text-gray-900">
                ${escapeHtml(name)}
              </h3>
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
      class="area-filter active-area px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap transition-all"
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
          class="area-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
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

    button.classList.remove("bg-emerald-600", "text-white", "active-area");

    button.classList.add("bg-gray-100", "text-gray-700");

    if (area === activeArea) {
      button.classList.remove("bg-gray-100", "text-gray-700");

      button.classList.add("bg-emerald-600", "text-white", "active-area");
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
  description = "Try searching for something else",
) => {
  if (!recipesGrid) return;

  recipesGrid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
      </div>

      <p class="text-gray-500 text-lg">
        ${escapeHtml(message)}
      </p>

      <p class="text-gray-400 text-sm mt-2">
        ${escapeHtml(description)}
      </p>
    </div>
  `;
};

export const renderErrorState = (
  message = "Something went wrong",
  description = "Please try again later",
) => {
  if (!recipesGrid) return;

  recipesGrid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-circle-exclamation text-red-500 text-2xl"></i>
      </div>

      <p class="text-gray-600 text-lg font-medium">
        ${escapeHtml(message)}
      </p>

      <p class="text-gray-400 text-sm mt-2">
        ${escapeHtml(description)}
      </p>
    </div>
  `;
};

const getProductNutrition = (product) => {
  const nutrients =
    product?.nutrients || product?.nutrition || product?.nutritionalInfo || {};

  const calories =
    nutrients?.calories ??
    product?.calories ??
    product?.energy_kcal_100g ??
    product?.energyKcal100g ??
    0;

  const protein =
    nutrients?.protein ??
    nutrients?.proteins ??
    product?.protein ??
    product?.proteins_100g ??
    product?.protein_100g ??
    0;

  const carbs =
    nutrients?.carbs ??
    nutrients?.carbohydrates ??
    product?.carbs ??
    product?.carbohydrates_100g ??
    product?.carbohydrates ??
    0;

  const fat = nutrients?.fat ?? product?.fat ?? product?.fat_100g ?? 0;

  const sugar =
    nutrients?.sugar ??
    nutrients?.sugars ??
    product?.sugar ??
    product?.sugars_100g ??
    product?.sugars ??
    0;

  return {
    calories,
    protein,
    carbs,
    fat,
    sugar,
  };
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
    productsGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-box-open text-gray-400 text-2xl"></i>
        </div>

        <p class="text-gray-500 text-lg">
          No products found
        </p>

        <p class="text-gray-400 text-sm mt-2">
          Search for a product or choose a category
        </p>
      </div>
    `;

    return;
  }

  productsGrid.innerHTML = products
    .map((product) => {
      const name = product?.name || "Unknown Product";

      const brand = product?.brand || product?.brands || "Unknown Brand";

      const image =
        product?.image || product?.image_url || product?.thumbnail || "";

      const quantity = product?.quantity || "N/A";

      const barcode = product?.barcode || product?.code || "";

      const nutrition = getProductNutrition(product);

      const nutriScore = getNutriScore(product);

      const novaGroup = getNovaGroup(product);

      return `
        <div
          class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
          data-barcode="${escapeHtml(barcode)}"
        >
          <div class="relative h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
            ${
              image
                ? `
                  <img
                    class="w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(name)}"
                    style="height: 200px"
                    loading="lazy"
                  />
                `
                : `
                  <div class="text-gray-300 text-5xl">
                    <i class="fa-solid fa-box-open"></i>
                  </div>
                `
            }

            <div class="absolute top-2 left-2">
              <span class="inline-flex px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase">
                Nutri-Score ${escapeHtml(nutriScore)}
              </span>
            </div>

            <div class="absolute top-2 right-2">
              <span class="w-8 h-8 rounded-full bg-lime-500 text-white text-xs font-bold flex items-center justify-center">
                ${escapeHtml(novaGroup)}
              </span>
            </div>
          </div>

          <div class="p-4">
            <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
              ${escapeHtml(brand)}
            </p>

            <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">
              ${escapeHtml(name)}
            </h3>

            <div class="flex items-center gap-3 text-xs text-gray-500 mb-4">
              <span>
                <i class="fa-solid fa-weight-scale mr-1"></i>
                ${escapeHtml(quantity)}
              </span>

              <span>
                <i class="fa-solid fa-barcode mr-1"></i>
                ${escapeHtml(barcode || "N/A")}
              </span>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-xs text-gray-500">
                  Calories
                </p>

                <p class="font-bold text-gray-900">
                  ${escapeHtml(Number(nutrition.calories).toFixed(1))}

                  <span class="text-xs font-normal text-gray-500">
                    kcal/100g
                  </span>
                </p>
              </div>

              <button
                type="button"
                class="quick-log-product-btn px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
                data-barcode="${escapeHtml(barcode)}"
              >
                <i class="fa-solid fa-plus mr-1"></i>
                Log
              </button>
            </div>

            <div class="grid grid-cols-4 gap-1">
              <div class="bg-emerald-50 rounded-lg p-2 text-center">
                <p class="text-xs font-bold text-emerald-700">
                  ${escapeHtml(Number(nutrition.protein).toFixed(1))}g
                </p>

                <p class="text-[10px] text-gray-500">
                  Protein
                </p>
              </div>

              <div class="bg-blue-50 rounded-lg p-2 text-center">
                <p class="text-xs font-bold text-blue-700">
                  ${escapeHtml(Number(nutrition.carbs).toFixed(1))}g
                </p>

                <p class="text-[10px] text-gray-500">
                  Carbs
                </p>
              </div>

              <div class="bg-purple-50 rounded-lg p-2 text-center">
                <p class="text-xs font-bold text-purple-700">
                  ${escapeHtml(Number(nutrition.fat).toFixed(1))}g
                </p>

                <p class="text-[10px] text-gray-500">
                  Fat
                </p>
              </div>

              <div class="bg-orange-50 rounded-lg p-2 text-center">
                <p class="text-xs font-bold text-orange-700">
                  ${escapeHtml(Number(nutrition.sugar).toFixed(1))}g
                </p>

                <p class="text-[10px] text-gray-500">
                  Sugar
                </p>
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

      return `
          <button
            type="button"
            class="product-category-btn px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all"
            data-category="${escapeHtml(id)}"
          >
            ${escapeHtml(name)}
          </button>
        `;
    })
    .join("");
};

export const renderMealDetails = (meal) => {
  if (!mealDetails || !meal) return;

  const name = meal?.name || "Unknown Recipe";

  const category = meal?.category || "Unknown";

  const area = meal?.area || "Unknown";

  const image =
    meal?.thumbnail ||
    meal?.image ||
    "https://via.placeholder.com/1200x600?text=Recipe";

  mealDetails.innerHTML = `
    <div class="max-w-7xl mx-auto">

      <button
        type="button"
        id="back-to-meals-btn"
        class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to Recipes</span>
      </button>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">

          <img
            src="${escapeHtml(image)}"
            alt="${escapeHtml(name)}"
            class="w-full h-full object-cover"
          />

          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          <div class="absolute bottom-0 left-0 right-0 p-8">

            <div class="flex items-center gap-3 mb-3">

              <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                ${escapeHtml(category)}
              </span>

              <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                ${escapeHtml(area)}
              </span>

            </div>

            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              ${escapeHtml(name)}
            </h1>

          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mb-8">

        <button
          type="button"
          id="log-meal-btn"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
        >
          <i class="fa-solid fa-clipboard-list"></i>
          <span>Log This Meal</span>
        </button>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-8">
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
        (item) => item && (item.ingredient || item.name || item.measure),
      )
    : [];

  const html =
    valid.length > 0
      ? valid
          .map(
            (ingredient) => `
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                <input
                  type="checkbox"
                  class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                />

                <span class="text-gray-700">
                  <span class="font-medium text-gray-900">
                    ${escapeHtml(ingredient.measure || "")}
                  </span>

                  ${escapeHtml(ingredient.ingredient || ingredient.name || "")}
                </span>
              </div>
            `,
          )
          .join("")
      : `
          <p class="text-gray-500 text-center py-4">
            No ingredients available.
          </p>
        `;

  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-lg p-6">

      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">

        <i class="fa-solid fa-list-check text-emerald-600"></i>

        Ingredients

        <span class="text-sm font-normal text-gray-500 ml-auto">
          ${valid.length} items
        </span>

      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <p class="text-gray-500 text-center">
          No instructions available.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-lg p-6">

      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
        Instructions
      </h2>

      <div class="space-y-4">

        ${steps
          .map(
            (step, index) => `
              <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">

                <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  ${index + 1}
                </div>

                <p class="text-gray-700 leading-relaxed pt-2">
                  ${escapeHtml(step)}
                </p>

              </div>
            `,
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
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <p class="text-gray-500 text-center">
          No video available.
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
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <p class="text-gray-500 text-center">
          Invalid video URL.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-lg p-6">

      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-video text-red-500"></i>
        Video Tutorial
      </h2>

      <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">

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

  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">

      <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-chart-pie text-emerald-600"></i>
        Nutrition Facts
      </h2>

      <p class="text-sm text-gray-500 mb-4">
        Per serving
      </p>

      <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">

        <p class="text-sm text-gray-600">
          Calories per serving
        </p>

        <p class="text-4xl font-bold text-emerald-600">
          ${calories}
        </p>

      </div>

      <div class="space-y-4">

        <div>

          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700">
              Protein
            </span>

            <span class="font-bold text-gray-900">
              ${protein}g
            </span>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="bg-emerald-500 h-2 rounded-full"
              style="width:${proteinPercent}%"
            ></div>
          </div>

        </div>

        <div>

          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700">
              Carbs
            </span>

            <span class="font-bold text-gray-900">
              ${carbs}g
            </span>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full"
              style="width:${carbsPercent}%"
            ></div>
          </div>

        </div>

        <div>

          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700">
              Fat
            </span>

            <span class="font-bold text-gray-900">
              ${fat}g
            </span>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="bg-purple-500 h-2 rounded-full"
              style="width:${fatPercent}%"
            ></div>
          </div>

        </div>

        <div>

          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700">
              Fiber
            </span>

            <span class="font-bold text-gray-900">
              ${fiber}g
            </span>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="bg-orange-500 h-2 rounded-full"
              style="width:${fiberPercent}%"
            ></div>
          </div>

        </div>

        <div>

          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700">
              Sugar
            </span>

            <span class="font-bold text-gray-900">
              ${sugar}g
            </span>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="bg-pink-500 h-2 rounded-full"
              style="width:${sugarPercent}%"
            ></div>
          </div>

        </div>

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
      0,
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
      <div class="text-center py-12">

        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-utensils text-3xl text-gray-300"></i>
        </div>

        <p class="text-gray-500 font-medium mb-2">
          No food logged today
        </p>

        <p class="text-gray-400 text-sm mb-4">
          Start tracking your nutrition by logging meals or scanning products
        </p>

        <div class="flex justify-center gap-3">

          <button
            type="button"
            data-foodlog-page="meals"
            id="browse_recipes"
            class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
          >
            <i class="fa-solid fa-plus"></i>
            Browse Recipes
          </button>

          <button
            type="button"
            data-foodlog-page="products"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <i class="fa-solid fa-barcode"></i>
            Scan Product
          </button>

        </div>
      </div>
    `;

    return;
  }

  loggedItemsList.innerHTML = `
    <div class="space-y-3 max-h-96 overflow-y-auto">
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
              class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all"
              data-item-id="${escapeHtml(item?.id ?? "")}"
            >

              <div class="flex items-center gap-4 min-w-0">

                ${
                  image
                    ? `
                      <img
                        src="${escapeHtml(image)}"
                        alt="${escapeHtml(name)}"
                        class="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                    `
                    : `
                      <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <i class="fa-solid ${
                          isProduct ? "fa-box" : "fa-utensils"
                        } text-blue-600 text-xl"></i>
                      </div>
                    `
                }

                <div class="min-w-0">

                  <p class="font-semibold text-gray-900 truncate">
                    ${escapeHtml(name)}
                  </p>

                  <p class="text-sm text-gray-500 truncate">
                    ${escapeHtml(productOrRecipeText)}

                    <span class="mx-1">
                      •
                    </span>

                    <span
                      class="${
                        isProduct ? "text-blue-600" : "text-emerald-600"
                      }"
                    >
                      ${type}
                    </span>
                  </p>

                  <p class="text-xs text-gray-400 mt-1">
                    ${escapeHtml(loggedTime)}
                  </p>

                </div>
              </div>

              <div class="flex items-center gap-4 shrink-0">

                <div class="text-right">
                  <p class="text-lg font-bold text-emerald-600">
                    ${formatFoodLogNumber(calories, 1)}
                  </p>

                  <p class="text-xs text-gray-500">
                    kcal
                  </p>
                </div>

                <div class="hidden md:flex gap-2 text-xs text-gray-500">

                  <span class="px-2 py-1 bg-blue-50 rounded">
                    ${formatFoodLogNumber(protein, 0)}g P
                  </span>

                  <span class="px-2 py-1 bg-amber-50 rounded">
                    ${formatFoodLogNumber(carbs, 0)}g C
                  </span>

                  <span class="px-2 py-1 bg-purple-50 rounded">
                    ${formatFoodLogNumber(fat, 0)}g F
                  </span>

                </div>

                <button
                  type="button"
                  class="remove-foodlog-btn text-gray-400 hover:text-red-500 transition-all p-2"
                  data-item-id="${escapeHtml(item?.id ?? "")}"
                  title="Remove item"
                >
                  <i class="fa-solid fa-trash-can"></i>
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

  loggedItemsCount.textContent = `Logged Items (${items.length})`;
};

export const renderNutritionSummary = (foodLog = []) => {
  const section = document.getElementById("foodlog-today-section");

  if (!section) return;

  const progressGrid = section.querySelector(
    ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4",
  );

  if (!progressGrid) return;

  const cards = progressGrid.querySelectorAll(":scope > div");

  if (cards.length < 4) return;

  const items = getTodayFoodLog(foodLog);

  const goals = {
    calories: 2000,
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
    dangerText,
  }) => {
    const percentage = Math.min(Math.round((value / goal) * 100), 100);

    const exceeded = value > goal;

    const percentageElement = card.querySelector(
      ".flex.items-center.justify-between.mb-2 span:last-child",
    );

    const bar = card.querySelector(".w-full.bg-gray-200 > div");

    const valueElement = card.querySelector(
      ".flex.items-center.justify-between.text-xs span:first-child",
    );

    const goalElement = card.querySelector(
      ".flex.items-center.justify-between.text-xs span:last-child",
    );

    if (percentageElement) {
      percentageElement.textContent = `${percentage}%`;

      percentageElement.className = exceeded
        ? "text-xs text-red-500"
        : `text-xs ${normalText}`;
    }

    if (bar) {
      bar.style.width = `${percentage}%`;

      bar.classList.remove(
        "bg-emerald-500",
        "bg-blue-500",
        "bg-amber-500",
        "bg-purple-500",
        "bg-red-500",
      );

      bar.classList.add(exceeded ? "bg-red-500" : normalBar);
    }

    if (valueElement) {
      valueElement.textContent = `${Math.round(value)} ${
        goal === goals.calories ? "kcal" : "g"
      }`;

      valueElement.className = exceeded
        ? "font-bold text-red-600"
        : `font-bold ${normalText}`;
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
    normalText: "text-emerald-600",
    normalBar: "bg-emerald-500",
    dangerText: "text-red-600",
  });

  updateCard({
    card: cards[1],
    value: totals.protein,
    goal: goals.protein,
    normalText: "text-blue-600",
    normalBar: "bg-blue-500",
    dangerText: "text-red-600",
  });

  updateCard({
    card: cards[2],
    value: totals.carbs,
    goal: goals.carbs,
    normalText: "text-amber-600",
    normalBar: "bg-amber-500",
    dangerText: "text-red-600",
  });

  updateCard({
    card: cards[3],
    value: totals.fat,
    goal: goals.fat,
    normalText: "text-purple-600",
    normalBar: "bg-purple-500",
    dangerText: "text-red-600",
  });
};

export const toggleClearFoodLog = (foodLog = []) => {
  if (!clearFoodLogButton) return;

  const items = getTodayFoodLog(foodLog);

  clearFoodLogButton.style.display = items.length > 0 ? "inline-flex" : "none";
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
            class="text-center ${day.today ? "bg-indigo-100 rounded-xl" : ""}"
          >

            <p class="text-xs text-gray-500 mb-1">
              ${escapeHtml(day.day)}
            </p>

            <p class="text-sm font-medium text-gray-900">
              ${day.number}
            </p>

            <div
              class="mt-2 ${
                day.calories > 0 ? "text-emerald-600" : "text-gray-300"
              }"
            >

              <p class="text-lg font-bold">
                ${Math.round(day.calories)}
              </p>

              <p class="text-xs">
                kcal
              </p>

            </div>

            ${
              day.items > 0
                ? `
                  <p class="text-xs text-gray-400 mt-1">
                    ${day.items} ${day.items === 1 ? "item" : "items"}
                  </p>
                `
                : ""
            }

          </div>
        `,
    )
    .join("");
};

export const renderFoodLogStats = (foodLog = []) => {
  const section = document.getElementById("foodlog-section");

  if (!section) return;

  const days = getWeekData(foodLog);

  const weeklyCalories = days.reduce((total, day) => total + day.calories, 0);

  const weeklyAverage = Math.round(weeklyCalories / 7);

  const totalItems = days.reduce((total, day) => total + day.items, 0);

  const daysOnGoal = days.filter((day) => day.calories >= 2000).length;

  const cards = section.querySelectorAll(
    ".grid.grid-cols-1.md\\:grid-cols-3 > div",
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
