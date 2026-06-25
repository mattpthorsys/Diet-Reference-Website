// @ts-ignore
import { createApp } from '../lib/petite-vue.js';

// Firebase SDK ES Modules loaded via CDN (gstatic)
// These will be cached locally by our Service Worker for offline use.
// @ts-ignore
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
// @ts-ignore
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  connectAuthEmulator,
  User
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
// @ts-ignore
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  connectFirestoreEmulator,
  Firestore
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/* ==========================================================================
   Type Definitions & Interfaces
   ========================================================================== */

interface Ingredient {
  name: string;
  qty: number;
  unit: string;
  zone: 'supermarket' | 'greengrocer' | 'bulk' | 'asian';
  alt: string;
  cupWeight?: number;   // Weight of 1 cup in grams (e.g. oats = 90g)
  tbspWeight?: number;  // Weight of 1 tablespoon in grams (e.g. oats = 5.6g)
}

interface LogEntry {
  id?: string;
  date: string;
  weight: number;
  waist: number | null;
  bpSys: number | null;
  bpDia: number | null;
  adherence: number;
  satiety: number;
  notes: string;
}

interface ShoppingItem {
  id?: string;
  name: string;
  qty: string;
  zone: 'supermarket' | 'greengrocer' | 'bulk' | 'asian';
  checked: boolean;
  custom?: boolean;
}

interface AuditRow {
  topic: string;
  original: string;
  successor: string;
  evidence: 'strong' | 'moderate' | 'limited';
  rationale: string;
}

/* ==========================================================================
   Fallback Mock Data & Constants
   ========================================================================== */

interface Recipe {
  id: string;
  title: string;
  category: 'regular' | 'treat' | 'healthy' | 'longevity' | 'protein-dense';
  defaultServings: number;
  intro: string;
  cookingTime: string;
  typeBadge: string;
  ingredients: any;
  instructions: string[];
  scienceNotes: string[];
  imgUrl: string;
  caloriesPerServing: number | { [pathway: string]: number };
  carbsPerServing: number | { [pathway: string]: number };
  gi: number | { [pathway: string]: number };
}

// Base recipes schema structure matching database document templates
const defaultRecipes: Recipe[] = [
  {
    id: "stew",
    title: "Adapted Dinner Stew",
    category: "longevity",
    defaultServings: 4,
    intro: "A cheap, high-volume batch stew built around lentils, sweet potato, and firm tofu. Focuses on moist, low-temp cooking to support portion-controlled dietary quality.",
    cookingTime: "45 Mins",
    typeBadge: "Stew",
    imgUrl: "images/stew.png",
    caloriesPerServing: 280,
    carbsPerServing: 24,
    gi: 35,
    ingredients: [
      { name: 'brown or green lentils, dry', qty: 45, unit: 'g', zone: 'bulk', alt: 'generic brown lentils', cupWeight: 180, tbspWeight: 11.5 },
      { name: 'firm tofu, cubed', qty: 75, unit: 'g', zone: 'asian', alt: 'supermarket own-brand firm tofu', cupWeight: 220 },
      { name: 'sweet potato or potato, diced', qty: 75, unit: 'g', zone: 'greengrocer', alt: 'ordinary dirty potatoes', cupWeight: 150 },
      { name: 'cauliflower, florets', qty: 100, unit: 'g', zone: 'greengrocer', alt: 'frozen cauliflower florets', cupWeight: 100 },
      { name: 'carrots, sliced', qty: 50, unit: 'g', zone: 'greengrocer', alt: 'bulk carrots', cupWeight: 120 },
      { name: 'celery, sliced', qty: 37.5, unit: 'g', zone: 'greengrocer', alt: 'celery stalks', cupWeight: 100 },
      { name: 'onion, diced', qty: 37.5, unit: 'g', zone: 'greengrocer', alt: 'brown onions', cupWeight: 150 },
      { name: 'garlic, minced', qty: 1, unit: 'clove', zone: 'greengrocer', alt: 'jar minced garlic' },
      { name: 'tinned chopped tomatoes (no salt)', qty: 0.5, unit: 'tin', zone: 'supermarket', alt: 'home brand tinned tomatoes' },
      { name: 'spinach or kale', qty: 37.5, unit: 'g', zone: 'supermarket', alt: 'frozen spinach blocks', cupWeight: 30 },
      { name: 'lower-sodium tamari or soy sauce', qty: 0.5, unit: 'tbsp', zone: 'asian', alt: 'supermarket house brand soy', tbspWeight: 15 },
      { name: 'extra virgin olive oil', qty: 0.5, unit: 'tbsp', zone: 'supermarket', alt: 'standard cooking olive oil', tbspWeight: 14 },
      { name: 'lemon juice or vinegar', qty: 0.5, unit: 'tbsp', zone: 'greengrocer', alt: 'bottled lemon juice', tbspWeight: 15 },
      { name: 'water or low-salt stock', qty: 250, unit: 'ml', zone: 'supermarket', alt: 'plain water / home stock', cupWeight: 250, tbspWeight: 15 }
    ],
    instructions: [
      "Sauté onion, celery, and carrot in 1 tbsp olive oil or a splash of water/stock over medium-low heat until softened, not scorched.",
      "Add garlic and spices (cumin, paprika, black pepper, chili); cook briefly for 1 minute until fragrant.",
      "Add dry lentils, chopped tomatoes, cauliflower florets, diced sweet potato/potato, cubed tofu, and low-salt stock or water.",
      "Simmer gently for 25-30 minutes until the lentils are tender and vegetables are soft. (Use the Simmer Timer above!)",
      "Add spinach or kale near the end of cooking (final 3 minutes) until wilted.",
      "Finish by stirring in lemon juice or vinegar and check seasoning. Prioritize acid, pepper, and herbs before adding any salt."
    ],
    scienceNotes: [
      "Lentils & Tofu: High-protein, high-fiber core provides high satiety, promoting spontaneous calorie reduction.",
      "Lower-Sodium Soy Sauce: Directly maps to NHS/WHO guidelines for blood pressure control (<5g salt/day).",
      "Moist Heat: Stewing avoids harsh frying and excessive browning, keeping diet clean and lowering AGEs (advanced glycation end-products) in a practical way."
    ]
  },
  {
    id: "bowl",
    title: "Adapted Lunch Bowl",
    category: "healthy",
    defaultServings: 2,
    intro: "A large volume, low energy density lunch. Preserves the original's 'satiety sponge' concept but strips away overclaimed molecular additions like trehalose.",
    cookingTime: "15 Mins",
    typeBadge: "Salad Bowl",
    imgUrl: "images/bowl.png",
    caloriesPerServing: 310,
    carbsPerServing: 18,
    gi: 30,
    ingredients: [
      { name: 'mushrooms, sliced', qty: 200, unit: 'g', zone: 'greengrocer', alt: 'canned sliced mushrooms', cupWeight: 70 },
      { name: 'cucumber, chopped', qty: 0.5, unit: 'large', zone: 'greengrocer', alt: 'local cucumber' },
      { name: 'kale or mixed leafy greens', qty: 75, unit: 'g', zone: 'greengrocer', alt: 'shredded cabbage / slaw mix', cupWeight: 25 },
      { name: 'edamame, tofu, or chickpeas', qty: 100, unit: 'g', zone: 'supermarket', alt: 'canned drained chickpeas', cupWeight: 170 },
      { name: 'olive or canola oil', qty: 0.5, unit: 'tbsp', zone: 'supermarket', alt: 'canola oil', tbspWeight: 14 },
      { name: 'apple cider vinegar or rice vinegar', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'white vinegar', tbspWeight: 15 },
      { name: 'lemon juice', qty: 0.5, unit: 'tbsp', zone: 'greengrocer', alt: 'bottled lemon juice', tbspWeight: 15 },
      { name: 'nutritional yeast (savoury)', qty: 1, unit: 'tbsp', zone: 'bulk', alt: 'omit / home spices', tbspWeight: 5 },
      { name: 'sesame seeds', qty: 0.5, unit: 'tbsp', zone: 'bulk', alt: 'sunflower seeds', tbspWeight: 9 }
    ],
    instructions: [
      "Steam or lightly sauté sliced mushrooms in a non-stick pan without heavy browning.",
      "Massage kale or leafy greens with a tiny splash of oil and lemon juice to soften tough leaves.",
      "Cut cucumber into thick chunks or smash them with a rolling pin for enhanced texture.",
      "Prepare the protein element: shell edamame, cube raw tofu, or drain/rinse canned chickpeas.",
      "Whisk vinegar, lemon juice, oil, chilli flakes, garlic, ginger, and nutritional yeast to make a dressing.",
      "Assemble vegetables and protein in a large bowl, drizzle with dressing, sprinkle sesame seeds, and chill before serving."
    ],
    scienceNotes: [
      "Satiety Sponge: Cucumbers, greens, and mushrooms hold structural water, bulk-filling the stomach without caloric load.",
      "Removal of Trehalose: Done to align with WHO and NHS. Trehalose (a sugar) does not have proven clinically meaningful autophagy benefits in healthy humans.",
      "Balanced Protein: Adding edamame/chickpeas ensures the salad functions as a complete, balanced meal rather than just low-calorie plants."
    ]
  },
  {
    id: "parfait",
    title: "Adapted Breakfast Parfait",
    category: "longevity",
    defaultServings: 2,
    intro: "A fiber-packed, slow-digesting overnight breakfast. Offers two evidence-based dietary pathways: Satiety Oats default or a Lower-Carb seeds/nuts configuration.",
    cookingTime: "10 Mins (Overnight)",
    typeBadge: "Breakfast",
    imgUrl: "images/parfait.png",
    caloriesPerServing: { oats: 290, lowcarb: 370 },
    carbsPerServing: { oats: 32, lowcarb: 14 },
    gi: { oats: 45, lowcarb: 25 },
    ingredients: {
      oats: [
        { name: 'rolled or steel-cut oats', qty: 35, unit: 'g', zone: 'bulk', alt: 'supermarket rolled oats', cupWeight: 90, tbspWeight: 6 },
        { name: 'chia seeds', qty: 10, unit: 'g', zone: 'supermarket', alt: 'flaxseeds only', cupWeight: 160, tbspWeight: 10 },
        { name: 'ground flaxseed', qty: 10, unit: 'g', zone: 'supermarket', alt: 'ground linseed', cupWeight: 150, tbspWeight: 7.5 },
        { name: 'plain unsweetened yoghurt / soy yoghurt', qty: 135, unit: 'g', zone: 'supermarket', alt: 'supermarket brand Greek yoghurt', cupWeight: 240 },
        { name: 'milk or fortified unsweetened soy drink', qty: 110, unit: 'ml', zone: 'supermarket', alt: 'generic soy milk', cupWeight: 250, tbspWeight: 15 },
        { name: 'berries, fresh or frozen', qty: 110, unit: 'g', zone: 'supermarket', alt: 'frozen mixed berries', cupWeight: 150 },
        { name: 'nuts, chopped', qty: 12.5, unit: 'g', zone: 'bulk', alt: 'peanuts', cupWeight: 130, tbspWeight: 8 },
        { name: 'cinnamon', qty: 0.25, unit: 'tsp', zone: 'bulk', alt: 'cinnamon powder' }
      ],
      lowcarb: [
        { name: 'rolled or steel-cut oats', qty: 12.5, unit: 'g', zone: 'bulk', alt: 'supermarket rolled oats', cupWeight: 90, tbspWeight: 6 },
        { name: 'chia seeds', qty: 15, unit: 'g', zone: 'supermarket', alt: 'chia seeds', cupWeight: 160, tbspWeight: 10 },
        { name: 'ground flaxseed', qty: 15, unit: 'g', zone: 'supermarket', alt: 'ground flaxseed', cupWeight: 150, tbspWeight: 7.5 },
        { name: 'plain unsweetened yoghurt / soy yoghurt', qty: 135, unit: 'g', zone: 'supermarket', alt: 'supermarket brand Greek yoghurt', cupWeight: 240 },
        { name: 'milk or fortified unsweetened soy drink', qty: 110, unit: 'ml', zone: 'supermarket', alt: 'generic soy milk', cupWeight: 250, tbspWeight: 15 },
        { name: 'berries, fresh or frozen', qty: 110, unit: 'g', zone: 'supermarket', alt: 'frozen mixed berries', cupWeight: 150 },
        { name: 'nuts, chopped', qty: 20, unit: 'g', zone: 'bulk', alt: 'peanuts', cupWeight: 130, tbspWeight: 8 },
        { name: 'cinnamon', qty: 0.25, unit: 'tsp', zone: 'bulk', alt: 'cinnamon powder' }
      ]
    },
    instructions: [
      "Combine oats (if using), chia seeds, and ground flaxseed with milk in a glass jar or bowl.",
      "If adding extra protein powder (pea/soy), whisk it thoroughly into the milk mixture now.",
      "Refrigerate overnight (or at least 4 hours) to allow chia/oats to expand and form a thick parfait.",
      "In the morning, top with plain unsweetened dairy or soy yoghurt, berries, cinnamon, and portion-controlled chopped nuts."
    ],
    scienceNotes: [
      "Whole Oats: Contains beta-glucan soluble fiber, heavily supported by clinical trials for glucose regulation and LDL control.",
      "Nuts Caution: Rich in healthy fats, but energy-dense. The recipe strictly portions nuts (20-30g) to prevent accidental caloric overshoot.",
      "Soy/Dairy Yoghurt: Unsweetened yoghurts provide calcium and protein without free sugars, which WHO advises restricting."
    ]
  },
  {
    id: "salmon",
    title: "Steamed Salmon & Greens",
    category: "regular",
    defaultServings: 2,
    intro: "A simple, balanced daily meal featuring steamed salmon fillets and high-volume leafy greens. Rich in omega-3 fatty acids and calcium, prioritizing moist cooking to avoid browning carcinogens.",
    cookingTime: "20 Mins",
    typeBadge: "Fish & Veg",
    imgUrl: "images/salmon.png",
    caloriesPerServing: 380,
    carbsPerServing: 6,
    gi: 15,
    ingredients: [
      { name: 'salmon fillets, skinless', qty: 240, unit: 'g', zone: 'supermarket', alt: 'frozen salmon portions (thawed)', cupWeight: 200 },
      { name: 'broccoli or broccolini', qty: 150, unit: 'g', zone: 'greengrocer', alt: 'frozen broccoli florets', cupWeight: 90 },
      { name: 'bok choy or choy sum', qty: 150, unit: 'g', zone: 'asian', alt: 'cabbage leaves', cupWeight: 70 },
      { name: 'extra virgin olive oil', qty: 0.5, unit: 'tbsp', zone: 'supermarket', alt: 'standard olive oil', tbspWeight: 14 },
      { name: 'ginger, sliced', qty: 10, unit: 'g', zone: 'greengrocer', alt: 'ginger powder', tbspWeight: 6 },
      { name: 'lemon slices', qty: 0.5, unit: 'lemon', zone: 'greengrocer', alt: 'lemon juice' },
      { name: 'soy sauce or tamari', qty: 1, unit: 'tbsp', zone: 'asian', alt: 'supermarket soy sauce', tbspWeight: 15 }
    ],
    instructions: [
      "Prepare the steamer: Fill a pot or wok with 2 inches of water and bring to a simmer. Arrange ginger slices in the steaming basket.",
      "Place salmon portions on top of the ginger, then lay lemon slices over each fillet.",
      "Steam salmon covered for 5 minutes.",
      "Add the broccoli and bok choy to the steaming basket around the salmon and steam for another 5-6 minutes until vegetables are bright green and tender, and the salmon is cooked through.",
      "Transfer salmon and greens to serving plates.",
      "Drizzle with olive oil and soy sauce/tamari. Serve immediately while hot."
    ],
    scienceNotes: [
      "Omega-3 Fatty Acids: Salmon is rich in EPA and DHA, supporting long-term cardiovascular health and lipid management.",
      "Steam Cooking: Steaming at 100°C completely prevents the formation of Advanced Glycation End-products (AGEs) and heterocyclic amines from high-heat searing.",
      "High-Volume Greens: Broccoli and bok choy bulk out the meal with water and fiber, stimulating mechanical satiety receptors without carbohydrate load."
    ]
  },
  {
    id: "bark",
    title: "Adelaide Dark Cocoa Bark",
    category: "treat",
    defaultServings: 6,
    intro: "A portion-controlled, rich dark chocolate treat using 70%+ cocoa, raw pumpkin seeds, and walnuts. Designed as a budget-conscious, lower-sugar alternative to premium wellness chocolate bars.",
    cookingTime: "15 Mins + Chill",
    typeBadge: "Dessert/Treat",
    imgUrl: "images/bark.png",
    caloriesPerServing: 165,
    carbsPerServing: 12,
    gi: 35,
    ingredients: [
      { name: 'dark chocolate (70%+ cocoa solids)', qty: 150, unit: 'g', zone: 'supermarket', alt: 'home brand dark baking chocolate', cupWeight: 140, tbspWeight: 9 },
      { name: 'pumpkin seeds (pepitas)', qty: 30, unit: 'g', zone: 'bulk', alt: 'sunflower seeds', cupWeight: 130, tbspWeight: 8 },
      { name: 'walnuts, chopped', qty: 30, unit: 'g', zone: 'bulk', alt: 'peanuts', cupWeight: 110, tbspWeight: 7 },
      { name: 'flaked sea salt', qty: 0.25, unit: 'tsp', zone: 'supermarket', alt: 'ordinary table salt' }
    ],
    instructions: [
      "Break the dark chocolate into small pieces and place in a heatproof bowl.",
      "Melt the chocolate using a double boiler (bowl over simmering water) or in short bursts in the microwave, stirring frequently to avoid scorching.",
      "Line a baking tray with greaseproof paper. Pour the melted chocolate onto the paper and spread it to about 5mm thick.",
      "Sprinkle the chopped walnuts and pumpkin seeds evenly over the melted chocolate.",
      "Add a very light sprinkle of flaked sea salt across the top.",
      "Place the tray in the refrigerator for at least 30 minutes until fully set, then break into 6 even servings."
    ],
    scienceNotes: [
      "Cocoa Polyphenols: 70%+ dark chocolate contains flavonoids that support vascular health, but it remains high in calories and saturated fat.",
      "Treat Portions: Restricted to a 30g serving to satisfy chocolate cravings without contributing to calorie creep.",
      "Seed and Nut fats: Healthy fats and fiber lower the glycemic response of the sugars, making it a superior treat to refined milk chocolate."
    ]
  },
  {
    id: "superveggie",
    title: "Bryan Johnson's Super Veggie",
    category: "longevity",
    defaultServings: 1,
    intro: "A high-volume, nutrient-dense bowl combining black lentils, broccoli, cauliflower, mushrooms, and healthy fats. Inspired by Bryan Johnson's Blueprint, adapted with local Adelaide ingredients.",
    cookingTime: "25 Mins",
    typeBadge: "Veg & Lentils",
    imgUrl: "images/superveggie.png",
    caloriesPerServing: 380,
    carbsPerServing: 20,
    gi: 35,
    ingredients: [
      { name: 'black or brown lentils, dry', qty: 45, unit: 'g', zone: 'bulk', alt: 'generic brown lentils', cupWeight: 180, tbspWeight: 11.5 },
      { name: 'broccoli, chopped', qty: 250, unit: 'g', zone: 'greengrocer', alt: 'frozen broccoli florets', cupWeight: 90 },
      { name: 'cauliflower, chopped', qty: 150, unit: 'g', zone: 'greengrocer', alt: 'frozen cauliflower', cupWeight: 100 },
      { name: 'mushrooms, sliced', qty: 50, unit: 'g', zone: 'greengrocer', alt: 'canned mushrooms', cupWeight: 70 },
      { name: 'garlic, minced', qty: 1, unit: 'clove', zone: 'greengrocer', alt: 'jar garlic' },
      { name: 'ginger, minced', qty: 3, unit: 'g', zone: 'greengrocer', alt: 'ginger powder' },
      { name: 'extra virgin olive oil', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'canola oil', tbspWeight: 14 },
      { name: 'hemp seeds', qty: 1, unit: 'tbsp', zone: 'bulk', alt: 'sesame seeds', tbspWeight: 10 },
      { name: 'apple cider vinegar', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'white vinegar', tbspWeight: 15 },
      { name: 'fresh lime juice', qty: 1, unit: 'tbsp', zone: 'greengrocer', alt: 'bottled lime juice', tbspWeight: 15 }
    ],
    instructions: [
      "Boil the black/brown lentils in water for about 20 minutes until tender, then drain.",
      "Steam the broccoli, cauliflower, and mushrooms until tender (approx. 5-7 minutes).",
      "Sauté the minced garlic and ginger in a small pan with a shadow of water for 1 minute until fragrant.",
      "Place the cooked lentils and steamed vegetables into a blender or food processor, add the sautéed garlic and ginger, apple cider vinegar, and lime juice. Blend until a thick puree or textured mash forms.",
      "Transfer the mixture to a serving bowl.",
      "Drizzle with extra virgin olive oil and sprinkle with hemp seeds before serving."
    ],
    scienceNotes: [
      "High Satiety Index: The high water and fiber content of cruciferous vegetables combined with lentil protein expands in the stomach.",
      "Sulforaphane Booster: Broccoli and cauliflower provide glucosinolates, which support cellular detoxification pathways.",
      "Healthy Lipid Profile: Extra virgin olive oil and hemp seeds provide monounsaturated and omega-3 fatty acids."
    ]
  },
  {
    id: "nuttypudding",
    title: "Bryan Johnson's Nutty Pudding",
    category: "longevity",
    defaultServings: 1,
    intro: "A delicious, creamy nut and berry puree packed with healthy fats, soluble fiber, and antioxidants. Inspired by Bryan Johnson's Blueprint, scaled with budget substitutions.",
    cookingTime: "10 Mins",
    typeBadge: "Nut & Seed Mash",
    imgUrl: "images/nuttypudding.png",
    caloriesPerServing: 420,
    carbsPerServing: 10,
    gi: 30,
    ingredients: [
      { name: 'almond milk or fortified soy drink', qty: 60, unit: 'ml', zone: 'supermarket', alt: 'water', cupWeight: 250 },
      { name: 'macadamia nuts', qty: 15, unit: 'g', zone: 'bulk', alt: 'peanuts', cupWeight: 130, tbspWeight: 8 },
      { name: 'walnuts, raw', qty: 15, unit: 'g', zone: 'bulk', alt: 'sunflower seeds', cupWeight: 110, tbspWeight: 7 },
      { name: 'chia seeds', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'flaxseed', cupWeight: 160, tbspWeight: 10 },
      { name: 'ground flaxseed', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'ground linseed', cupWeight: 150, tbspWeight: 7.5 },
      { name: 'cocoa powder, unsweetened', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'omit', tbspWeight: 6 },
      { name: 'berries (pomegranate, blueberry, raspberry)', qty: 50, unit: 'g', zone: 'supermarket', alt: 'frozen mixed berries', cupWeight: 150 },
      { name: 'pea or soy protein powder', qty: 10, unit: 'g', zone: 'bulk', alt: 'omit' }
    ],
    instructions: [
      "Add almond milk/soy drink, macadamia nuts, walnuts, chia seeds, ground flaxseed, and cocoa powder into a high-powered blender.",
      "Blend on high for 1-2 minutes until a completely smooth, pudding-like consistency is achieved.",
      "Pour the blended nut pudding into a serving glass or bowl.",
      "Top with the fresh or frozen berries.",
      "Optionally stir in pea or soy protein powder to increase the protein density."
    ],
    scienceNotes: [
      "Brain-Healthy Fats: Walnuts and macadamias are rich in polyunsaturated and monounsaturated fats supporting cognitive health.",
      "Antioxidant Rich: Cocoa and berries contain high concentrations of anthocyanins and polyphenols.",
      "Cardiometabolic Fiber: Chia and flax seeds deliver high amounts of soluble fiber, slowing digestion and smoothing glucose responses."
    ]
  }
];

const defaultShoppingList: ShoppingItem[] = [
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

const defaultAuditRows: AuditRow[] = [
  { topic: 'Overall Frame', original: 'Longevity through Blueprint & SENS ingredient rules', successor: 'General weight-management & cardiometabolic pattern', evidence: 'strong', rationale: 'Fibre, sodium reduction, and unsaturated fats are heavily supported by WHO/NHS guidelines; single-molecule longevity claims lack direct human proof.' },
  { topic: 'Potatoes', original: 'Implicitly problematic for glycation', successor: 'Acceptable in portion-controlled meals; prefer fibre-rich patterns', evidence: 'moderate', rationale: 'Potatoes are a whole carbohydrate. They are not toxic; rather, portions should be managed within the 25% starch plate guideline.' },
  { topic: 'Whole grains', original: 'Grain-free breakfast (contradicted by oats in recipe)', successor: 'Oats and whole grains remain acceptable for most adults', evidence: 'strong', rationale: 'Whole oats contain beta-glucans which improve glucose regulation and lipid profiles. Grain-free mandates are unsupported for general health.' },
  { topic: 'Soy / Tofu', original: 'Accepted in one recipe but anti-soy framing elsewhere', successor: 'Soy and tofu are acceptable as healthy protein options', evidence: 'strong', rationale: 'Legumes and soy are clinical priorities for plant protein. High intakes correlate with lower blood pressure and cardiovascular benefits.' },
  { topic: 'Gluten-free', original: 'Presented as healthier by default', successor: 'Only indicated for coeliac disease or confirmed sensitivity', evidence: 'strong', rationale: 'NHS guidelines indicate gluten avoidance is a medical necessity for coeliac disease, not a general public health longevity rule.' },
  { topic: 'Dairy / Yoghurt', original: 'Treated suspiciously at points', successor: 'Plain yoghurt or unsweetened soy yoghurt is healthy and acceptable', evidence: 'strong', rationale: 'Standard low-fat/unsweetened yoghurts provide calcium and protein, helping satiety without introducing harmful free sugars.' },
  { topic: 'Oils', original: 'Strong preference for premium oils, "raw only"', successor: 'Measured use of unsaturated oils; avoid deep-frying', evidence: 'strong', rationale: 'Replacing saturated fats with olive/canola oil is supported. However, they are energy-dense and must be measured to prevent calorie creep.' },
  { topic: 'Sweeteners', original: 'Included trehalose; "natural" sweetener framing', successor: 'Minimise sweeteners; WHO advises against non-sugar sweeteners for weight loss', evidence: 'strong', rationale: 'WHO guidelines advise minimizing both free sugars and non-sugar sweeteners to control weight and avoid non-communicable diseases.' },
  { topic: 'Salt / Soy Sauce', original: 'Lower-sodium choices mentioned but not centered', successor: 'Sodium reduction upgraded as a primary recommendation', evidence: 'strong', rationale: 'Reducing sodium to under 5g salt/day is one of the highest-confidence, clinically-proven blood pressure control targets.' },
  { topic: 'AGE Reduction', original: 'Central anti-ageing strategy', successor: 'Secondary culinary consideration; not a clinical aging lever', evidence: 'limited', rationale: 'While lower-temperature, moist cooking is good practice, direct clinical proof that reducing dietary AGEs slows human biological aging remains unproven.' },
  { topic: 'Ultra-processed foods', original: 'Implicitly criticised', successor: 'Explicitly minimize reliance on them', evidence: 'moderate', rationale: '2024 umbrella reviews and a 2025 controlled trial show that high UPF intake causes rapid adverse cardiometabolic effects even in calorie-matched conditions.' }
];

/* ==========================================================================
   Helper Utilities
   ========================================================================== */

/**
 * Converts decimal numbers to neat fractional representations (e.g. 1.25 -> "1 1/4")
 */
function formatFraction(val: number): string {
  if (val <= 0) return '0';
  const integer = Math.floor(val);
  const decimal = val - integer;
  
  let fracStr = '';
  // Match closest kitchen fractions (tolerance 0.05)
  if (decimal >= 0.08 && decimal < 0.2) fracStr = '1/8';
  else if (decimal >= 0.2 && decimal < 0.3) fracStr = '1/4';
  else if (decimal >= 0.3 && decimal < 0.4) fracStr = '1/3';
  else if (decimal >= 0.4 && decimal < 0.6) fracStr = '1/2';
  else if (decimal >= 0.6 && decimal < 0.7) fracStr = '2/3';
  else if (decimal >= 0.7 && decimal < 0.85) fracStr = '3/4';
  else if (decimal >= 0.85) return (integer + 1).toString(); // Round up
  
  if (integer > 0) {
    return fracStr ? `${integer} ${fracStr}` : integer.toString();
  }
  return fracStr || val.toFixed(1).replace(/\.0$/, '');
}

/**
 * Double-beep alert using the Web Audio API
 */
function triggerAudioBeep(): void {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (time: number, freq: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.18);
    };
    const now = audioCtx.currentTime;
    playTone(now, 880);
    playTone(now + 0.25, 880);
  } catch (e) {
    console.error("Audio beep failed to initialize", e);
  }
}

/* ==========================================================================
   Firebase Initialization
   ========================================================================== */

let db: any = null;
let auth: any = null;
let isFirebaseOnline = false;

// Initialize Firebase with dummy configurations.
// For local emulators, the configuration details are ignored, so dummy strings work fine.
const firebaseConfig = {
  apiKey: "local-emulator-dummy-api-key",
  authDomain: "successor-health-hub.firebaseapp.com",
  projectId: "successor-health-hub",
  storageBucket: "successor-health-hub.appspot.com",
  messagingSenderId: "12345678",
  appId: "1:123456:web:1234"
};

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Detect if running on localhost to automatically route to local emulators
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log("[Firebase] Successfully connected to local emulators.");
  }
  isFirebaseOnline = true;
} catch (e) {
  console.warn("[Firebase] Could not initialize. Falling back to offline LocalStorage mode.", e);
  isFirebaseOnline = false;
}

/* ==========================================================================
   Petite-Vue Reactive App Store definition
   ========================================================================== */

const store = {
  // Authentication state
  user: null as any,
  loginEmail: '',
  isCheckingAuth: true,
  isFirebaseOnline: isFirebaseOnline,
  
  // Navigation & Preferences
  activeTab: 'dashboard',
  theme: 'dark',
  servings: 4,
  budgetMode: false,
  parfaitPathway: 'oats' as 'oats' | 'lowcarb',
  unitSystem: 'metric' as 'metric' | 'cups' | 'spoons',
  
  // Dashboard Plate ratios (Veg, Protein, Starch)
  plate: {
    veg: 50,
    prot: 25,
    starch: 25
  },
  
  // Satiety Calculator target inputs
  calcCalories: 2000,
  calcActivity: 1.375,
  
  // Active science node details
  activeScienceNode: 'high',
  activeRoadmapPhase: '2',
  
  // Search and filter inputs
  auditQuery: '',
  auditFilter: 'all',
  
  // Recipe Search and filter inputs
  recipeSearch: '',
  recipeCategory: 'all',
  recipeMaxCalories: 800,
  recipeEnergyUnit: 'kcal',
  
  // Shopping list Search and filter inputs
  shoppingSearch: '',
  shoppingStatus: 'all', // 'all' | 'pending' | 'completed'
  shoppingZone: 'all',   // 'all' | 'supermarket' | 'greengrocer' | 'bulk' | 'asian'
  
  // Main Data lists
  recipes: [] as Recipe[],
  shoppingList: [] as ShoppingItem[],
  healthLogs: [] as LogEntry[],
  auditRows: defaultAuditRows,
  
  // Timer state for Dinner Stew simmering
  timerInterval: null as any,
  timerSecondsRemaining: 25 * 60,
  timerState: 'idle' as 'idle' | 'running' | 'paused',

  // Initialize store bindings and lifecycle events
  init() {
    this.loadLocalPreferences();
    this.setupAuthListener();
    this.loadDatabaseSyncs();
    this.updatePlateFromSliders();
    this.startPwaServiceWorker();
  },

  /* ====================================
     PWA & Service Worker
     ==================================== */
  startPwaServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("[PWA] Service Worker registered successfully."))
        .catch(err => console.error("[PWA] Service Worker registration failed:", err));
    }
  },

  /* ====================================
     Authentication Gateway
     ==================================== */
  setupAuthListener() {
    if (!auth) {
      this.isCheckingAuth = false;
      return;
    }
    
    // Safety timeout: if emulator auth check hangs (e.g. emulator is offline),
    // release the loading spinner after 2.0 seconds so the user can choose offline bypass mode.
    setTimeout(() => {
      if (this.isCheckingAuth) {
        console.warn("[Auth] Authentication check timed out. Displaying auth gateway.");
        this.isCheckingAuth = false;
      }
    }, 2000);
    
    onAuthStateChanged(auth, (firebaseUser: any) => {
      this.isCheckingAuth = false;
      if (firebaseUser) {
        // Enforce the @thorsys.com.au domain restriction rules
        const email = firebaseUser.email || '';
        if (email.endsWith('@thorsys.com.au')) {
          this.user = firebaseUser;
          this.loadDatabaseSyncs();
        } else {
          alert("Access Denied: Only @thorsys.com.au accounts are authorized.");
          signOut(auth);
          this.user = null;
        }
      } else {
        this.user = null;
      }
    });
  },

  async loginWithGoogle() {
    if (!auth) {
      alert("Local Fallback Mode: Google Auth requires running the Firebase Emulators.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed:", e);
      alert("Authentication failed. Make sure local emulator is running.");
    }
  },

  // Mock login for offline testing when emulator is offline
  bypassAuthOffline() {
    this.user = {
      uid: "mock-offline-user",
      email: "developer@thorsys.com.au",
      displayName: "Offline Developer"
    } as any;
    isFirebaseOnline = false; // Set outer module-level flag to false
    this.isFirebaseOnline = false; // Set store flag to false
    this.loadDatabaseSyncs();
  },

  logout() {
    if (auth) {
      signOut(auth);
    } else {
      this.user = null;
    }
  },

  /* ====================================
     Local Storage / Database Syncing
     ==================================== */
  loadLocalPreferences() {
    const savedTheme = localStorage.getItem('successor_theme') || 'dark';
    this.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const savedUnit = localStorage.getItem('successor_units') || 'metric';
    this.unitSystem = savedUnit as any;
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('successor_theme', this.theme);
  },

  loadDatabaseSyncs() {
    if (!this.user) return;
    const uid = this.user.uid;
    
    // Sync Recipes & Shopping List & Health Logs
    if (db && isFirebaseOnline) {
      // 1. Sync recipes (with self-healing auto-population if collection is empty)
      onSnapshot(collection(db, 'users', uid, 'recipes'), (snapshot: any) => {
        const items: Recipe[] = [];
        snapshot.forEach((doc: any) => {
          items.push({ id: doc.id, ...doc.data() } as Recipe);
        });
        
        if (items.length === 0) {
          // Self-heal: Database was empty, load defaults and write to cloud Firestore
          defaultRecipes.forEach(async (recipe) => {
            await setDoc(doc(db as any, 'users', uid, 'recipes', recipe.id), recipe);
          });
        } else if (items.length < defaultRecipes.length) {
          // Add missing default recipes
          defaultRecipes.forEach(async (recipe) => {
            const existing = items.find(item => item.id === recipe.id);
            if (!existing) {
              await setDoc(doc(db as any, 'users', uid, 'recipes', recipe.id), recipe);
            }
          });
        } else {
          // Sort recipes to keep structured display
          const order = ['stew', 'bowl', 'parfait', 'salmon', 'superveggie', 'nuttypudding', 'bark'];
          items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
          this.recipes = items;
        }
      });

      // 2. Sync Shopping list
      onSnapshot(collection(db, 'users', uid, 'shoppingList'), (snapshot: any) => {
        const items: ShoppingItem[] = [];
        snapshot.forEach((doc: any) => {
          items.push({ id: doc.id, ...doc.data() } as ShoppingItem);
        });
        this.shoppingList = items;
      });
      
      // 3. Sync Health Logs
      onSnapshot(collection(db, 'users', uid, 'healthLogs'), (snapshot: any) => {
        const logs: LogEntry[] = [];
        snapshot.forEach((doc: any) => {
          logs.push({ id: doc.id, ...doc.data() } as LogEntry);
        });
        this.healthLogs = logs;
      });
    } else {
      // Fallback local storage
      const localRecipes = localStorage.getItem('successor_recipes');
      if (localRecipes) {
        this.recipes = JSON.parse(localRecipes);
      } else {
        this.recipes = defaultRecipes.map(recipe => ({ ...recipe }));
        localStorage.setItem('successor_recipes', JSON.stringify(this.recipes));
      }

      const localShopping = localStorage.getItem('successor_shopping_list');
      if (localShopping) {
        this.shoppingList = JSON.parse(localShopping);
      } else {
        this.shoppingList = defaultShoppingList.map(item => ({ ...item }));
        this.saveShoppingListOffline();
      }
      
      const localLogs = localStorage.getItem('successor_health_logs');
      if (localLogs) {
        this.healthLogs = JSON.parse(localLogs);
      }
    }
  },

  saveShoppingListOffline() {
    localStorage.setItem('successor_shopping_list', JSON.stringify(this.shoppingList));
  },

  /* ====================================
     Portions Converter & Scaling Engine
     ==================================== */
  convertedIngredients(recipe: any): any[] {
    if (!recipe || !recipe.ingredients) return [];
    
    // Parfait breakfast has two pathway toggles
    let list = recipe.ingredients;
    if (recipe.id === 'parfait') {
      list = recipe.ingredients[this.parfaitPathway] || recipe.ingredients;
    }
    
    // Calculate scale ratio relative to recipe's default servings size
    const factor = this.servings / recipe.defaultServings;
    return list.map((ing: Ingredient) => this.formatIngredient(ing, factor));
  },

  /**
   * Main recipe conversion mapping. Computes quantity dynamically based on
   * scale factor, and formats weight/volume density values (grams, cups, spoons).
   */
  formatIngredient(ing: Ingredient, factor: number): { displayQty: string; name: string; isSwapped: boolean } {
    const baseGrams = ing.qty * factor;
    const nameStr = this.budgetMode ? ing.alt : ing.name;
    const isSwapped = this.budgetMode && ing.alt !== ing.name;

    // 1. Metric: return grams/ml
    if (this.unitSystem === 'metric' || !ing.unit) {
      const formattedQty = baseGrams.toFixed(1).replace(/\.0$/, '');
      return {
        displayQty: ing.unit ? `${formattedQty}${ing.unit}` : formattedQty,
        name: nameStr,
        isSwapped
      };
    }

    // 2. Cups System (Weight density conversion)
    if (this.unitSystem === 'cups') {
      if (ing.unit === 'g' && ing.cupWeight) {
        const cupsVal = baseGrams / ing.cupWeight;
        return {
          displayQty: `${formatFraction(cupsVal)} cup`,
          name: nameStr,
          isSwapped
        };
      }
      if (ing.unit === 'ml') {
        const cupsVal = baseGrams / 250; // AU cup metric standard (250ml)
        return {
          displayQty: `${formatFraction(cupsVal)} cup`,
          name: nameStr,
          isSwapped
        };
      }
    }

    // 3. Spoons System (Spoons/Tablespoons conversion)
    if (this.unitSystem === 'spoons') {
      if (ing.unit === 'g' && ing.tbspWeight) {
        const spoonsVal = baseGrams / ing.tbspWeight;
        return {
          displayQty: `${formatFraction(spoonsVal)} tbsp`,
          name: nameStr,
          isSwapped
        };
      }
      if (ing.unit === 'ml') {
        const spoonsVal = baseGrams / 20; // AU tablespoon standard (20ml)
        return {
          displayQty: `${formatFraction(spoonsVal)} tbsp`,
          name: nameStr,
          isSwapped
        };
      }
    }

    // Fallback: return raw values
    const formattedQty = baseGrams.toFixed(1).replace(/\.0$/, '');
    return {
      displayQty: ing.unit ? `${formattedQty}${ing.unit}` : formattedQty,
      name: nameStr,
      isSwapped
    };
  },

  /* ====================================
     Interactive Plate Sliders
     ==================================== */
  adjustPlateProportions(changedSlider: 'veg' | 'prot' | 'starch', newValue: number) {
    const currentVeg = this.plate.veg;
    const currentProt = this.plate.prot;
    const currentStarch = this.plate.starch;
    
    if (changedSlider === 'veg') {
      const diff = newValue - currentVeg;
      const sumOther = currentProt + currentStarch;
      this.plate.veg = newValue;
      if (sumOther > 0) {
        this.plate.prot = Math.max(10, currentProt - (diff * currentProt / sumOther));
        this.plate.starch = Math.max(10, 100 - this.plate.veg - this.plate.prot);
      }
    } else if (changedSlider === 'prot') {
      const diff = newValue - currentProt;
      const sumOther = currentVeg + currentStarch;
      this.plate.prot = newValue;
      if (sumOther > 0) {
        this.plate.veg = Math.max(10, currentVeg - (diff * currentVeg / sumOther));
        this.plate.starch = Math.max(10, 100 - this.plate.veg - this.plate.prot);
      }
    } else if (changedSlider === 'starch') {
      const diff = newValue - currentStarch;
      const sumOther = currentVeg + currentProt;
      this.plate.starch = newValue;
      if (sumOther > 0) {
        this.plate.veg = Math.max(10, currentVeg - (diff * currentVeg / sumOther));
        this.plate.prot = Math.max(10, 100 - this.plate.veg - this.plate.starch);
      }
    }
    
    // Normalize sum to exactly 100%
    const sum = this.plate.veg + this.plate.prot + this.plate.starch;
    this.plate.veg = (this.plate.veg / sum) * 100;
    this.plate.prot = (this.plate.prot / sum) * 100;
    this.plate.starch = (this.plate.starch / sum) * 100;
    
    this.updatePlateFromSliders();
  },

  updatePlateFromSliders() {
    const plateEl = document.getElementById('interactive-plate');
    if (plateEl) {
      plateEl.style.setProperty('--veg-pct', `${this.plate.veg}%`);
      plateEl.style.setProperty('--prot-pct', `${this.plate.prot}%`);
      plateEl.style.setProperty('--starch-pct', `${this.plate.starch}%`);
    }
  },

  setPlatePreset(type: 'successor' | 'standard' | 'extreme') {
    if (type === 'successor') {
      this.plate = { veg: 50, prot: 25, starch: 25 };
    } else if (type === 'standard') {
      this.plate = { veg: 15, prot: 25, starch: 60 };
    } else if (type === 'extreme') {
      this.plate = { veg: 10, prot: 30, starch: 60 };
    }
    this.updatePlateFromSliders();
  },

  get plateEvaluation(): string {
    if (this.plate.veg >= 45) {
      return 'optimal';
    } else if (this.plate.veg >= 25 && this.plate.veg < 45) {
      return 'suboptimal';
    }
    return 'danger';
  },

  /* ====================================
     Satiety & Portion Calculator
     ==================================== */
  get calcBreakfastOats(): string {
    const energyNeed = this.calcCalories;
    const oatsPortion = Math.round((energyNeed / 2000) * 70);
    return `${oatsPortion}g oats`;
  },
  
  get calcLunchGreens(): string {
    const energyNeed = this.calcCalories;
    const greensPortion = Math.round((energyNeed / 2000) * 150);
    return `${greensPortion}g greens`;
  },
  
  get calcDinnerLentils(): string {
    const energyNeed = this.calcCalories;
    const lentilPortion = Math.round((energyNeed / 2000) * 45);
    return `${lentilPortion}g lentils / serv`;
  },

  /* ====================================
     Cooking Timer
     ==================================== */
  get timerClockDisplay(): string {
    const min = Math.floor(this.timerSecondsRemaining / 60);
    const sec = this.timerSecondsRemaining % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  },

  startStewTimer() {
    if (this.timerInterval) return;
    this.timerState = 'running';
    
    this.timerInterval = setInterval(() => {
      if (this.timerSecondsRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.timerState = 'idle';
        this.timerSecondsRemaining = 25 * 60;
        triggerAudioBeep();
        alert("Simmer time complete! Ready to add spinach/kale.");
      } else {
        this.timerSecondsRemaining--;
      }
    }, 1000);
  },

  pauseStewTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.timerState = 'paused';
  },

  resetStewTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.timerSecondsRemaining = 25 * 60;
    this.timerState = 'idle';
  },

  /* ====================================
     Shopping List Operations
     ==================================== */
  async toggleShoppingItem(item: ShoppingItem) {
    if (db && isFirebaseOnline && this.user && item.id) {
      await updateDoc(doc(db, 'users', this.user.uid, 'shoppingList', item.id), {
        checked: item.checked
      });
    } else {
      this.saveShoppingListOffline();
    }
  },

  async deleteShoppingItem(item: ShoppingItem) {
    if (db && isFirebaseOnline && this.user && item.id) {
      await deleteDoc(doc(db, 'users', this.user.uid, 'shoppingList', item.id));
    } else {
      this.shoppingList = this.shoppingList.filter(i => i !== item);
      this.saveShoppingListOffline();
    }
  },

  async addCustomShoppingItem(e: Event) {
    e.preventDefault();
    const nameInput = document.getElementById('item-name') as HTMLInputElement;
    const zoneSelect = document.getElementById('item-zone') as HTMLSelectElement;
    
    const newItem: Omit<ShoppingItem, 'id'> = {
      name: nameInput.value,
      qty: 'Custom',
      zone: zoneSelect.value as any,
      checked: false,
      custom: true
    };
    
    if (db && isFirebaseOnline && this.user) {
      const newDocRef = doc(collection(db, 'users', this.user.uid, 'shoppingList'));
      await setDoc(newDocRef, newItem);
    } else {
      this.shoppingList.push(newItem);
      this.saveShoppingListOffline();
    }
    
    nameInput.value = '';
  },

  async addRecipeToShoppingList(recipeId: string) {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    let list: Ingredient[] = [];
    if (recipeId === 'parfait') {
      list = recipe.ingredients[this.parfaitPathway] || recipe.ingredients;
    } else {
      list = recipe.ingredients;
    }
    
    const factor = this.servings / recipe.defaultServings;
    
    for (const ing of list) {
      const formatted = this.formatIngredient(ing, factor);
      
      const newItem: Omit<ShoppingItem, 'id'> = {
        name: formatted.name,
        qty: formatted.displayQty,
        zone: ing.zone,
        checked: false
      };
      
      if (db && isFirebaseOnline && this.user) {
        const docId = `${recipeId}_${ing.name.replace(/\s+/g, '_')}`;
        await setDoc(doc(db as any, 'users', this.user.uid, 'shoppingList', docId), newItem);
      } else {
        const existing = this.shoppingList.find(i => i.name === newItem.name);
        if (existing) {
          existing.qty = `${newItem.qty} (added)`;
        } else {
          this.shoppingList.push(newItem);
        }
      }
    }
    
    if (!isFirebaseOnline) {
      this.saveShoppingListOffline();
    }
    alert(`Ingredients for ${recipe.title} added to your shopping list!`);
  },

  async clearCheckedShoppingItems() {
    const checkedItems = this.shoppingList.filter(i => i.checked);
    
    if (db && isFirebaseOnline && this.user) {
      for (const item of checkedItems) {
        if (item.id) {
          await deleteDoc(doc(db, 'users', this.user.uid, 'shoppingList', item.id));
        }
      }
    } else {
      this.shoppingList = this.shoppingList.filter(i => !i.checked);
      this.saveShoppingListOffline();
    }
  },

  async resetDefaultShoppingList() {
    if (confirm("Reset shopping list to default baseline? Your additions will be deleted.")) {
      if (db && isFirebaseOnline && this.user) {
        // Delete all current items in collection
        for (const item of this.shoppingList) {
          if (item.id) {
            await deleteDoc(doc(db, 'users', this.user.uid, 'shoppingList', item.id));
          }
        }
        // Write defaults
        for (const item of defaultShoppingList) {
          const newDocRef = doc(collection(db, 'users', this.user.uid, 'shoppingList'));
          await setDoc(newDocRef, item);
        }
      } else {
        this.shoppingList = defaultShoppingList.map(item => ({ ...item }));
        this.saveShoppingListOffline();
      }
    }
  },

  exportShoppingListToClipboard() {
    const lines = ["SUCCESSOR RECIPE APP SHOPPING LIST", "=================================="];
    const zones = {
      supermarket: "SUPERMARKET (Staples & Cold)",
      greengrocer: "GREENGROCER & MARKET (Fresh Produce)",
      bulk: "BULK SHOP (Dry Grains & Spices)",
      asian: "ASIAN GROCER (Tofu & Seasonings)"
    };
    
    Object.keys(zones).forEach(key => {
      const items = this.shoppingList.filter(i => i.zone === key && !i.checked);
      if (items.length > 0) {
        lines.push(`\n[${(zones as any)[key]}]`);
        items.forEach(i => {
          lines.push(`- [ ] ${i.name} (${i.qty})`);
        });
      }
    });
    
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      alert("Shopping list copied to clipboard in plain-text checklist format!");
    }).catch(err => {
      alert("Clipboard export failed: " + err);
    });
  },

  /* ====================================
     Health Logs Operations
     ==================================== */
  async submitHealthLog(e: Event) {
    e.preventDefault();
    
    const logEntry: Omit<LogEntry, 'id'> = {
      date: new Date().toISOString(),
      weight: parseFloat((document.getElementById('log-weight') as HTMLInputElement).value),
      waist: parseFloat((document.getElementById('log-waist') as HTMLInputElement).value) || null,
      bpSys: parseInt((document.getElementById('log-bp-sys') as HTMLInputElement).value) || null,
      bpDia: parseInt((document.getElementById('log-bp-dia') as HTMLInputElement).value) || null,
      adherence: parseInt((document.getElementById('log-adherence') as HTMLSelectElement).value),
      satiety: parseInt((document.getElementById('log-satiety') as HTMLSelectElement).value),
      notes: (document.getElementById('log-notes') as HTMLInputElement).value || ''
    };
    
    if (db && isFirebaseOnline && this.user) {
      const newDocRef = doc(collection(db, 'users', this.user.uid, 'healthLogs'));
      await setDoc(newDocRef, logEntry);
    } else {
      this.healthLogs.push(logEntry);
      localStorage.setItem('successor_health_logs', JSON.stringify(this.healthLogs));
    }
    
    // Clear inputs except weight
    (document.getElementById('log-waist') as HTMLInputElement).value = '';
    (document.getElementById('log-bp-sys') as HTMLInputElement).value = '';
    (document.getElementById('log-bp-dia') as HTMLInputElement).value = '';
    (document.getElementById('log-notes') as HTMLInputElement).value = '';
    
    alert("Health log saved successfully!");
  },

  async clearHealthLogs() {
    if (confirm("Permanently delete your historical metrics logs?")) {
      if (db && isFirebaseOnline && this.user) {
        for (const log of this.healthLogs) {
          if (log.id) {
            await deleteDoc(doc(db, 'users', this.user.uid, 'healthLogs', log.id));
          }
        }
      } else {
        this.healthLogs = [];
        localStorage.removeItem('successor_health_logs');
      }
    }
  },

  /* ====================================
     Scientific Audit Filters
     ==================================== */
  get filteredAuditRows(): AuditRow[] {
    const q = this.auditQuery.toLowerCase();
    return this.auditRows.filter(row => {
      const matchesSearch = row.topic.toLowerCase().includes(q) || row.rationale.toLowerCase().includes(q);
      const matchesFilter = this.auditFilter === 'all' || row.evidence === this.auditFilter;
      return matchesSearch && matchesFilter;
    });
  },

  /* ====================================
     Recipe Satiety, Glycemic & Unit Getters & Helpers
     ==================================== */
  getRecipeCalories(recipe: Recipe): number {
    if (!recipe) return 0;
    if (typeof recipe.caloriesPerServing === 'object') {
      return recipe.caloriesPerServing[this.parfaitPathway] || 0;
    }
    return recipe.caloriesPerServing || 0;
  },

  getRecipeCarbs(recipe: Recipe): number {
    if (!recipe) return 0;
    if (typeof recipe.carbsPerServing === 'object') {
      return recipe.carbsPerServing[this.parfaitPathway] || 0;
    }
    return recipe.carbsPerServing || 0;
  },

  getRecipeGI(recipe: Recipe): number {
    if (!recipe) return 0;
    if (typeof recipe.gi === 'object') {
      return recipe.gi[this.parfaitPathway] || 0;
    }
    return recipe.gi || 0;
  },

  getRecipeGL(recipe: Recipe): number {
    const gi = this.getRecipeGI(recipe);
    const carbs = this.getRecipeCarbs(recipe);
    return Math.round((gi * carbs) / 10) / 10;
  },

  formatEnergyVal(recipe: Recipe): string {
    const kcal = this.getRecipeCalories(recipe);
    if (this.recipeEnergyUnit === 'kJ') {
      return `${Math.round(kcal * 4.184)} kJ`;
    }
    return `${kcal} kcal`;
  },

  getGIRating(gi: number): 'low' | 'medium' | 'high' {
    if (gi <= 55) return 'low';
    if (gi <= 69) return 'medium';
    return 'high';
  },

  getGLRating(gl: number): 'low' | 'medium' | 'high' {
    if (gl <= 10) return 'low';
    if (gl <= 19) return 'medium';
    return 'high';
  },

  get filteredRecipes(): Recipe[] {
    const q = this.recipeSearch.toLowerCase().trim();
    const cat = this.recipeCategory;
    const maxCal = this.recipeMaxCalories;
    
    return this.recipes.filter(recipe => {
      // 1. Category filter
      if (cat !== 'all' && recipe.category !== cat) {
        return false;
      }
      
      // 2. Calories filter (always compared in kcal)
      const cals = this.getRecipeCalories(recipe);
      if (cals > maxCal) {
        return false;
      }
      
      // 3. Search query filter
      if (q) {
        const titleMatch = recipe.title.toLowerCase().includes(q);
        const introMatch = recipe.intro.toLowerCase().includes(q);
        
        let ingredientsMatch = false;
        let ingList: Ingredient[] = [];
        if (recipe.id === 'parfait') {
          ingList = (recipe.ingredients[this.parfaitPathway] || []) as Ingredient[];
        } else {
          ingList = (recipe.ingredients || []) as Ingredient[];
        }
        ingredientsMatch = ingList.some(ing => 
          ing.name.toLowerCase().includes(q) || (ing.alt && ing.alt.toLowerCase().includes(q))
        );
        
        if (!titleMatch && !introMatch && !ingredientsMatch) {
          return false;
        }
      }
      
      return true;
    });
  },

  get filteredShoppingItems(): ShoppingItem[] {
    const q = this.shoppingSearch.toLowerCase().trim();
    const status = this.shoppingStatus;
    const zone = this.shoppingZone;
    
    return this.shoppingList.filter(item => {
      // 1. Zone filter
      if (zone !== 'all' && item.zone !== zone) {
        return false;
      }
      
      // 2. Status filter
      if (status === 'pending' && item.checked) {
        return false;
      }
      if (status === 'completed' && !item.checked) {
        return false;
      }
      
      // 3. Search filter
      if (q) {
        const nameMatch = item.name.toLowerCase().includes(q);
        const qtyMatch = item.qty.toLowerCase().includes(q);
        if (!nameMatch && !qtyMatch) {
          return false;
        }
      }
      
      return true;
    });
  }
};

// Mount the reactive store in the document scope using Petite-Vue
createApp({ store }).mount();
// Initialize preferences, auth observers, and service workers
store.init();
