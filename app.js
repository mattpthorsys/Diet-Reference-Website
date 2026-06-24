/* ==========================================================================
   State & Initial Configurations
   ========================================================================== */

const state = {
  theme: 'dark',
  activeTab: 'dashboard',
  servings: 4,
  budgetMode: false,
  parfaitPathway: 'oats', // 'oats' or 'lowcarb'
  plate: {
    veg: 50,
    prot: 25,
    starch: 25
  },
  shoppingList: []
};

// Base recipe ingredients per single serving (1 serving)
const recipeBases = {
  stew: [
    { name: 'brown or green lentils, dry', qty: 45, unit: 'g', zone: 'bulk', alt: 'generic brown lentils' },
    { name: 'firm tofu, cubed', qty: 75, unit: 'g', zone: 'asian', alt: 'supermarket own-brand firm tofu' },
    { name: 'sweet potato or potato, diced', qty: 75, unit: 'g', zone: 'greengrocer', alt: 'ordinary dirty potatoes' },
    { name: 'cauliflower, florets', qty: 100, unit: 'g', zone: 'greengrocer', alt: 'frozen cauliflower florets' },
    { name: 'carrots, sliced', qty: 50, unit: 'g', zone: 'greengrocer', alt: 'bulk carrots' },
    { name: 'celery, sliced', qty: 37.5, unit: 'g', zone: 'greengrocer', alt: 'celery stalks' },
    { name: 'onion, diced', qty: 37.5, unit: 'g', zone: 'greengrocer', alt: 'brown onions' },
    { name: 'garlic, minced', qty: 1, unit: 'clove', zone: 'greengrocer', alt: 'jar minced garlic' },
    { name: 'tinned chopped tomatoes (no salt)', qty: 0.5, unit: 'tin', zone: 'supermarket', alt: 'home brand tinned tomatoes' },
    { name: 'spinach or kale', qty: 37.5, unit: 'g', zone: 'supermarket', alt: 'frozen spinach blocks' },
    { name: 'lower-sodium tamari or soy sauce', qty: 0.5, unit: 'tbsp', zone: 'asian', alt: 'supermarket house brand soy' },
    { name: 'extra virgin olive oil', qty: 0.5, unit: 'tbsp', zone: 'supermarket', alt: 'standard cooking olive oil' },
    { name: 'lemon juice or vinegar', qty: 0.5, unit: 'tbsp', zone: 'greengrocer', alt: 'bottled lemon juice' },
    { name: 'water or low-salt stock', qty: 250, unit: 'ml', zone: 'supermarket', alt: 'plain water / home stock' }
  ],
  bowl: [
    { name: 'mushrooms, sliced', qty: 200, unit: 'g', zone: 'greengrocer', alt: 'canned sliced mushrooms' },
    { name: 'cucumber, chopped', qty: 0.5, unit: 'large', zone: 'greengrocer', alt: 'local cucumber' },
    { name: 'kale or mixed leafy greens', qty: 75, unit: 'g', zone: 'greengrocer', alt: 'shredded cabbage / slaw mix' },
    { name: 'edamame, tofu, or chickpeas', qty: 100, unit: 'g', zone: 'supermarket', alt: 'canned drained chickpeas' },
    { name: 'olive or canola oil', qty: 0.5, unit: 'tbsp', zone: 'supermarket', alt: 'canola oil' },
    { name: 'apple cider vinegar or rice vinegar', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'white vinegar' },
    { name: 'lemon juice', qty: 0.5, unit: 'tbsp', zone: 'greengrocer', alt: 'bottled lemon juice' },
    { name: 'nutritional yeast (savoury)', qty: 1, unit: 'tbsp', zone: 'bulk', alt: 'omit / home spices' },
    { name: 'sesame seeds', qty: 0.5, unit: 'tbsp', zone: 'bulk', alt: 'sunflower seeds' }
  ],
  parfait: {
    oats: [
      { name: 'rolled or steel-cut oats', qty: 35, unit: 'g', zone: 'bulk', alt: 'supermarket rolled oats' },
      { name: 'chia seeds', qty: 10, unit: 'g', zone: 'supermarket', alt: 'flaxseeds only' },
      { name: 'ground flaxseed', qty: 10, unit: 'g', zone: 'supermarket', alt: 'ground linseed' },
      { name: 'plain unsweetened yoghurt / soy yoghurt', qty: 135, unit: 'g', zone: 'supermarket', alt: 'supermarket brand Greek yoghurt' },
      { name: 'milk or fortified unsweetened soy drink', qty: 110, unit: 'ml', zone: 'supermarket', alt: 'generic soy milk' },
      { name: 'berries, fresh or frozen', qty: 110, unit: 'g', zone: 'supermarket', alt: 'frozen mixed berries' },
      { name: 'nuts, chopped', qty: 12.5, unit: 'g', zone: 'bulk', alt: 'peanuts' },
      { name: 'cinnamon', qty: 0.25, unit: 'tsp', zone: 'bulk', alt: 'cinnamon powder' }
    ],
    lowcarb: [
      { name: 'rolled or steel-cut oats', qty: 12.5, unit: 'g', zone: 'bulk', alt: 'supermarket rolled oats' },
      { name: 'chia seeds', qty: 15, unit: 'g', zone: 'supermarket', alt: 'chia seeds' },
      { name: 'ground flaxseed', qty: 15, unit: 'g', zone: 'supermarket', alt: 'ground flaxseed' },
      { name: 'plain unsweetened yoghurt / soy yoghurt', qty: 135, unit: 'g', zone: 'supermarket', alt: 'supermarket brand Greek yoghurt' },
      { name: 'milk or fortified unsweetened soy drink', qty: 110, unit: 'ml', zone: 'supermarket', alt: 'generic soy milk' },
      { name: 'berries, fresh or frozen', qty: 110, unit: 'g', zone: 'supermarket', alt: 'frozen mixed berries' },
      { name: 'nuts, chopped', qty: 20, unit: 'g', zone: 'bulk', alt: 'peanuts' },
      { name: 'cinnamon', qty: 0.25, unit: 'tsp', zone: 'bulk', alt: 'cinnamon powder' }
    ]
  }
};

// Default shopping checklist items (combining recipes for default batch prep)
const defaultShoppingList = [
  { name: 'Brown or green lentils', qty: '180g', zone: 'bulk', checked: false },
  { name: 'Rolled oats', qty: '80g', zone: 'bulk', checked: false },
  { name: 'Nutritional yeast', qty: '2 tbsp', zone: 'bulk', checked: false },
  { name: 'Cinnamon & Spices', qty: 'To taste', zone: 'bulk', checked: false },
  { name: 'Chia & Flax seeds', qty: '40g total', zone: 'supermarket', checked: false },
  { name: 'Plain unsweetened Greek or soy yoghurt', qty: '300g', zone: 'supermarket', checked: false },
  { name: 'Fortified unsweetened soy drink / milk', qty: '250ml', zone: 'supermarket', checked: false },
  { name: 'Frozen mixed berries', qty: '250g', zone: 'supermarket', checked: false },
  { name: 'Tinned chopped tomatoes (no salt)', qty: '2 tins', zone: 'supermarket', checked: false },
  { name: 'Frozen spinach or kale', qty: '150g', zone: 'supermarket', checked: false },
  { name: 'Cauliflower', qty: '1 head (400g)', zone: 'greengrocer', checked: false },
  { name: 'Sweet potato', qty: '300g', zone: 'greengrocer', checked: false },
  { name: 'Carrots, Celery, Onions', qty: 'Bulk pack', zone: 'greengrocer', checked: false },
  { name: 'Cucumber & Lemon', qty: '1 each', zone: 'greengrocer', checked: false },
  { name: 'Fresh mushrooms', qty: '400g', zone: 'greengrocer', checked: false },
  { name: 'Firm tofu', qty: '300g', zone: 'asian', checked: false },
  { name: 'Lower-sodium tamari or soy sauce', qty: '1 bottle', zone: 'asian', checked: false }
];

// Biochemical node details text map
const nodeDetails = {
  high: `<h4>High Confidence Mechanisms (WHO, NHS & Heart Foundation Standard)</h4>
         <p><strong>Fibre & Satiety</strong>: Viscous soluble fibres (like beta-glucan in oats and pectins in carrots/apples) slow gastric emptying, extending physical fullness. Insoluble fibres from lentils and greens bulk stool, signalling mechanoreceptors in the gut to limit appetite.</p>
         <p><strong>Sodium & Blood Pressure</strong>: Restricting sodium intake to under 2g/day (equivalent to &lt;5g salt) decreases blood volume and peripheral vascular resistance, producing clinically proven reductions in blood pressure, particularly in hypertensive populations.</p>
         <p><strong>Unsaturated Fats</strong>: Replacing saturated fats (from butter, coconut oil, animal fats) with mono- and polyunsaturated fats (from measured olive oil, seeds, and nuts) reliably improves serum lipid profiles (lowering LDL-C and ApoB).</p>`,
  mod: `<h4>Moderate Confidence Mechanisms (UPF Reduction)</h4>
        <p><strong>Ultra-Processed Food Avoidance</strong>: Formulated foods (UPFs) bypass natural satiety mechanisms through hyper-palatability (engineered fat-salt-sugar combinations) and low physical structure. Systematic reviews show positive correlations between high UPF intake and cardiovascular events.</p>
        <p><strong>A controlled 2025 feeding trial</strong> demonstrated rapid adverse metabolic effects of UPF diets even when calories and macronutrient ratios were held identical to unprocessed diets, suggesting that the physical matrix and processing additives themselves disrupt metabolic homeostasis.</p>`,
  low: `<h4>Limited Confidence or Overclaimed Mechanisms</h4>
        <p><strong>Autophagy, Senolysis & NAD+</strong>: The original report asserted that onions or garlic could serve as "senolytics" (clearing aging cells) or that trehalose stimulates autophagy clinically. Current research shows these mechanisms occur in isolated cellular or mouse models at massive doses, with no robust clinical trials proving they slow human aging at culinary levels.</p>
        <p><strong>AGE Reduction (Advanced Glycation End-products)</strong>: While low-temperature, moist cooking is culinary best practice to avoid carcinogens and over-browning, claims that lower-AGE meals slow human biological aging remain hypothesis-generating. A healthy diet works through caloric balance and nutrient quality, not "AGE avoidance theatre."</p>`
};

// Timeline phase descriptions
const phaseDetails = {
  '1': `<h4>Phase 1: Setup (Days 1–7)</h4>
        <p><strong>Priority Actions</strong>: Acquire batch prep containers, kitchen scales, and standard measuring spoons. Clean out pantry sections of ultra-processed snacks. Buy core staples: dry lentils, whole oats, chia, flax, low-salt stock, and lower-sodium soy sauce.</p>
        <p><strong>Sourcing Tip</strong>: Use Adelaide local markets or bulk stores to keep setup affordable. Standard, generic brands are chemically identical to premium health brands.</p>
        <p><strong>Metrics</strong>: Completion of the first prep batch (stew and breakfasts).</p>`,
  '2': `<h4>Phase 2: Early Adoption (Weeks 2–4)</h4>
        <p><strong>Priority Actions</strong>: Repeat the three core recipes. Standardise plate sizes: fill half with leafy salad/greens, a quarter with tofu/pulse proteins, and a quarter with whole grains or sweet potato starch. Avoid pouring oil by instinct—always measure with spoons.</p>
        <p><strong>Metrics</strong>: Log body-weight trends (weekly average), meal adherence, and hunger ratings between lunches and dinners.</p>`,
  '3': `<h4>Phase 3: Consolidation (Weeks 5–8)</h4>
        <p><strong>Priority Actions</strong>: Maintain the meal routine. If weight loss stalls or levels off, inspect portion sizes or slightly reduce starch/oil portions. Rotate fresh produce based on seasonal pricing at Adelaide markets. Habituate label-reading for hidden sugars/sodium.</p>
        <p><strong>Metrics</strong>: Blood pressure logs (if hypertensive), waist measurements (monthly), and bowel regularity indicators.</p>`,
  '4': `<h4>Phase 4: Optimisation (Weeks 9–12)</h4>
        <p><strong>Priority Actions</strong>: Add a routine physical activity pattern (WHO minimum target: 150 minutes of moderate activity weekly, plus simple muscle strengthening). Refine grocery costs. Introduce protein variety (lean fish or plant alternatives) if desired.</p>
        <p><strong>Metrics</strong>: Physical activity minutes, monthly grocery budgets, and long-term adherence check.</p>`
};

/* ==========================================================================
   Timer Logic
   ========================================================================== */

let timerInterval = null;
let timerSecondsRemaining = 25 * 60; // 25 minutes default

function startTimer() {
  if (timerInterval) return;
  
  timerInterval = setInterval(() => {
    if (timerSecondsRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerSecondsRemaining = 25 * 60;
      playBeepAlert();
      alert("Simmer phase completed! Check lentil tenderness.");
      updateTimerDisplay();
      return;
    }
    timerSecondsRemaining--;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSecondsRemaining = 25 * 60;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const min = Math.floor(timerSecondsRemaining / 60);
  const sec = timerSecondsRemaining % 60;
  document.getElementById('stew-timer-clock').innerText = 
    `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// Synthesize premium double-beep using browser Web Audio API
function playBeepAlert() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playBeep = (time, freq) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gainNode.gain.setValueAtTime(0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(time);
      osc.stop(time + 0.18);
    };
    
    // Play double beep
    const now = audioCtx.currentTime;
    playBeep(now, 880);
    playBeep(now + 0.25, 880);
  } catch (e) {
    console.error("Web Audio alert failed to initialize:", e);
  }
}

/* ==========================================================================
   Interactive Plate Logic
   ========================================================================== */

function updatePlateVisualizer() {
  const plateEl = document.getElementById('interactive-plate');
  const labelVeg = document.getElementById('label-val-veg');
  const labelProt = document.getElementById('label-val-prot');
  const labelStarch = document.getElementById('label-val-starch');
  const evalBox = document.getElementById('plate-eval-box');
  
  // Set CSS variables for conic gradient
  plateEl.style.setProperty('--veg-pct', `${state.plate.veg}%`);
  plateEl.style.setProperty('--prot-pct', `${state.plate.prot}%`);
  plateEl.style.setProperty('--starch-pct', `${state.plate.starch}%`);
  
  // Update text labels
  labelVeg.innerText = `${Math.round(state.plate.veg)}%`;
  labelProt.innerText = `${Math.round(state.plate.prot)}%`;
  labelStarch.innerText = `${Math.round(state.plate.starch)}%`;
  
  // Sync sliders
  document.getElementById('slider-veg').value = state.plate.veg;
  document.getElementById('slider-prot').value = state.plate.prot;
  document.getElementById('slider-starch').value = state.plate.starch;
  
  // Evaluate diet plate selection
  if (state.plate.veg >= 45) {
    evalBox.className = "evidence-box success";
    evalBox.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="box-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <div><strong>Optimal Plate (Successor Rationale)</strong>: Grounded in WHO & Heart Foundation guidance. High vegetable volume boosts fiber-driven satiety and restricts total calorie density while securing key micronutrients. Suitable for sustainable weight control.</div>
    `;
  } else if (state.plate.veg >= 25 && state.plate.veg < 45) {
    evalBox.className = "evidence-box warning"; // styling handles warning colors
    evalBox.style.borderColor = "rgba(245, 158, 11, 0.2)";
    evalBox.style.backgroundColor = "var(--secondary-glow)";
    evalBox.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" class="box-icon" style="color:var(--secondary);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div style="color:var(--text-primary);"><strong>Sub-optimal Fibre</strong>: Low vegetable proportion increases calorie density. Fullness window after eating is shortened, potentially causing mid-afternoon energy crashes and high snacking desires.</div>
    `;
  } else {
    evalBox.className = "evidence-box danger";
    evalBox.style.borderColor = "rgba(239, 68, 68, 0.2)";
    evalBox.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
    evalBox.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" class="box-icon" style="color:var(--danger);"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div style="color:var(--text-primary);"><strong>Caloric Creep Warning</strong>: Plate dominated by starches or lipids. Risk of unintended caloric surplus and high postprandial glucose surges. Difficult for long-term weight management.</div>
    `;
  }
}

// Adjust sliders so that they always sum to exactly 100%
function adjustPlateProportions(changedSlider, newValue) {
  newValue = parseFloat(newValue);
  const currentVeg = state.plate.veg;
  const currentProt = state.plate.prot;
  const currentStarch = state.plate.starch;
  
  if (changedSlider === 'veg') {
    const diff = newValue - currentVeg;
    const sumOther = currentProt + currentStarch;
    state.plate.veg = newValue;
    if (sumOther > 0) {
      state.plate.prot = Math.max(10, currentProt - (diff * currentProt / sumOther));
      state.plate.starch = Math.max(10, 100 - state.plate.veg - state.plate.prot);
    }
  } else if (changedSlider === 'prot') {
    const diff = newValue - currentProt;
    const sumOther = currentVeg + currentStarch;
    state.plate.prot = newValue;
    if (sumOther > 0) {
      state.plate.veg = Math.max(10, currentVeg - (diff * currentVeg / sumOther));
      state.plate.starch = Math.max(10, 100 - state.plate.veg - state.plate.prot);
    }
  } else if (changedSlider === 'starch') {
    const diff = newValue - currentStarch;
    const sumOther = currentVeg + currentProt;
    state.plate.starch = newValue;
    if (sumOther > 0) {
      state.plate.veg = Math.max(10, currentVeg - (diff * currentVeg / sumOther));
      state.plate.prot = Math.max(10, 100 - state.plate.veg - state.plate.starch);
    }
  }
  
  // Re-normalize to make sure sum is exactly 100
  const sum = state.plate.veg + state.plate.prot + state.plate.starch;
  state.plate.veg = (state.plate.veg / sum) * 100;
  state.plate.prot = (state.plate.prot / sum) * 100;
  state.plate.starch = (state.plate.starch / sum) * 100;
  
  updatePlateVisualizer();
}

/* ==========================================================================
   Portion Calculator Logic
   ========================================================================== */

function calculateSatietyPortions() {
  const calories = parseInt(document.getElementById('calc-calories').value) || 2000;
  const activity = parseFloat(document.getElementById('calc-activity').value) || 1.375;
  
  // Calculate recommended portions based on calorie needs
  const calculatedEnergyNeed = calories;
  
  // 1. Oats Breakfast (base 70g oats at 2000kcal)
  const oatsPortion = Math.round((calculatedEnergyNeed / 2000) * 70);
  // 2. Lunch Salad Greens (base 150g greens at 2000kcal)
  const greensPortion = Math.round((calculatedEnergyNeed / 2000) * 150);
  // 3. Dinner Lentils per serv (base 45g dry lentils at 2000kcal)
  const lentilPortion = Math.round((calculatedEnergyNeed / 2000) * 45);
  
  document.getElementById('calc-breakfast-oats').innerText = `${oatsPortion}g oats`;
  document.getElementById('calc-lunch-greens').innerText = `${greensPortion}g greens`;
  document.getElementById('calc-dinner-lentils').innerText = `${lentilPortion}g lentils / serv`;
}

/* ==========================================================================
   Recipe Scaling & Rendering Logic
   ========================================================================== */

function renderParfaitIngredients() {
  const listEl = document.getElementById('parfait-ingredients-list');
  listEl.innerHTML = '';
  
  const pathway = state.parfaitPathway;
  const bases = recipeBases.parfait[pathway];
  
  bases.forEach(ing => {
    const qtyScaled = (ing.qty * (state.servings / 2)).toFixed(1).replace(/\.0$/, '');
    const displayQty = ing.unit ? `${qtyScaled}${ing.unit}` : qtyScaled;
    const nameStr = state.budgetMode ? ing.alt : ing.name;
    const isSwapped = state.budgetMode && ing.alt !== ing.name;
    
    const li = document.createElement('li');
    li.className = isSwapped ? 'budget-swapped' : '';
    li.innerHTML = `<strong>${displayQty}</strong> ${nameStr}`;
    listEl.appendChild(li);
  });
}

function scaleAllRecipes() {
  document.querySelectorAll('.recipe-servings-display').forEach(el => {
    el.innerText = state.servings;
  });
  
  // 1. Stew ingredients scaling (Base is for 4 servings)
  const stewList = document.querySelector('#recipe-stew .ingredient-list');
  stewList.innerHTML = '';
  recipeBases.stew.forEach(ing => {
    const qtyScaled = (ing.qty * (state.servings / 4)).toFixed(1).replace(/\.0$/, '');
    const displayQty = ing.unit ? `${qtyScaled} ${ing.unit}` : qtyScaled;
    const nameStr = state.budgetMode ? ing.alt : ing.name;
    const isSwapped = state.budgetMode && ing.alt !== ing.name;
    
    const li = document.createElement('li');
    li.className = isSwapped ? 'budget-swapped' : '';
    li.innerHTML = `<span>${nameStr}</span> <strong>${displayQty}</strong>`;
    stewList.appendChild(li);
  });

  // 2. Lunch bowl ingredients scaling (Base is for 2 servings)
  const bowlList = document.querySelector('#recipe-bowl .ingredient-list');
  bowlList.innerHTML = '';
  recipeBases.bowl.forEach(ing => {
    const qtyScaled = (ing.qty * (state.servings / 2)).toFixed(1).replace(/\.0$/, '');
    const displayQty = ing.unit ? `${qtyScaled} ${ing.unit}` : qtyScaled;
    const nameStr = state.budgetMode ? ing.alt : ing.name;
    const isSwapped = state.budgetMode && ing.alt !== ing.name;
    
    const li = document.createElement('li');
    li.className = isSwapped ? 'budget-swapped' : '';
    li.innerHTML = `<span>${nameStr}</span> <strong>${displayQty}</strong>`;
    bowlList.appendChild(li);
  });

  // 3. Parfait ingredients scaling
  renderParfaitIngredients();
}

/* ==========================================================================
   Shopping List State Manager
   ========================================================================== */

function loadShoppingList() {
  const localData = localStorage.getItem('successor_shopping_list');
  if (localData) {
    state.shoppingList = JSON.parse(localData);
  } else {
    // Populate with defaults
    state.shoppingList = defaultShoppingList.map(item => ({ ...item }));
    saveShoppingList();
  }
  renderShoppingList();
}

function saveShoppingList() {
  localStorage.setItem('successor_shopping_list', JSON.stringify(state.shoppingList));
}

function renderShoppingList() {
  const zones = ['supermarket', 'greengrocer', 'bulk', 'asian'];
  
  zones.forEach(zone => {
    const listEl = document.getElementById(`list-${zone}`);
    listEl.innerHTML = '';
    
    const items = state.shoppingList.filter(item => item.zone === zone);
    
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'shop-item-row';
      
      const checkLabel = document.createElement('label');
      checkLabel.className = 'shop-item-check';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.checked;
      checkbox.addEventListener('change', () => {
        item.checked = checkbox.checked;
        saveShoppingList();
        renderShoppingList();
      });
      
      const span = document.createElement('span');
      span.innerText = `${item.name} (${item.qty})`;
      
      checkLabel.appendChild(checkbox);
      checkLabel.appendChild(span);
      
      // Add Adelaide specific local tip badge on hover/display
      if (zone === 'asian' && item.name.includes('tamari')) {
        const badge = document.createElement('span');
        badge.className = 'adelaide-alt-tip';
        badge.innerText = 'Grote St Grocer';
        checkLabel.appendChild(badge);
      }
      if (zone === 'greengrocer' && item.name.includes('sweet potato')) {
        const badge = document.createElement('span');
        badge.className = 'adelaide-alt-tip';
        badge.innerText = 'Central Market';
        checkLabel.appendChild(badge);
      }
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-item-btn';
      deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      deleteBtn.addEventListener('click', () => {
        state.shoppingList = state.shoppingList.filter(i => i !== item);
        saveShoppingList();
        renderShoppingList();
      });
      
      li.appendChild(checkLabel);
      li.appendChild(deleteBtn);
      
      listEl.appendChild(li);
    });
  });
}

function addRecipeIngredientsToShoppingList(recipeKey) {
  let ingredients = [];
  
  if (recipeKey === 'stew') {
    ingredients = recipeBases.stew;
  } else if (recipeKey === 'bowl') {
    ingredients = recipeBases.bowl;
  } else if (recipeKey === 'parfait') {
    ingredients = recipeBases.parfait[state.parfaitPathway];
  }
  
  ingredients.forEach(ing => {
    // Determine quantity based on current global servings
    let multiplier = 1;
    if (recipeKey === 'stew') multiplier = state.servings / 4;
    if (recipeKey === 'bowl') multiplier = state.servings / 2;
    if (recipeKey === 'parfait') multiplier = state.servings / 2;
    
    const calculatedQty = (ing.qty * multiplier).toFixed(1).replace(/\.0$/, '');
    const qtyStr = ing.unit ? `${calculatedQty}${ing.unit}` : calculatedQty;
    const nameStr = state.budgetMode ? ing.alt : ing.name;
    
    // Check if ingredient exists, combine quantities or add new
    const existing = state.shoppingList.find(item => item.name.toLowerCase() === nameStr.toLowerCase());
    
    if (existing) {
      existing.qty = `${qtyStr} (added)`;
    } else {
      state.shoppingList.push({
        name: nameStr,
        qty: qtyStr,
        zone: ing.zone,
        checked: false
      });
    }
  });
  
  saveShoppingList();
  renderShoppingList();
  
  alert(`Ingredients for ${recipeKey === 'stew' ? 'Dinner Stew' : recipeKey === 'bowl' ? 'Lunch Bowl' : 'Breakfast Parfait'} added to your shopping list!`);
}

/* ==========================================================================
   Implementation Logs & History
   ========================================================================== */

function loadHealthLogs() {
  const logsTable = document.getElementById('logs-tbody');
  logsTable.innerHTML = '';
  
  const localLogs = localStorage.getItem('successor_health_logs');
  if (localLogs) {
    const logs = JSON.parse(localLogs);
    
    if (logs.length === 0) {
      logsTable.innerHTML = `<tr id="empty-table-row"><td colspan="6" class="text-center">No logs logged yet. Submit your first entry on the left!</td></tr>`;
      return;
    }
    
    // Sort reverse chronological
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    logs.forEach(log => {
      const tr = document.createElement('tr');
      
      const displayDate = new Date(log.date).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'short'
      });
      
      const bpStr = (log.bpSys && log.bpDia) ? `${log.bpSys}/${log.bpDia}` : '—';
      const waistStr = log.waist ? `${log.waist}cm` : '—';
      
      tr.innerHTML = `
        <td><strong>${displayDate}</strong></td>
        <td>${log.weight}kg</td>
        <td>${waistStr}</td>
        <td>${bpStr}</td>
        <td><span class="badge badge-strong">${log.adherence}%</span></td>
        <td>${log.satiety}/5</td>
      `;
      logsTable.appendChild(tr);
    });
  } else {
    logsTable.innerHTML = `<tr id="empty-table-row"><td colspan="6" class="text-center">No logs logged yet. Submit your first entry on the left!</td></tr>`;
  }
}

function submitHealthLog(e) {
  e.preventDefault();
  
  const logEntry = {
    date: new Date().toISOString(),
    weight: parseFloat(document.getElementById('log-weight').value),
    waist: parseFloat(document.getElementById('log-waist').value) || null,
    bpSys: parseInt(document.getElementById('log-bp-sys').value) || null,
    bpDia: parseInt(document.getElementById('log-bp-dia').value) || null,
    adherence: parseInt(document.getElementById('log-adherence').value),
    satiety: parseInt(document.getElementById('log-satiety').value),
    notes: document.getElementById('log-notes').value || ''
  };
  
  let logs = [];
  const localLogs = localStorage.getItem('successor_health_logs');
  if (localLogs) {
    logs = JSON.parse(localLogs);
  }
  
  logs.push(logEntry);
  localStorage.setItem('successor_health_logs', JSON.stringify(logs));
  
  // Reset form inputs except weight
  document.getElementById('log-waist').value = '';
  document.getElementById('log-bp-sys').value = '';
  document.getElementById('log-bp-dia').value = '';
  document.getElementById('log-notes').value = '';
  
  loadHealthLogs();
  alert("Health log saved successfully!");
}

/* ==========================================================================
   Event Bindings & Page Setup
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // Set date display
  const today = new Date();
  document.getElementById('current-date-display').innerText = 
    `Today's Date: ${today.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

  // Tab switching setup
  const navButtons = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      navButtons.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      
      btn.classList.add('active');
      const targetEl = document.getElementById(targetTab);
      if (targetEl) targetEl.classList.add('active');
      
      state.activeTab = targetTab;
      
      // Auto-focus table scroll if audit tab loaded
      if (targetTab === 'audit') {
        document.getElementById('audit-search').focus();
      }
    });
  });

  // Dark/Light Theme Switcher
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('successor_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  state.theme = savedTheme;
  
  themeToggle.addEventListener('click', () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('successor_theme', newTheme);
    state.theme = newTheme;
  });

  /* ====================================
     Dashboard Tab Listeners
     ==================================== */
  
  // Interactive Plate preset triggers
  document.getElementById('btn-preset-successor').addEventListener('click', (e) => {
    document.querySelectorAll('.preset-buttons button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.plate = { veg: 50, prot: 25, starch: 25 };
    updatePlateVisualizer();
  });
  
  document.getElementById('btn-preset-standard').addEventListener('click', (e) => {
    document.querySelectorAll('.preset-buttons button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.plate = { veg: 15, prot: 25, starch: 60 };
    updatePlateVisualizer();
  });
  
  document.getElementById('btn-preset-extreme').addEventListener('click', (e) => {
    document.querySelectorAll('.preset-buttons button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.plate = { veg: 10, prot: 30, starch: 60 };
    updatePlateVisualizer();
  });

  // Plate Sliders
  document.getElementById('slider-veg').addEventListener('input', (e) => {
    adjustPlateProportions('veg', e.target.value);
  });
  document.getElementById('slider-prot').addEventListener('input', (e) => {
    adjustPlateProportions('prot', e.target.value);
  });
  document.getElementById('slider-starch').addEventListener('input', (e) => {
    adjustPlateProportions('starch', e.target.value);
  });

  // Target calorie calculator triggers
  document.getElementById('calc-calories').addEventListener('input', calculateSatietyPortions);
  document.getElementById('calc-activity').addEventListener('change', calculateSatietyPortions);
  
  // Biochemical Map interaction
  document.querySelectorAll('.timeline-node').forEach(node => {
    node.addEventListener('click', () => {
      document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      
      const nodeKey = node.getAttribute('data-node');
      document.getElementById('node-detail-text').innerHTML = nodeDetails[nodeKey];
    });
  });

  /* ====================================
     Recipe Tab Listeners
     ==================================== */
  
  // Servings scale slider
  const servingsSlider = document.getElementById('servings-global');
  const servingsVal = document.getElementById('servings-global-val');
  servingsSlider.addEventListener('input', (e) => {
    state.servings = parseInt(e.target.value);
    servingsVal.innerText = `${state.servings} Servings`;
    scaleAllRecipes();
  });

  // Budget substitutions toggle
  document.getElementById('toggle-budget-mode').addEventListener('change', (e) => {
    state.budgetMode = e.target.checked;
    scaleAllRecipes();
  });

  // Recipe pathways toggle for Parfait
  document.getElementById('btn-pathway-oats').addEventListener('click', (e) => {
    document.querySelectorAll('.recipe-pathways button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.parfaitPathway = 'oats';
    scaleAllRecipes();
  });
  
  document.getElementById('btn-pathway-lowcarb').addEventListener('click', (e) => {
    document.querySelectorAll('.recipe-pathways button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.parfaitPathway = 'lowcarb';
    scaleAllRecipes();
  });

  // Card sub-tab navigations
  document.querySelectorAll('.recipe-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.recipe-card');
      const targetTab = btn.getAttribute('data-recipe-tab');
      
      // Remove active from sibling buttons
      card.querySelectorAll('.recipe-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle visibility
      card.querySelectorAll('.recipe-tab-content').forEach(c => c.classList.remove('active'));
      
      // Dynamic ID selection based on recipe key
      const recipeId = card.getAttribute('id').replace('recipe-', '');
      card.querySelector(`#${recipeId}-${targetTab}`).classList.add('active');
    });
  });

  // Add to shopping list triggers
  document.querySelectorAll('.add-to-list-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const recipeKey = btn.getAttribute('data-recipe');
      addRecipeIngredientsToShoppingList(recipeKey);
    });
  });

  // Simmer Timer control binds
  document.getElementById('btn-stew-timer-start').addEventListener('click', startTimer);
  document.getElementById('btn-stew-timer-pause').addEventListener('click', pauseTimer);
  document.getElementById('btn-stew-timer-reset').addEventListener('click', resetTimer);

  /* ====================================
     Shopping List Listeners
     ==================================== */
  
  // Custom item add submit
  document.getElementById('add-item-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('item-name');
    const zoneSelect = document.getElementById('item-zone');
    
    state.shoppingList.push({
      name: nameInput.value,
      qty: 'Custom added',
      zone: zoneSelect.value,
      checked: false
    });
    
    nameInput.value = '';
    saveShoppingList();
    renderShoppingList();
  });

  // Clear checked shopping items
  document.getElementById('btn-clear-shopping').addEventListener('click', () => {
    state.shoppingList = state.shoppingList.filter(item => !item.checked);
    saveShoppingList();
    renderShoppingList();
  });

  // Reset default shopping list
  document.getElementById('btn-reset-shopping').addEventListener('click', () => {
    if (confirm("Reset shopping list to report baseline defaults? Your additions will be deleted.")) {
      state.shoppingList = defaultShoppingList.map(item => ({ ...item }));
      saveShoppingList();
      renderShoppingList();
    }
  });

  // Export shopping list to plain text
  document.getElementById('btn-export-shopping').addEventListener('click', () => {
    const lines = ["SUCCESSOR HEALTH SHOPPING LIST", "=============================="];
    
    const zones = {
      supermarket: "SUPERMARKET (Staples & Cold)",
      greengrocer: "GREENGROCER & MARKET (Fresh Produce)",
      bulk: "BULK SHOP (Dry Grains & Spices)",
      asian: "ASIAN GROCER (Tofu & Seasonings)"
    };
    
    Object.keys(zones).forEach(key => {
      const items = state.shoppingList.filter(i => i.zone === key && !i.checked);
      if (items.length > 0) {
        lines.push(`\n[${zones[key]}]`);
        items.forEach(i => {
          lines.push(`- [ ] ${i.name} (${i.qty})`);
        });
      }
    });
    
    const fullText = lines.join('\n');
    
    navigator.clipboard.writeText(fullText).then(() => {
      alert("Shopping list copied to clipboard in text checklist format!");
    }).catch(err => {
      alert("Failed to copy list: " + err);
    });
  });

  /* ====================================
     Roadmap & Logger Tab Listeners
     ==================================== */
  
  // Implementation phase node triggers
  document.querySelectorAll('.roadmap-step').forEach(step => {
    step.addEventListener('click', () => {
      document.querySelectorAll('.roadmap-step').forEach(s => s.classList.remove('active'));
      step.classList.add('active');
      
      const phaseNum = step.getAttribute('data-phase');
      document.getElementById('phase-desc-box').innerHTML = phaseDetails[phaseNum];
    });
  });

  // Submit health metrics
  document.getElementById('health-log-form').addEventListener('submit', submitHealthLog);

  // Clear health metrics logs
  document.getElementById('btn-clear-logs').addEventListener('click', () => {
    if (confirm("Permanently delete your local health logs history?")) {
      localStorage.removeItem('successor_health_logs');
      loadHealthLogs();
    }
  });

  /* ====================================
     Scientific Audit Tab Search & Filters
     ==================================== */
  
  const searchInput = document.getElementById('audit-search');
  const evidenceFilter = document.getElementById('audit-evidence-filter');
  const auditTable = document.getElementById('audit-table-el');
  const tableRows = auditTable.querySelectorAll('tbody tr');
  
  function filterAuditTable() {
    const query = searchInput.value.toLowerCase();
    const filterVal = evidenceFilter.value;
    
    tableRows.forEach(row => {
      const topicText = row.children[0].innerText.toLowerCase();
      const rationaleText = row.children[4].innerText.toLowerCase();
      const rowEvidence = row.getAttribute('data-evidence');
      
      const matchesSearch = topicText.includes(query) || rationaleText.includes(query);
      const matchesEvidence = (filterVal === 'all') || (rowEvidence === filterVal);
      
      if (matchesSearch && matchesEvidence) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  searchInput.addEventListener('input', filterAuditTable);
  evidenceFilter.addEventListener('change', filterAuditTable);

  // Initial tab loading/refresh routines
  updatePlateVisualizer();
  calculateSatietyPortions();
  scaleAllRecipes();
  loadShoppingList();
  loadHealthLogs();
});
