# Successor Health Hub

An interactive, premium, science-backed cardiometabolic health reference site. It translates the evidence-based guidelines, adapted recipes, and prioritised roadmap of the **Successor Health Report** into an active digital companion.

## 🚀 Getting Started

The project is built entirely on native web standards (HTML5, CSS3, Vanilla JS) and has no compile or build steps.

### Run Locally

There are three ways to run this project locally from its directory:

#### Option 1: Double-Click the Starter Script (Windows)
Simply double-click the **[run.bat](file:///c:/Users/mpalm/Diet-Reference-Website/run.bat)** file. It will:
- Check for Node.js (via `npx`) or Python to launch a local server on port `8000`.
- Automatically open the website in your default browser.
- Fall back to opening the HTML file directly if no server is installed.

#### Option 2: Using npm
If you have Node.js installed, run:
```bash
npm start
```

#### Option 3: Manual Server Command
You can run any local server tool, such as:
```bash
npx http-server -p 8000
```
Then open **[http://localhost:8000](http://localhost:8000)** in your browser.

## 🎨 Interactive Features

1. **Dashboard & Plate Visualizer**:
   - Adjust sliders to see vegetable (50%), protein (25%), and starch (25%) ratios represented live on a circular plate graphic.
   - Presets for **Successor Diet**, **Standard Western**, and **High-Fat Low-Carb** models.
   - Dynamic satiety portion guide based on daily target calories and activity level.
   - Expanded detail cards showing evidence confidence mapping (High, Moderate, and Limited/Low).

2. **Recipe Hub**:
   - Three adapted recipes: **Adapted Dinner Stew**, **Adapted Lunch Bowl**, and **Adapted Breakfast Parfait**.
   - Global serving size scaler slider (re-computes ingredient counts dynamically).
   - Breakfast pathway switcher (toggles Parfait between Satiety Oats default and Lower-Carb seeds/nuts configuration).
   - Cooking checklists with active-step indicators and interactive Simmer Timer (plays a double-beep audio alert at `00:00`).
   - **Budget Mode** toggle swaps premium ingredients with affordable local alternatives (e.g. frozen spinach instead of fresh).

3. **Smart Shopping List**:
   - Adelaide-localized shopping list divided by store type (Supermarket, Greengrocer, Bulk Shop, Asian Grocer).
   - Checklist items with cross-off animation and list-clearing commands.
   - Form to add custom items to specific stores.
   - Text export copies the checklist structure directly to the clipboard.

4. **Implementation Tracker**:
   - Clickable 12-week roadmap phases detailing setup, early adoption, consolidation, and optimization.
   - Health metrics log form (weight, waist, BP, adherence, and satiety) which saves to `localStorage` and populates a history log table.

5. **Scientific Audit**:
   - Filterable comparison matrix detailing the original report's anti-aging claims vs. successor clinical corrections.
   - Live search bar and evidence-level dropdown filter.

---

## 📁 Project Structure

```
Diet Reference Website/
├── index.html       # Main semantic HTML structure
├── styles.css       # CSS Design System (light/dark modes, layouts, animations)
├── app.js           # Interactive state manager and calculations
├── .gitignore       # Git ignore rules for system & IDE logs
├── README.md        # Project documentation
└── images/          # Generated recipe and hero images
    ├── hero.png
    ├── stew.png
    ├── bowl.png
    └── parfait.png
```

---

## 🛠️ Technical Implementation Details
* **Theme Styling**: Uses CSS Custom Properties (`--bg-primary`, etc.) toggled via `data-theme="dark|light"` attribute on the `<html>` node.
* **Audio Alerts**: Uses the browser's native **Web Audio API** to synthesize beep alerts, avoiding external sound file downloads.
* **State Persistence**: Checklist checks, custom items, theme selections, and logged metrics are retained in browser `localStorage`.
* **Mobile-First Layout**: Automatically wraps the navigation sidebar into a bottom navigation bar for touchscreens, utilizing custom media queries.
