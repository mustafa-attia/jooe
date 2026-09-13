# Jooe — Digital Identity & Precision Food Intelligence

The official personal brand web platform of **Jooe**, unifying high-performance personal identity, curated culinary archives, industrial food intelligence, and daily quantitative nutrition tracking.

---

## 💎 Design Philosophy & Identity

- **Foundation**: 70% Neutral Dark (`#07090D`, `#0A101A`, `#101722`)
- **Primary Accent**: Garnet Red (`#A50044`)
- **Secondary Accent**: Barcelona Navy Blue (`#004D98`)
- **Controlled Detail**: 5% Gold (`#EDBB00`)
- **Typography**: Space Grotesk, Plus Jakarta Sans, and JetBrains Mono

---

## 🏛 Platform Architecture

1. **Vision & Identity (`#/home`)**:
   - Hero introducing Jooe's mission and philosophy.
   - Editorial high-definition portrait with glowing status and macro metrics.
   - Core operational pillars linking directly to system modules.

2. **Culinary Archive (`#/meals`)**:
   - Global gastronomy catalog powered by MealDB.
   - Intelligent search, category filters, and regional cuisine tags.
   - Detailed recipe blueprint with dynamic ingredient checklists and preparation steps.

3. **Food Intelligence (`#/products`)**:
   - OpenFoodFacts product search and barcode lookup engine.
   - Real-time Nutri-Score (A-E) and Nova group indicators.

4. **Performance Protocol (`#/foodlog`)**:
   - Quantitative caloric and macronutrient logging engine.
   - 7-day trend visualization and consistency tracker.
   - Backwards-compatible persistent local storage (`jooe_food_log`).

---

## 🚀 Running the Application

Because the project uses standard ES6 modules:
```bash
# Option A: Start a lightweight HTTP server
npx serve .
# or Python
python -m http.server 8000
```
Open your browser at `http://localhost:8000` or the served port.

### Nutrition analysis configuration

Nutrition analysis requires the NutriPlan API's `x-api-key`. The key is not
bundled into the frontend. Configure it at runtime before loading the app:

```html
<script>
   window.NUTRIPLAN_NUTRITION_API_KEY = "your-key";
</script>
```

For production, prefer injecting this through a server-side proxy so the
private key is never exposed to browser users.
