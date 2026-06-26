// @ts-ignore
import { createApp, reactive } from '../lib/petite-vue.js';

let initializeApp: any = null;
let getAuth: any = null;
let signInWithPopup: any = null;
let GoogleAuthProvider: any = null;
let signOut: any = null;
let onAuthStateChanged: any = null;
let connectAuthEmulator: any = null;

let getFirestore: any = null;
let doc: any = null;
let collection: any = null;
let onSnapshot: any = null;
let setDoc: any = null;
let updateDoc: any = null;
let getDocs: any = null;
let deleteDoc: any = null;
let connectFirestoreEmulator: any = null;

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
  recipeId?: string;
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
  servings?: number;
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
  costPerServing?: number | { [pathway: string]: number };
  budgetCostPerServing?: number | { [pathway: string]: number };
  liked?: boolean;
  pinned?: boolean;
}

type PlannerMeal = 'breakfast' | 'midMorningSnack' | 'lunch' | 'afternoonSnack' | 'dinner' | 'eveningSnack';
type PlannerDay = Record<PlannerMeal, string>;
type WeeklyPlanner = Record<string, PlannerDay>;

const plannerDays = [
  { id: 'mon', label: 'Monday', shortLabel: 'Mon' },
  { id: 'tue', label: 'Tuesday', shortLabel: 'Tue' },
  { id: 'wed', label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thu', label: 'Thursday', shortLabel: 'Thu' },
  { id: 'fri', label: 'Friday', shortLabel: 'Fri' },
  { id: 'sat', label: 'Saturday', shortLabel: 'Sat' },
  { id: 'sun', label: 'Sunday', shortLabel: 'Sun' }
] as const;

const plannerMealSlots = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'midMorningSnack', label: 'Mid-morning snack' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'afternoonSnack', label: 'Afternoon snack' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'eveningSnack', label: 'Evening snack' }
] as const;

const plannerMainMealSlots = plannerMealSlots.filter(({ id }) =>
  id === 'breakfast' || id === 'lunch' || id === 'dinner'
);

const plannerSnackSlots = plannerMealSlots.filter(({ id }) =>
  id === 'midMorningSnack' || id === 'afternoonSnack' || id === 'eveningSnack'
);

function createEmptyPlanner(): WeeklyPlanner {
  return Object.fromEntries(plannerDays.map(({ id }) => [
    id,
    { breakfast: '', midMorningSnack: '', lunch: '', afternoonSnack: '', dinner: '', eveningSnack: '' }
  ])) as WeeklyPlanner;
}

function normalizePlanner(raw: any): WeeklyPlanner {
  const normalized = createEmptyPlanner();
  plannerDays.forEach(({ id: day }) => {
    plannerMealSlots.forEach(({ id: meal }) => {
      if (typeof raw?.[day]?.[meal] === 'string') {
        normalized[day][meal] = raw[day][meal];
      }
    });
  });
  return normalized;
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
    caloriesPerServing: 460,
    carbsPerServing: 50,
    gi: 35,
    costPerServing: 3.50,
    budgetCostPerServing: 2.00,
    ingredients: [
      { name: 'brown or green lentils, dry', qty: 180, unit: 'g', zone: 'bulk', alt: 'generic brown lentils', cupWeight: 180, tbspWeight: 11.5 },
      { name: 'firm tofu, cubed', qty: 300, unit: 'g', zone: 'asian', alt: 'supermarket own-brand firm tofu', cupWeight: 220 },
      { name: 'sweet potato or potato, diced', qty: 300, unit: 'g', zone: 'greengrocer', alt: 'ordinary dirty potatoes', cupWeight: 150 },
      { name: 'cauliflower, florets', qty: 400, unit: 'g', zone: 'greengrocer', alt: 'frozen cauliflower florets', cupWeight: 100 },
      { name: 'carrots, sliced', qty: 200, unit: 'g', zone: 'greengrocer', alt: 'bulk carrots', cupWeight: 120 },
      { name: 'celery, sliced', qty: 150, unit: 'g', zone: 'greengrocer', alt: 'celery stalks', cupWeight: 100 },
      { name: 'onion, diced', qty: 150, unit: 'g', zone: 'greengrocer', alt: 'brown onions', cupWeight: 150 },
      { name: 'garlic, minced', qty: 4, unit: 'clove', zone: 'greengrocer', alt: 'jar minced garlic' },
      { name: 'tinned chopped tomatoes (no salt)', qty: 2, unit: 'tin', zone: 'supermarket', alt: 'home brand tinned tomatoes' },
      { name: 'spinach or kale', qty: 150, unit: 'g', zone: 'supermarket', alt: 'frozen spinach blocks', cupWeight: 30 },
      { name: 'lower-sodium tamari or soy sauce', qty: 2, unit: 'tbsp', zone: 'asian', alt: 'supermarket house brand soy', tbspWeight: 15 },
      { name: 'extra virgin olive oil', qty: 2, unit: 'tbsp', zone: 'supermarket', alt: 'standard cooking olive oil', tbspWeight: 14 },
      { name: 'lemon juice or vinegar', qty: 2, unit: 'tbsp', zone: 'greengrocer', alt: 'bottled lemon juice', tbspWeight: 15 },
      { name: 'water or low-salt stock', qty: 1000, unit: 'ml', zone: 'supermarket', alt: 'plain water / home stock', cupWeight: 250, tbspWeight: 15 }
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
    caloriesPerServing: 360,
    carbsPerServing: 28,
    gi: 30,
    costPerServing: 5.00,
    budgetCostPerServing: 2.80,
    ingredients: [
      { name: 'mushrooms, sliced', qty: 400, unit: 'g', zone: 'greengrocer', alt: 'canned sliced mushrooms', cupWeight: 70 },
      { name: 'cucumber, chopped', qty: 1, unit: 'large', zone: 'greengrocer', alt: 'local cucumber' },
      { name: 'kale or mixed leafy greens', qty: 150, unit: 'g', zone: 'greengrocer', alt: 'shredded cabbage / slaw mix', cupWeight: 25 },
      { name: 'edamame, tofu, or chickpeas', qty: 200, unit: 'g', zone: 'supermarket', alt: 'canned drained chickpeas', cupWeight: 170 },
      { name: 'olive or canola oil', qty: 1, unit: 'tbsp', zone: 'supermarket', alt: 'canola oil', tbspWeight: 14 },
      { name: 'apple cider vinegar or rice vinegar', qty: 2, unit: 'tbsp', zone: 'supermarket', alt: 'white vinegar', tbspWeight: 15 },
      { name: 'lemon juice', qty: 1, unit: 'tbsp', zone: 'greengrocer', alt: 'bottled lemon juice', tbspWeight: 15 },
      { name: 'nutritional yeast (savoury)', qty: 2, unit: 'tbsp', zone: 'bulk', alt: 'omit / home spices', tbspWeight: 5 },
      { name: 'sesame seeds', qty: 1, unit: 'tbsp', zone: 'bulk', alt: 'sunflower seeds', tbspWeight: 9 }
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
    defaultServings: 1,
    intro: "A fiber-packed, slow-digesting overnight breakfast. Offers two evidence-based dietary pathways: Satiety Oats default or a Lower-Carb seeds/nuts configuration.",
    cookingTime: "10 Mins (Overnight)",
    typeBadge: "Breakfast",
    imgUrl: "images/parfait.png",
    caloriesPerServing: { oats: 600, lowcarb: 600 },
    carbsPerServing: { oats: 64, lowcarb: 53 },
    gi: { oats: 45, lowcarb: 25 },
    costPerServing: { oats: 4.60, lowcarb: 5.40 },
    budgetCostPerServing: { oats: 2.60, lowcarb: 3.10 },
    ingredients: {
      oats: [
        { name: 'rolled or steel-cut oats', qty: 40, unit: 'g', zone: 'bulk', alt: 'supermarket rolled oats', cupWeight: 90, tbspWeight: 6 },
        { name: 'chia seeds', qty: 12, unit: 'g', zone: 'supermarket', alt: 'flaxseeds only', cupWeight: 160, tbspWeight: 10 },
        { name: 'ground flaxseed', qty: 12, unit: 'g', zone: 'supermarket', alt: 'ground linseed', cupWeight: 150, tbspWeight: 7.5 },
        { name: 'plain unsweetened yoghurt / soy yoghurt', qty: 160, unit: 'g', zone: 'supermarket', alt: 'supermarket brand Greek yoghurt', cupWeight: 240 },
        { name: 'milk or fortified unsweetened soy drink', qty: 150, unit: 'ml', zone: 'supermarket', alt: 'generic soy milk', cupWeight: 250, tbspWeight: 15 },
        { name: 'berries, fresh or frozen', qty: 150, unit: 'g', zone: 'supermarket', alt: 'frozen mixed berries', cupWeight: 150 },
        { name: 'nuts, chopped', qty: 15, unit: 'g', zone: 'bulk', alt: 'peanuts', cupWeight: 130, tbspWeight: 8 },
        { name: 'cinnamon', qty: 0.5, unit: 'tsp', zone: 'bulk', alt: 'cinnamon powder' }
      ],
      lowcarb: [
        { name: 'rolled or steel-cut oats', qty: 15, unit: 'g', zone: 'bulk', alt: 'supermarket rolled oats', cupWeight: 90, tbspWeight: 6 },
        { name: 'chia seeds', qty: 18, unit: 'g', zone: 'supermarket', alt: 'chia seeds', cupWeight: 160, tbspWeight: 10 },
        { name: 'ground flaxseed', qty: 18, unit: 'g', zone: 'supermarket', alt: 'ground flaxseed', cupWeight: 150, tbspWeight: 7.5 },
        { name: 'plain unsweetened yoghurt / soy yoghurt', qty: 160, unit: 'g', zone: 'supermarket', alt: 'supermarket brand Greek yoghurt', cupWeight: 240 },
        { name: 'milk or fortified unsweetened soy drink', qty: 150, unit: 'ml', zone: 'supermarket', alt: 'generic soy milk', cupWeight: 250, tbspWeight: 15 },
        { name: 'berries, fresh or frozen', qty: 150, unit: 'g', zone: 'supermarket', alt: 'frozen mixed berries', cupWeight: 150 },
        { name: 'nuts, chopped', qty: 20, unit: 'g', zone: 'bulk', alt: 'peanuts', cupWeight: 130, tbspWeight: 8 },
        { name: 'cinnamon', qty: 0.5, unit: 'tsp', zone: 'bulk', alt: 'cinnamon powder' }
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
  },
  {
    id: "egg-veggie-noodle-soup",
    title: "10-Minute Egg & Veggie Noodle Soup",
    category: "healthy",
    defaultServings: 1,
    intro: "A fast miso noodle soup built from soba, frozen vegetables and eggs. It delivers a more filling, lower-sodium upgrade on instant noodles with protein, fibre and umami.",
    cookingTime: "10 Mins",
    typeBadge: "Soup",
    imgUrl: "images/egg-noodle-soup.png",
    caloriesPerServing: 540,
    carbsPerServing: 66,
    gi: 45,
    ingredients: [
      { name: "soba noodles", qty: 80, unit: "g", zone: "bulk", alt: "wholewheat egg noodles" },
      { name: "frozen mixed vegetables", qty: 150, unit: "g", zone: "supermarket", alt: "frozen peas and carrots" },
      { name: "eggs", qty: 2, unit: "egg", zone: "supermarket", alt: "liquid egg whites" },
      { name: "reduced-salt miso paste", qty: 20, unit: "g", zone: "asian", alt: "0.5 low-salt stock cube and 5 ml low-salt soy sauce" },
      { name: "garlic powder", qty: 0.5, unit: "tsp", zone: "supermarket", alt: "1 small garlic clove, finely grated" },
      { name: "ground ginger", qty: 0.25, unit: "tsp", zone: "supermarket", alt: "0.5 tsp fresh grated ginger" },
      { name: "white pepper", qty: 0.125, unit: "tsp", zone: "supermarket", alt: "black pepper" },
      { name: "rice vinegar", qty: 1, unit: "tsp", zone: "asian", alt: "apple cider vinegar" },
      { name: "toasted sesame oil", qty: 0.5, unit: "tsp", zone: "asian", alt: "olive oil" },
      { name: "water", qty: 500, unit: "ml", zone: "supermarket", alt: "salt-free vegetable stock" }
    ],
    instructions: [
      "Boil the soba noodles in 500 ml water; when almost tender, add the frozen mixed vegetables and simmer for 2 minutes.",
      "Turn off the heat and stir in the miso paste until dissolved, then add garlic powder, ground ginger, white pepper, rice vinegar and sesame oil.",
      "Crack in the eggs, gently stir for about 30 seconds to form ribbons, then cover and let the soup stand for 1 minute to finish cooking."
    ],
    scienceNotes: [
      "Eggs add high-quality protein, which generally increases satiety compared with a noodle-only soup.",
      "Buckwheat noodles and mixed vegetables provide more fibre and a lower glycaemic load than refined instant noodles."
    ]
  },
  {
    id: "gochujang-miso-booster",
    title: "Gochujang–Miso Booster",
    category: "healthy",
    defaultServings: 1,
    intro: "A quick umami-heat booster for soups, noodles or grain bowls. The blend layers fermented savoury notes with a small amount of chilli sweetness so you can build flavour without much extra sodium.",
    cookingTime: "2 Mins",
    typeBadge: "Sauce",
    imgUrl: "images/gochujang-booster.png",
    caloriesPerServing: 85,
    carbsPerServing: 5,
    gi: 28,
    ingredients: [
      { name: "gochujang", qty: 2, unit: "tsp", zone: "asian", alt: "sambal oelek plus 0.5 tsp tomato paste" },
      { name: "low-salt soy sauce", qty: 1, unit: "tsp", zone: "asian", alt: "tamari" },
      { name: "garlic powder", qty: 1, unit: "tsp", zone: "supermarket", alt: "1 garlic clove, finely grated" },
      { name: "toasted sesame oil", qty: 1, unit: "tsp", zone: "asian", alt: "olive oil" },
      { name: "vinegar", qty: 1, unit: "tsp", zone: "supermarket", alt: "rice vinegar" }
    ],
    instructions: [
      "Whisk the gochujang, soy sauce, garlic powder, sesame oil and vinegar together in a small bowl until smooth.",
      "Stir the booster into hot soup, noodles or rice bowls just before serving."
    ],
    scienceNotes: [
      "Fermented soybean pastes such as gochujang and miso concentrate umami, which can improve flavour intensity even in relatively light meals.",
      "Using acidic ingredients like vinegar can brighten flavour perception and sometimes helps reduce the need for extra salt."
    ]
  },
  {
    id: "loaded-potato-cottage-cheese-chickpeas",
    title: "Loaded Potato with Cottage Cheese & Chickpeas",
    category: "healthy",
    defaultServings: 1,
    intro: "A microwave jacket potato topped with cottage cheese, chickpeas and green vegetables. It is designed for low-cost fullness by combining a high-satiety potato base with protein and fibre.",
    cookingTime: "7 Mins",
    typeBadge: "Jacket Potato",
    imgUrl: "images/loaded-potato.png",
    caloriesPerServing: 480,
    carbsPerServing: 61,
    gi: 52,
    ingredients: [
      { name: "potato", qty: 300, unit: "g", zone: "greengrocer", alt: "sweet potato" },
      { name: "chickpeas", qty: 120, unit: "g", zone: "supermarket", alt: "cannellini beans" },
      { name: "reduced-fat cottage cheese", qty: 150, unit: "g", zone: "supermarket", alt: "high-protein plain yoghurt" },
      { name: "frozen broccoli florets", qty: 100, unit: "g", zone: "supermarket", alt: "frozen brussels sprouts" },
      { name: "black pepper", qty: 0.25, unit: "tsp", zone: "supermarket", alt: "white pepper" }
    ],
    instructions: [
      "Pierce the potato and microwave for about 5 minutes until soft; alternatively, parboil it in kettle water for about 10 minutes.",
      "Microwave the broccoli and drained chickpeas together in a bowl for about 2 minutes until hot.",
      "Split the potato open, top with the cottage cheese, chickpeas and broccoli, then season with black pepper."
    ],
    scienceNotes: [
      "Potatoes are highly satiating per calorie, especially when eaten with the skin for extra fibre and volume.",
      "Combining dairy protein with chickpea fibre slows gastric emptying and generally gives steadier post-meal hunger control."
    ]
  },
  {
    id: "tofu-veggie-stir-fry-brown-rice",
    title: "Tofu Veggie Stir-Fry with Brown Rice",
    category: "healthy",
    defaultServings: 1,
    intro: "A fast plant-based stir-fry using crumbled tofu, frozen vegetables and microwave brown rice. It emphasises whole grains, moderate glycaemic load and practical weeknight protein.",
    cookingTime: "10 Mins",
    typeBadge: "Stir-Fry",
    imgUrl: "images/tofu-stir-fry.png",
    caloriesPerServing: 490,
    carbsPerServing: 44,
    gi: 42,
    ingredients: [
      { name: "firm tofu", qty: 200, unit: "g", zone: "asian", alt: "2 eggs" },
      { name: "frozen stir-fry vegetable mix", qty: 200, unit: "g", zone: "supermarket", alt: "frozen mixed vegetables" },
      { name: "cooking oil", qty: 1, unit: "tsp", zone: "supermarket", alt: "olive oil spray" },
      { name: "reduced-salt soy sauce", qty: 1, unit: "tbsp", zone: "asian", alt: "tamari" },
      { name: "cooked brown rice", qty: 125, unit: "g", zone: "supermarket", alt: "cooked quinoa" }
    ],
    instructions: [
      "Heat the oil in a non-stick pan, crumble in the tofu and stir-fry with the frozen vegetables on high heat for about 5 minutes.",
      "When the vegetables are hot and the tofu is lightly browned, add the soy sauce and toss for about 30 seconds.",
      "Microwave the brown rice and serve the stir-fry over the rice."
    ],
    scienceNotes: [
      "Soy foods such as tofu supply complete plant protein, which supports fullness and muscle protein synthesis.",
      "Brown rice and mixed vegetables typically produce a lower glycaemic response than a stir-fry built around refined white rice alone."
    ]
  },
  {
    id: "lentil-spinach-curry-brown-rice",
    title: "Lentil Spinach Curry with Brown Rice",
    category: "longevity",
    defaultServings: 1,
    intro: "A microwave lentil curry with spinach, brown rice and yoghurt for creaminess. The recipe is built around legumes, greens and intact grains to keep glycaemic impact modest.",
    cookingTime: "7 Mins",
    typeBadge: "Curry",
    imgUrl: "images/lentil-curry.png",
    caloriesPerServing: 460,
    carbsPerServing: 43,
    gi: 34,
    ingredients: [
      { name: "cooked brown rice", qty: 125, unit: "g", zone: "supermarket", alt: "cooked barley" },
      { name: "brown lentils", qty: 240, unit: "g", zone: "supermarket", alt: "green lentils" },
      { name: "frozen chopped spinach", qty: 100, unit: "g", zone: "supermarket", alt: "frozen kale" },
      { name: "curry powder", qty: 1, unit: "tsp", zone: "supermarket", alt: "garam masala" },
      { name: "unsweetened greek yoghurt", qty: 100, unit: "g", zone: "supermarket", alt: "unsweetened soy yoghurt" },
      { name: "water", qty: 30, unit: "ml", zone: "supermarket", alt: "salt-free vegetable stock" }
    ],
    instructions: [
      "Microwave the brown rice for 90 seconds.",
      "In a bowl, combine the drained lentils, frozen spinach, water and curry powder, then microwave for about 3 minutes, stirring once.",
      "Stir the yoghurt through the hot lentil mixture and spoon it over the warm brown rice."
    ],
    scienceNotes: [
      "Lentils are rich in slowly digested starch and soluble fibre, which generally lower post-meal glucose and improve satiety.",
      "Leafy greens supply folate, vitamin K and carotenoids while adding bulk with very little energy density."
    ]
  },
  {
    id: "sardine-chickpea-couscous-bowl",
    title: "Sardine & Chickpea Couscous Bowl",
    category: "healthy",
    defaultServings: 1,
    intro: "A pantry-friendly couscous bowl with sardines, chickpeas and mixed vegetables. It pairs omega-3-rich fish with fibre-rich legumes for a filling meal with minimal prep.",
    cookingTime: "7 Mins",
    typeBadge: "Bowl",
    imgUrl: "images/sardine-couscous.png",
    caloriesPerServing: 500,
    carbsPerServing: 44,
    gi: 46,
    ingredients: [
      { name: "instant wholemeal couscous", qty: 40, unit: "g", zone: "bulk", alt: "quick-cook bulgur" },
      { name: "sardines in springwater", qty: 100, unit: "g", zone: "supermarket", alt: "tuna in springwater" },
      { name: "chickpeas", qty: 120, unit: "g", zone: "supermarket", alt: "cannellini beans" },
      { name: "frozen mixed vegetables", qty: 150, unit: "g", zone: "supermarket", alt: "frozen cauliflower and pea mix" },
      { name: "lemon juice", qty: 1, unit: "tsp", zone: "greengrocer", alt: "vinegar" },
      { name: "black pepper", qty: 0.25, unit: "tsp", zone: "supermarket", alt: "white pepper" },
      { name: "boiling water", qty: 60, unit: "ml", zone: "supermarket", alt: "hot stock" }
    ],
    instructions: [
      "Put the couscous in a bowl with 60 ml boiling water, cover and let it stand for 5 minutes.",
      "Microwave the frozen vegetables and drained chickpeas for about 2 minutes until hot.",
      "Fluff the couscous, fold through the vegetables, chickpeas and flaked sardines, then finish with lemon juice and black pepper."
    ],
    scienceNotes: [
      "Sardines provide EPA and DHA omega-3 fats, which are associated with cardiovascular benefits when they replace more heavily processed proteins.",
      "Legumes and vegetables increase meal volume and fibre, which can improve fullness relative to a fish-and-grain meal alone."
    ]
  },
  {
    id: "smoky-paprika-marjoram-blade-stew",
    title: "Smoky Paprika & Marjoram Blade Stew",
    category: "regular",
    defaultServings: 5,
    intro: "A slow-cooked beef stew built on blade steak, paprika, tomato paste and aromatic vegetables. It keeps a traditional comfort-food profile while using moist heat and plenty of vegetables for a more balanced bowl.",
    cookingTime: "8 Hrs",
    typeBadge: "Stew",
    imgUrl: "images/blade-stew.png",
    caloriesPerServing: 565,
    carbsPerServing: 10,
    gi: 19,
    ingredients: [
      { name: "blade steak", qty: 1200, unit: "g", zone: "supermarket", alt: "beef chuck" },
      { name: "fine salt", qty: 11, unit: "g", zone: "supermarket", alt: "sea salt" },
      { name: "black pepper", qty: 1, unit: "tsp", zone: "supermarket", alt: "white pepper" },
      { name: "olive oil", qty: 2, unit: "tbsp", zone: "supermarket", alt: "canola oil" },
      { name: "onion", qty: 1, unit: "whole", zone: "greengrocer", alt: "2 medium brown onions" },
      { name: "carrot", qty: 2, unit: "whole", zone: "greengrocer", alt: "frozen diced carrots" },
      { name: "celery", qty: 2, unit: "stick", zone: "greengrocer", alt: "fennel" },
      { name: "leek", qty: 0.5, unit: "whole", zone: "greengrocer", alt: "extra onion" },
      { name: "yellow capsicum", qty: 1, unit: "whole", zone: "greengrocer", alt: "red capsicum" },
      { name: "garlic", qty: 4, unit: "clove", zone: "greengrocer", alt: "2 tsp jar garlic" },
      { name: "smoked paprika", qty: 1.25, unit: "tbsp", zone: "supermarket", alt: "sweet paprika plus a pinch of cumin" },
      { name: "dried marjoram", qty: 1, unit: "tsp", zone: "supermarket", alt: "dried oregano" },
      { name: "bay leaf", qty: 1, unit: "leaf", zone: "supermarket", alt: "thyme sprig" },
      { name: "tomato paste", qty: 75, unit: "g", zone: "supermarket", alt: "passata reduced on the stove" },
      { name: "low-sodium beef stock", qty: 375, unit: "ml", zone: "supermarket", alt: "salt-reduced vegetable stock" },
      { name: "balsamic vinegar", qty: 1.5, unit: "tbsp", zone: "supermarket", alt: "red wine vinegar" },
      { name: "butter", qty: 20, unit: "g", zone: "supermarket", alt: "olive oil" },
      { name: "cornflour", qty: 1, unit: "tbsp", zone: "supermarket", alt: "plain flour" },
      { name: "cold water", qty: 2, unit: "tbsp", zone: "supermarket", alt: "stock" }
    ],
    instructions: [
      "Season the beef with salt and pepper, then brown it in batches in olive oil until well coloured.",
      "Cook the onion, carrot, celery, leek and capsicum until lightly golden, add the garlic, then briefly darken the tomato paste and stir in the smoked paprika off the heat.",
      "Deglaze the pan with a little stock, transfer everything to the slow cooker with the marjoram, bay leaf, remaining stock and beef, then cook on low for 6 to 8 hours until fork-tender.",
      "Stir in the balsamic vinegar, and if you want a thicker sauce, add a cornflour slurry near the end and cook on high until glossy.",
      "Off the heat, whisk in the butter for shine, then taste and adjust the seasoning before serving."
    ],
    scienceNotes: [
      "Slow, moist cooking generally forms fewer advanced glycation end-products than hard charring or dry roasting of meat.",
      "Adding onions, carrots, celery and capsicum increases potassium, phytochemicals and fibre without heavily changing the classic stew profile."
    ]
  },
  {
    id: "chocolate-buckwheat-protein-bars",
    title: "Simple Crunchy Chocolate Buckwheat Protein Bars",
    category: "protein-dense",
    defaultServings: 12,
    intro: "A high-protein baked bar made with plant proteins, cocoa, tahini and crunchy buckwheat groats. It is formulated as a portable recovery snack with more protein and fibre than a standard sweet bake.",
    cookingTime: "35 Mins",
    typeBadge: "Bar",
    imgUrl: "images/protein-bars.png",
    caloriesPerServing: 305,
    carbsPerServing: 17,
    gi: 38,
    ingredients: [
      { name: "chocolate plant protein powder", qty: 180, unit: "g", zone: "supermarket", alt: "vanilla plant protein powder plus extra cocoa" },
      { name: "unflavoured pea protein", qty: 80, unit: "g", zone: "supermarket", alt: "soy protein isolate" },
      { name: "coconut flour", qty: 60, unit: "g", zone: "bulk", alt: "oat flour" },
      { name: "semolina", qty: 100, unit: "g", zone: "bulk", alt: "fine oat flour" },
      { name: "tapioca starch", qty: 40, unit: "g", zone: "bulk", alt: "cornstarch" },
      { name: "cocoa powder", qty: 40, unit: "g", zone: "supermarket", alt: "raw cacao powder" },
      { name: "baking powder", qty: 2, unit: "tsp", zone: "supermarket", alt: "self-raising flour and omit semolina" },
      { name: "bicarbonate of soda", qty: 0.25, unit: "tsp", zone: "supermarket", alt: "extra baking powder" },
      { name: "potassium chloride salt substitute", qty: 0.5, unit: "tsp", zone: "supermarket", alt: "fine salt" },
      { name: "ground cinnamon", qty: 2, unit: "tsp", zone: "supermarket", alt: "pumpkin spice" },
      { name: "ground nutmeg", qty: 0.5, unit: "tsp", zone: "supermarket", alt: "mixed spice" },
      { name: "buckwheat groats", qty: 120, unit: "g", zone: "bulk", alt: "rolled oats" },
      { name: "sesame seeds", qty: 30, unit: "g", zone: "bulk", alt: "hemp seeds" },
      { name: "pear puree", qty: 140, unit: "g", zone: "greengrocer", alt: "apple puree" },
      { name: "banana", qty: 1, unit: "whole", zone: "greengrocer", alt: "extra pear or apple puree" },
      { name: "eggs", qty: 3, unit: "egg", zone: "supermarket", alt: "flax eggs" },
      { name: "tahini", qty: 100, unit: "g", zone: "asian", alt: "peanut butter" },
      { name: "extra-virgin olive oil", qty: 10, unit: "g", zone: "supermarket", alt: "canola oil" },
      { name: "brandy", qty: 30, unit: "ml", zone: "supermarket", alt: "vanilla extract and extra almond milk" },
      { name: "unsweetened almond milk", qty: 495, unit: "ml", zone: "supermarket", alt: "skim milk" },
      { name: "granulated 1:1 sweetener", qty: 95, unit: "g", zone: "supermarket", alt: "caster sugar" }
    ],
    instructions: [
      "Microwave the diced pear with a teaspoon of water and a little lemon juice until soft, mash it smooth and weigh out 140 g of puree, then mash in the banana.",
      "Heat the oven to 180°C and line a roughly 33 x 23 cm baking dish with paper.",
      "Whisk the pear-banana puree with the eggs, tahini, olive oil, brandy, almond milk and sweetener until smooth.",
      "Fold in all the dry ingredients, then stir through the buckwheat groats and spread the batter to a 2 to 3 cm thickness; scatter over the sesame seeds if using.",
      "Bake for 28 to 34 minutes until the centre springs back and a skewer shows moist crumbs, cool for 30 minutes, chill for 1 hour and cut into 12 bars."
    ],
    scienceNotes: [
      "Protein-enriched snacks can improve fullness and help distribute protein more evenly across the day, especially around training.",
      "Cocoa, buckwheat and tahini contribute polyphenols, minerals and fibre that make the carbohydrate profile slower than a conventional frosted bar."
    ]
  },
  {
    id: "matts-cheap-super-veggie-variant",
    title: "Matt’s Cheap Super Veggie Variant",
    category: "longevity",
    defaultServings: 4,
    intro: "A batch-prepped vegetable and black lentil meal built around broccoli, cauliflower, shiitake and a turmeric-cumin dressing. It is extremely produce-forward, fibre-dense and designed for freezer-friendly longevity eating.",
    cookingTime: "45 Mins",
    typeBadge: "Prep Box",
    imgUrl: "images/super-veggie.png",
    caloriesPerServing: 420,
    carbsPerServing: 34,
    gi: 25,
    ingredients: [
      { name: "turmeric", qty: 1, unit: "tbsp", zone: "supermarket", alt: "ground turmeric and curry powder blend" },
      { name: "black pepper", qty: 1, unit: "tsp", zone: "supermarket", alt: "white pepper" },
      { name: "ginger powder", qty: 1, unit: "tbsp", zone: "supermarket", alt: "fresh grated ginger" },
      { name: "ground cumin", qty: 3, unit: "tbsp", zone: "supermarket", alt: "curry powder" },
      { name: "potassium chloride", qty: 1, unit: "tsp", zone: "supermarket", alt: "fine salt" },
      { name: "broccoli", qty: 3, unit: "head", zone: "greengrocer", alt: "broccolini" },
      { name: "cauliflower", qty: 1, unit: "whole", zone: "greengrocer", alt: "2 small cauliflowers" },
      { name: "shiitake mushrooms", qty: 200, unit: "g", zone: "greengrocer", alt: "button mushrooms" },
      { name: "dry black lentils", qty: 180, unit: "g", zone: "bulk", alt: "brown lentils" },
      { name: "lime juice", qty: 4, unit: "tbsp", zone: "greengrocer", alt: "lemon juice" },
      { name: "garlic paste", qty: 2, unit: "tbsp", zone: "supermarket", alt: "4 garlic cloves, crushed" },
      { name: "extra-virgin olive oil", qty: 2, unit: "tbsp", zone: "supermarket", alt: "canola oil" },
      { name: "apple cider vinegar", qty: 4, unit: "tbsp", zone: "supermarket", alt: "white wine vinegar" },
      { name: "cacao nibs", qty: 1, unit: "tbsp", zone: "bulk", alt: "chopped walnuts" },
      { name: "hemp seeds", qty: 1.5, unit: "tsp", zone: "bulk", alt: "sesame seeds" },
      { name: "nutritional yeast", qty: 1, unit: "tsp", zone: "supermarket", alt: "finely grated parmesan" }
    ],
    instructions: [
      "The day before, bloom the turmeric, ginger and black pepper with a splash of boiling water, then stir in the cumin, lime juice, garlic paste, apple cider vinegar and olive oil and refrigerate the dressing.",
      "Cook the soaked lentils until tender, steam the finely chopped broccoli and cauliflower stems first, then add the cauliflower florets, remaining broccoli and shiitake and steam until just soft.",
      "Blend the cooked stem mixture with the dressing, divide the lentils and vegetables between four containers, spoon over the blended sauce and top each serve with shiitake.",
      "When serving, finish each portion with cacao nibs, hemp seeds and nutritional yeast."
    ],
    scienceNotes: [
      "Cruciferous vegetables such as broccoli and cauliflower provide glucosinolate precursors that are studied for their role in cellular defence pathways.",
      "Lentils, mushrooms and seeds increase fibre, prebiotic substrates and mineral density while keeping the meal’s glycaemic response low."
    ]
  },
  {
    id: "creamy-dijon-chicken-mince",
    title: "Creamy Dijon Chicken Mince with Potatoes & Tomatoes",
    category: "regular",
    defaultServings: 4,
    intro: "A creamy chicken mince skillet with potatoes, tomatoes and Dijon served over rice. It keeps the comfort-food body of a mince-and-sauce dinner while leaning on chicken for a lighter protein base.",
    cookingTime: "40 Mins",
    typeBadge: "Skillet",
    imgUrl: "images/dijon-chicken.png",
    caloriesPerServing: 690,
    carbsPerServing: 74,
    gi: 56,
    ingredients: [
      { name: "chicken mince", qty: 500, unit: "g", zone: "supermarket", alt: "turkey mince" },
      { name: "potato", qty: 300, unit: "g", zone: "greengrocer", alt: "sweet potato" },
      { name: "tomato", qty: 2, unit: "whole", zone: "greengrocer", alt: "200 g canned diced tomatoes" },
      { name: "brown onion", qty: 1, unit: "whole", zone: "greengrocer", alt: "2 small onions" },
      { name: "garlic", qty: 3, unit: "clove", zone: "greengrocer", alt: "1.5 tsp jar garlic" },
      { name: "sour cream", qty: 200, unit: "ml", zone: "supermarket", alt: "plain greek yoghurt" },
      { name: "dijon mustard", qty: 1.5, unit: "tbsp", zone: "supermarket", alt: "wholegrain mustard" },
      { name: "stock", qty: 250, unit: "ml", zone: "supermarket", alt: "water plus 1 stock cube" },
      { name: "uncooked rice", qty: 300, unit: "g", zone: "bulk", alt: "basmati rice" },
      { name: "dried mixed herbs", qty: 1, unit: "tsp", zone: "supermarket", alt: "0.5 tsp thyme and 0.5 tsp oregano" },
      { name: "paprika", qty: 0.5, unit: "tsp", zone: "supermarket", alt: "sweet smoked paprika" },
      { name: "peas or baby spinach", qty: 60, unit: "g", zone: "supermarket", alt: "frozen mixed vegetables" },
      { name: "oil", qty: 1.5, unit: "tbsp", zone: "supermarket", alt: "olive oil spray" },
      { name: "salt", qty: 0.5, unit: "tsp", zone: "supermarket", alt: "potassium salt" },
      { name: "black pepper", qty: 0.5, unit: "tsp", zone: "supermarket", alt: "white pepper" }
    ],
    instructions: [
      "Rinse the rice, simmer it with water and a pinch of salt until tender, then rest it covered.",
      "In a large pan, soften the onion in oil, add the garlic, then cook the diced potato for about 5 minutes before adding the chicken mince and browning it lightly.",
      "Stir in the tomato, dried herbs, paprika, stock and Dijon, season lightly and simmer for 10 to 15 minutes until the potatoes are tender; add the peas or spinach near the end if using.",
      "Temper the sour cream with a few spoonfuls of hot sauce, stir it gently back into the pan on low heat and warm through without boiling hard.",
      "Serve the creamy chicken mixture over the cooked rice."
    ],
    scienceNotes: [
      "Chicken mince usually provides a leaner saturated-fat profile than an equivalent beef mince dish, especially when paired with a yoghurt-style creamy element.",
      "Cooling and reheating potato-and-rice dishes can modestly increase resistant starch, which slightly reduces available glycaemic impact."
    ]
  },
  {
    id: "chicken-paprikash",
    title: "Chicken Paprikash",
    category: "regular",
    defaultServings: 4,
    intro: "A classic paprika-forward chicken braise finished with sour cream and cream. It is a rich traditional dish, but the wet-cooked format avoids the heavy browning load of roasted or fried chicken casseroles.",
    cookingTime: "1 Hr",
    typeBadge: "Braise",
    imgUrl: "images/chicken-paprikash.png",
    caloriesPerServing: 560,
    carbsPerServing: 16,
    gi: 19,
    ingredients: [
      { name: "butter", qty: 2, unit: "tbsp", zone: "supermarket", alt: "olive oil" },
      { name: "chicken pieces", qty: 1350, unit: "g", zone: "supermarket", alt: "bone-in chicken thighs" },
      { name: "onion", qty: 3, unit: "whole", zone: "greengrocer", alt: "2 large onions" },
      { name: "garlic paste", qty: 3, unit: "tsp", zone: "supermarket", alt: "3 garlic cloves, crushed" },
      { name: "tomato", qty: 3, unit: "whole", zone: "greengrocer", alt: "200 g canned diced tomatoes" },
      { name: "capsicum", qty: 1, unit: "whole", zone: "greengrocer", alt: "red bell pepper" },
      { name: "sweet hungarian paprika", qty: 3, unit: "tbsp", zone: "supermarket", alt: "sweet paprika" },
      { name: "salt", qty: 1.5, unit: "tsp", zone: "supermarket", alt: "potassium salt" },
      { name: "black pepper", qty: 0.5, unit: "tsp", zone: "supermarket", alt: "white pepper" },
      { name: "flour", qty: 2, unit: "tbsp", zone: "bulk", alt: "buckwheat flour" },
      { name: "sour cream", qty: 200, unit: "ml", zone: "supermarket", alt: "plain greek yoghurt" },
      { name: "cream", qty: 80, unit: "ml", zone: "supermarket", alt: "evaporated milk" },
      { name: "chicken broth", qty: 500, unit: "ml", zone: "supermarket", alt: "vegetable stock" }
    ],
    instructions: [
      "Brown the chicken pieces in butter, then remove them from the pan.",
      "In the same pan, briefly cook the onions, garlic, tomatoes and capsicum, then add the paprika, salt and pepper and return the chicken to the pot.",
      "Pour in the chicken broth until the chicken is mostly covered and simmer for about 40 minutes.",
      "Remove the chicken, whisk the flour with the sour cream and cream until smooth, then stir the mixture into the sauce to thicken it.",
      "Return the chicken to the pot and simmer gently until the sauce is creamy and fully heated through."
    ],
    scienceNotes: [
      "Paprika contributes carotenoid pigments and polyphenols, adding antioxidant compounds as well as flavour.",
      "Braising keeps the cooking environment moist, which generally produces fewer advanced glycation end-products than higher-temperature dry cooking."
    ]
  },
  {
    id: "bread-and-butter-pudding",
    title: "Bread and Butter Pudding",
    category: "treat",
    defaultServings: 6,
    intro: "A classic baked bread pudding with raisins, cinnamon and a rich milk-and-cream custard. It is best treated as a dessert-style recipe rather than an everyday staple because of its dense energy and sugar load.",
    cookingTime: "30 Mins",
    typeBadge: "Pudding",
    imgUrl: "images/bread-pudding.png",
    caloriesPerServing: 495,
    carbsPerServing: 55,
    gi: 60,
    ingredients: [
      { name: "bread", qty: 8, unit: "slice", zone: "supermarket", alt: "day-old wholemeal bread" },
      { name: "raisins", qty: 1, unit: "cup", zone: "bulk", alt: "sultanas" },
      { name: "eggs", qty: 3, unit: "egg", zone: "supermarket", alt: "2 eggs and 2 yolks" },
      { name: "milk", qty: 1.5, unit: "cup", zone: "supermarket", alt: "reduced-fat milk" },
      { name: "heavy cream", qty: 1, unit: "cup", zone: "supermarket", alt: "evaporated milk" },
      { name: "butter", qty: 3, unit: "tbsp", zone: "supermarket", alt: "light butter spread" },
      { name: "white sugar", qty: 0.5, unit: "cup", zone: "supermarket", alt: "caster sugar" },
      { name: "cinnamon", qty: 1, unit: "tsp", zone: "supermarket", alt: "mixed spice" },
      { name: "vanilla extract", qty: 1, unit: "tsp", zone: "supermarket", alt: "vanilla essence" }
    ],
    instructions: [
      "Heat the oven to 180°C and whisk the eggs with the milk, cream, sugar, cinnamon and vanilla.",
      "Soak the bread and raisins in the custard for about 3 minutes, then transfer the mixture to a baking dish and drizzle over the melted butter.",
      "Bake for 25 to 30 minutes until the custard is set and the top is lightly golden, then dust with icing sugar if desired."
    ],
    scienceNotes: [
      "Compared with savoury high-protein meals, desserts rich in refined starch, sugar and dairy fat usually have a higher energy density and weaker satiety per calorie.",
      "Using wholemeal bread or reducing the added sugar can modestly lower the glycaemic impact, but this remains a treat-style dish."
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

function formatQuantityWithUnit(qty: number, unit?: string): string {
  const formattedQty = qty.toFixed(1).replace(/\.0$/, '');
  return unit ? `${formattedQty} ${unit}` : formattedQty;
}

function toSafeDocId(value: string): string {
  const safe = value
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120);
  return safe || 'item';
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

/* ==========================================================================
   Petite-Vue Reactive App Store definition
   ========================================================================== */

const store = {
  // Authentication state
  user: null as any,
  loginEmail: '',
  isCheckingAuth: true,
  isFirebaseOnline: isFirebaseOnline,
  isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Navigation & Preferences
  activeTab: 'dashboard',
  theme: 'dark',
  servings: 4,
  budgetMode: false,
  parfaitPathway: 'oats' as 'oats' | 'lowcarb',
  unitSystem: 'metric' as 'metric' | 'cups' | 'spoons',
  exportFormat: 'markdown' as 'markdown' | 'keep',
  
  // Dashboard Plate ratios (Veg, Protein, Starch)
  plate: {
    veg: 50,
    prot: 25,
    starch: 25
  },
  
  // Satiety Calculator target inputs
  calcCalories: 2000,
  calcActivity: 1.375,
  
  activeRoadmapPhase: '2',
  
  // Recipe Search and filter inputs
  recipeSearch: '',
  recipeCategory: 'all',
  recipeMaxCaloriesEnabled: false,
  recipeMaxCalories: 800,
  recipeEnergyUnit: 'kcal',
  recipeShowLikedOnly: false,
  recipeShowPinnedOnly: false,
  
  // Shopping list Search and filter inputs
  shoppingSearch: '',
  shoppingStatus: 'all', // 'all' | 'pending' | 'completed'
  shoppingZone: 'all',   // 'all' | 'supermarket' | 'greengrocer' | 'bulk' | 'asian'
  shoppingShowLikedOnly: false,
  shoppingShowPinnedOnly: false,
  
  // Main Data lists
  recipes: [] as Recipe[],
  shoppingList: [] as ShoppingItem[],
  healthLogs: [] as LogEntry[],
  
  // Recipe tab views local state mapping
  recipeActiveViews: {} as Record<string, 'ingredients' | 'instructions' | 'notes'>,

  // Weekly Planner state mapping
  plannerDays,
  plannerMealSlots,
  plannerMainMealSlots,
  plannerSnackSlots,
  planner: createEmptyPlanner(),
  expandedPlannerSnackDays: {} as Record<string, boolean>,
  
  // Timer state for Dinner Stew simmering
  timerInterval: null as any,
  timerSecondsRemaining: 25 * 60,
  timerState: 'idle' as 'idle' | 'running' | 'paused',

  // Initialize store bindings and lifecycle events
  init() {
    this.loadLocalPreferences();
    
    // Safety timeout: if anything (including dynamic import loading or emulator checks) hangs,
    // release the loading spinner after 2.0 seconds so the user can choose offline bypass mode.
    setTimeout(() => {
      if (this.isCheckingAuth) {
        console.warn("[Auth] Initialization check timed out. Displaying auth gateway.");
        this.isCheckingAuth = false;
      }
    }, 2000);

    // Run Firebase initialization in the background, without blocking the main thread!
    this.initFirebase().then(() => {
      this.setupAuthListener();
      this.loadDatabaseSyncs();
    });

    this.updatePlateFromSliders();
    this.startPwaServiceWorker();
  },

  async initFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyCWRjKdIFJpKO94real379Vri7LSQleCI4",
      authDomain: "successor-health-hub.firebaseapp.com",
      projectId: "successor-health-hub",
      storageBucket: "successor-health-hub.firebasestorage.app",
      messagingSenderId: "947143207025",
      appId: "1:947143207025:web:74c5e6580c08c39f0213d0",
      measurementId: "G-LE8TLZQG0L"
    };

    try {
      // Dynamically load Firebase modules
      const appMod = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
      initializeApp = appMod.initializeApp;

      const authMod = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      getAuth = authMod.getAuth;
      signInWithPopup = authMod.signInWithPopup;
      GoogleAuthProvider = authMod.GoogleAuthProvider;
      signOut = authMod.signOut;
      onAuthStateChanged = authMod.onAuthStateChanged;
      connectAuthEmulator = authMod.connectAuthEmulator;

      const dbMod = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      getFirestore = dbMod.getFirestore;
      doc = dbMod.doc;
      collection = dbMod.collection;
      onSnapshot = dbMod.onSnapshot;
      setDoc = dbMod.setDoc;
      updateDoc = dbMod.updateDoc;
      getDocs = dbMod.getDocs;
      deleteDoc = dbMod.deleteDoc;
      connectFirestoreEmulator = dbMod.connectFirestoreEmulator;

      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      
      // Detect if running on localhost to automatically route to local emulators
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        // Quick check to see if emulators are reachable
        try {
          await fetch('http://localhost:9099', { method: 'GET', mode: 'no-cors' });
          connectAuthEmulator(auth, 'http://localhost:9099');
          connectFirestoreEmulator(db, 'localhost', 8080);
          console.log("[Firebase] Successfully connected to local emulators.");
          isFirebaseOnline = true;
          this.isFirebaseOnline = true;
        } catch (err) {
          console.warn("[Firebase] Local emulators are not running. Bypassing cloud sync.");
          isFirebaseOnline = false;
          this.isFirebaseOnline = false;
          auth = null; // Forces immediate fallback spinner release
        }
      } else {
        isFirebaseOnline = true;
        this.isFirebaseOnline = true;
      }
    } catch (e) {
      console.warn("[Firebase] Could not initialize dynamic libraries. Falling back to offline LocalStorage mode.", e);
      isFirebaseOnline = false;
      this.isFirebaseOnline = false;
    }
  },

  /* ====================================
     PWA & Service Worker
     ==================================== */
  startPwaServiceWorker() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("[PWA] Service Worker registered successfully."))
        .catch(err => console.error("[PWA] Service Worker registration failed:", err));

      // Force reload when a new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log("[PWA] New service worker took control, refreshing page...");
          window.location.reload();
        }
      });
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
    
    onAuthStateChanged(auth, (firebaseUser: any) => {
      this.isCheckingAuth = false;
      if (firebaseUser) {
        // Enforce strict email restriction rules
        const email = (firebaseUser.email || '').toLowerCase().trim();
        const allowedEmails = ['mpalmeralt@gmail.com', 'mpalmerwork45@gmail.com'];
        if (allowedEmails.includes(email)) {
          this.user = firebaseUser;
          this.loadDatabaseSyncs();
        } else {
          alert("Access Denied: This account is not authorized.");
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
    } catch (e: any) {
      console.error("Login failed:", e);
      const errorMsg = e?.message || e?.code || String(e);
      alert(`Authentication failed: ${errorMsg}`);
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

  setUnitSystem(unit: 'metric' | 'cups' | 'spoons') {
    this.unitSystem = unit;
    localStorage.setItem('successor_units', unit);
  },

  loadDatabaseSyncs() {
    if (!this.user) return;
    const uid = this.user.uid;
    
    // Add version dynamically to defaultRecipes
    defaultRecipes.forEach(r => {
      (r as any).version = 9;
    });

    // V8 Upgrade: Clear broken shopping lists automatically
    if (!localStorage.getItem('successor_v8_upgrade')) {
      this.clearShoppingList();
      localStorage.setItem('successor_v8_upgrade', 'true');
    }

    // Sync Recipes & Shopping List & Health Logs
    if (db && isFirebaseOnline) {
      // 1. Sync recipes (with self-healing auto-population if collection is empty or outdated)
      onSnapshot(collection(db, 'users', uid, 'recipes'), (snapshot: any) => {
        const items: Recipe[] = [];
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          items.push({ 
            id: doc.id, 
            ...data,
            liked: data.liked || false,
            pinned: data.pinned || false,
            servings: data.servings !== undefined ? data.servings : data.defaultServings
          } as Recipe);
        });
        
        // Sort recipes to keep structured display
        const order = [
          'stew', 'bowl', 'parfait', 'salmon', 'superveggie', 'nuttypudding', 'bark',
          'egg-veggie-noodle-soup', 'gochujang-miso-booster', 'loaded-potato-cottage-cheese-chickpeas',
          'tofu-veggie-stir-fry-brown-rice', 'lentil-spinach-curry-brown-rice', 'sardine-chickpea-couscous-bowl',
          'smoky-paprika-marjoram-blade-stew', 'chocolate-buckwheat-protein-bars', 'matts-cheap-super-veggie-variant',
          'creamy-dijon-chicken-mince', 'chicken-paprikash', 'bread-and-butter-pudding'
        ];
        items.sort((a, b) => {
          const idxA = order.indexOf(a.id);
          const idxB = order.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.title.localeCompare(b.title);
        });
        
        // Unconditionally display the recipes fetched from the database
        this.recipes = items;

        // Perform self-healing in the background without blocking the UI
        defaultRecipes.forEach(async (recipe) => {
          const existing = items.find(item => item.id === recipe.id);
          const isOutdated = !existing || (existing as any).version === undefined || (existing as any).version < (recipe as any).version;
          if (isOutdated) {
            console.log(`Self-healing recipe ${recipe.id} in database to version ${(recipe as any).version}...`);
            await setDoc(doc(db as any, 'users', uid, 'recipes', recipe.id), {
              ...recipe,
              servings: existing ? existing.servings : recipe.defaultServings
            });
          }
        });
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

      // 4. Sync Planner
      onSnapshot(doc(db, 'users', uid, 'planner', 'weekly'), (snapshot: any) => {
        if (snapshot.exists()) {
          this.planner = normalizePlanner(snapshot.data());
        }
      });
    } else {
      // Fallback local storage
      const localRecipes = localStorage.getItem('successor_recipes');
      const order = [
        'stew', 'bowl', 'parfait', 'salmon', 'superveggie', 'nuttypudding', 'bark',
        'egg-veggie-noodle-soup', 'gochujang-miso-booster', 'loaded-potato-cottage-cheese-chickpeas',
        'tofu-veggie-stir-fry-brown-rice', 'lentil-spinach-curry-brown-rice', 'sardine-chickpea-couscous-bowl',
        'smoky-paprika-marjoram-blade-stew', 'chocolate-buckwheat-protein-bars', 'matts-cheap-super-veggie-variant',
        'creamy-dijon-chicken-mince', 'chicken-paprikash', 'bread-and-butter-pudding'
      ];
      const sortRecipes = (list: Recipe[]) => {
        list.sort((a, b) => {
          const idxA = order.indexOf(a.id);
          const idxB = order.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.title.localeCompare(b.title);
        });
      };

      if (localRecipes) {
        const loaded = JSON.parse(localRecipes);
        const mapped = loaded.map((r: any) => ({
          ...r,
          liked: r.liked || false,
          pinned: r.pinned || false,
          servings: r.servings !== undefined ? r.servings : r.defaultServings
        }));
        
        let changed = false;
        defaultRecipes.forEach(defaultRecipe => {
          const exists = mapped.find((r: any) => r.id === defaultRecipe.id);
          if (!exists) {
            mapped.push({
              ...defaultRecipe,
              liked: false,
              pinned: false,
              servings: defaultRecipe.defaultServings
            });
            changed = true;
          }
        });
        
        sortRecipes(mapped);
        this.recipes = mapped;
        if (changed) {
          localStorage.setItem('successor_recipes', JSON.stringify(this.recipes));
        }
      } else {
        this.recipes = defaultRecipes.map(recipe => ({ 
          ...recipe,
          liked: false,
          pinned: false,
          servings: recipe.defaultServings
        }));
        sortRecipes(this.recipes);
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

      const localPlanner = localStorage.getItem('successor_planner');
      if (localPlanner) {
        this.planner = normalizePlanner(JSON.parse(localPlanner));
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
    const servingsCount = recipe.servings !== undefined ? recipe.servings : recipe.defaultServings;
    const factor = servingsCount / recipe.defaultServings;
    return list.map((ing: Ingredient) => this.formatIngredient(ing, factor));
  },

  /**
   * Main recipe conversion mapping. Computes quantity dynamically based on
   * scale factor, and formats weight/volume density values (grams, cups, spoons).
   */
  formatIngredient(ing: Ingredient, factor: number): { displayQty: string; name: string; isSwapped: boolean } {
    const qty = ing.qty * factor;
    const nameStr = this.budgetMode ? ing.alt : ing.name;
    const isSwapped = this.budgetMode && ing.alt !== ing.name;

    const formattedMetricQty = qty.toFixed(1).replace(/\.0$/, '');

    // Helper to pluralize units
    const getUnitLabel = (unit: string, qtyVal: number): string => {
      if (!unit) return '';
      const lower = unit.toLowerCase();
      const isPlural = qtyVal > 1;
      
      if (lower === 'g') return 'g';
      if (lower === 'ml') return 'ml';
      
      if (lower === 'clove' || lower === 'cloves') return isPlural ? 'cloves' : 'clove';
      if (lower === 'tin' || lower === 'tins') return isPlural ? 'tins' : 'tin';
      if (lower === 'lemon' || lower === 'lemons') return isPlural ? 'lemons' : 'lemon';
      if (lower === 'cup' || lower === 'cups') return isPlural ? 'cups' : 'cup';
      if (lower === 'tbsp' || lower === 'tablespoon' || lower === 'tablespoons') return isPlural ? 'tablespoons' : 'tablespoon';
      if (lower === 'tsp' || lower === 'teaspoon' || lower === 'teaspoons') return isPlural ? 'teaspoons' : 'teaspoon';
      if (lower === 'egg' || lower === 'eggs') return isPlural ? 'eggs' : 'egg';
      if (lower === 'stick' || lower === 'sticks') return isPlural ? 'sticks' : 'stick';
      if (lower === 'leaf' || lower === 'leaves') return isPlural ? 'leaves' : 'leaf';
      if (lower === 'whole') return 'whole';
      if (lower === 'large') return 'large';
      
      if (isPlural && !lower.endsWith('s')) {
        return unit + 's';
      }
      return unit;
    };

    let displayQtyVal: number = qty;
    let displayUnit: string = ing.unit;
    let showMetricBrackets = false;
    let bracketMetricQty = 0;
    let bracketMetricUnit = '';

    let showImperialBrackets = false;
    let bracketImperialQty = 0;
    let bracketImperialUnit = '';

    const isCupOrSpoonUnit = (u: string): boolean => {
      if (!u) return false;
      const lower = u.toLowerCase();
      return lower === 'cup' || lower === 'cups' || lower === 'tbsp' || lower === 'tablespoon' || lower === 'tablespoons' || lower === 'tsp' || lower === 'teaspoon' || lower === 'teaspoons';
    };

    if (this.unitSystem === 'cups') {
      if (ing.unit === 'g' && ing.cupWeight) {
        displayQtyVal = qty / ing.cupWeight;
        displayUnit = 'cup';
        showMetricBrackets = true;
        bracketMetricQty = qty;
        bracketMetricUnit = 'g';
      } else if (ing.unit === 'ml') {
        displayQtyVal = qty / 250;
        displayUnit = 'cup';
        showMetricBrackets = true;
        bracketMetricQty = qty;
        bracketMetricUnit = 'ml';
      } else if (isCupOrSpoonUnit(ing.unit)) {
        showMetricBrackets = true;
      }
    } else if (this.unitSystem === 'spoons') {
      if (ing.unit === 'g' && ing.tbspWeight) {
        displayQtyVal = qty / ing.tbspWeight;
        displayUnit = 'tbsp';
        showMetricBrackets = true;
        bracketMetricQty = qty;
        bracketMetricUnit = 'g';
      } else if (ing.unit === 'ml') {
        displayQtyVal = qty / 20;
        displayUnit = 'tbsp';
        showMetricBrackets = true;
        bracketMetricQty = qty;
        bracketMetricUnit = 'ml';
      } else if (isCupOrSpoonUnit(ing.unit)) {
        showMetricBrackets = true;
      }
    } else { // metric
      if (isCupOrSpoonUnit(ing.unit)) {
        showMetricBrackets = true;
      } else if (ing.unit === 'g') {
        if (ing.cupWeight && qty / ing.cupWeight >= 0.25) {
          showImperialBrackets = true;
          bracketImperialQty = qty / ing.cupWeight;
          bracketImperialUnit = 'cup';
        } else if (ing.tbspWeight) {
          showImperialBrackets = true;
          const spoonsVal = qty / ing.tbspWeight;
          if (spoonsVal < 0.75) {
            bracketImperialQty = spoonsVal * 4;
            bracketImperialUnit = 'tsp';
          } else {
            bracketImperialQty = spoonsVal;
            bracketImperialUnit = 'tbsp';
          }
        } else if (ing.cupWeight) {
          showImperialBrackets = true;
          const spoonsVal = (qty / ing.cupWeight) * 16;
          if (spoonsVal < 0.75) {
            bracketImperialQty = spoonsVal * 4;
            bracketImperialUnit = 'tsp';
          } else {
            bracketImperialQty = spoonsVal;
            bracketImperialUnit = 'tbsp';
          }
        }
      } else if (ing.unit === 'ml') {
        showImperialBrackets = true;
        if (qty >= 60) {
          bracketImperialQty = qty / 250;
          bracketImperialUnit = 'cup';
        } else if (qty >= 5) {
          bracketImperialQty = qty / 20;
          bracketImperialUnit = 'tbsp';
        } else {
          bracketImperialQty = qty / 5;
          bracketImperialUnit = 'tsp';
        }
      }
    }

    // If original unit was cup/spoon and we need to show brackets
    if (showMetricBrackets && bracketMetricQty === 0) {
      const lowerUnit = ing.unit ? ing.unit.toLowerCase() : '';
      if (lowerUnit === 'cup' || lowerUnit === 'cups') {
        if (ing.cupWeight) {
          bracketMetricQty = qty * ing.cupWeight;
          bracketMetricUnit = 'g';
        } else {
          bracketMetricQty = qty * 250;
          bracketMetricUnit = 'ml';
        }
      } else if (lowerUnit === 'tbsp' || lowerUnit === 'tablespoon' || lowerUnit === 'tablespoons') {
        if (ing.tbspWeight) {
          bracketMetricQty = qty * ing.tbspWeight;
          bracketMetricUnit = 'g';
        } else {
          bracketMetricQty = qty * 20;
          bracketMetricUnit = 'ml';
        }
      } else if (lowerUnit === 'tsp' || lowerUnit === 'teaspoon' || lowerUnit === 'teaspoons') {
        if (ing.tbspWeight) {
          bracketMetricQty = qty * (ing.tbspWeight / 4);
          bracketMetricUnit = 'g';
        } else {
          bracketMetricQty = qty * 5;
          bracketMetricUnit = 'ml';
        }
      }
    }

    // Format display quantity
    let formattedQtyStr = '';
    if (isCupOrSpoonUnit(displayUnit)) {
      formattedQtyStr = formatFraction(displayQtyVal);
    } else {
      formattedQtyStr = displayQtyVal.toFixed(1).replace(/\.0$/, '');
    }

    let displayQty = displayUnit ? `${formattedQtyStr} ${getUnitLabel(displayUnit, displayQtyVal)}` : formattedQtyStr;

    if (showMetricBrackets && bracketMetricQty > 0) {
      const formattedBracketQty = bracketMetricQty.toFixed(1).replace(/\.0$/, '');
      displayQty = `${displayQty} (${formattedBracketQty} ${getUnitLabel(bracketMetricUnit, bracketMetricQty)})`;
    } else if (showImperialBrackets && bracketImperialQty > 0) {
      const formattedBracketQty = formatFraction(bracketImperialQty);
      displayQty = `${displayQty} (${formattedBracketQty} ${getUnitLabel(bracketImperialUnit, bracketImperialQty)})`;
    }

    return {
      displayQty,
      name: nameStr,
      isSwapped
    };
  },

  /* ====================================
     Interactive Plate Sliders
     ==================================== */
  adjustPlateProportions(changedSlider: 'veg' | 'prot' | 'starch', newValue: number) {
    const targetValue = Number(newValue);
    if (!Number.isFinite(targetValue)) return;

    const currentVeg = Number(this.plate.veg);
    const currentProt = Number(this.plate.prot);
    const currentStarch = Number(this.plate.starch);
    
    if (changedSlider === 'veg') {
      const diff = targetValue - currentVeg;
      const sumOther = currentProt + currentStarch;
      this.plate.veg = targetValue;
      if (sumOther > 0) {
        this.plate.prot = Math.max(10, currentProt - (diff * currentProt / sumOther));
        this.plate.starch = Math.max(10, 100 - this.plate.veg - this.plate.prot);
      }
    } else if (changedSlider === 'prot') {
      const diff = targetValue - currentProt;
      const sumOther = currentVeg + currentStarch;
      this.plate.prot = targetValue;
      if (sumOther > 0) {
        this.plate.veg = Math.max(10, currentVeg - (diff * currentVeg / sumOther));
        this.plate.starch = Math.max(10, 100 - this.plate.veg - this.plate.prot);
      }
    } else if (changedSlider === 'starch') {
      const diff = targetValue - currentStarch;
      const sumOther = currentVeg + currentProt;
      this.plate.starch = targetValue;
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
  get calcPortionEnergy(): number {
    const baselineCalories = Number(this.calcCalories) || 0;
    const activityFactor = Number(this.calcActivity) || 1.375;
    return baselineCalories * (activityFactor / 1.375);
  },

  get calcBreakfastOats(): string {
    const energyNeed = this.calcPortionEnergy;
    const oatsPortion = Math.round((energyNeed / 2000) * 40);
    return `${oatsPortion} g oats`;
  },
  
  get calcLunchGreens(): string {
    const energyNeed = this.calcPortionEnergy;
    const greensPortion = Math.round((energyNeed / 2000) * 150);
    return `${greensPortion} g greens`;
  },
  
  get calcDinnerLentils(): string {
    const energyNeed = this.calcPortionEnergy;
    const lentilPortion = Math.round((energyNeed / 2000) * 45);
    return `${lentilPortion} g lentils / serv`;
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

  async clearShoppingList() {
    if (db && isFirebaseOnline && this.user) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', this.user.uid, 'shoppingList'));
        const promises: any[] = [];
        querySnapshot.forEach((d: any) => {
          promises.push(deleteDoc(d.ref));
        });
        await Promise.all(promises);
      } catch (err) {
        console.error("Failed to clear remote shopping list", err);
      }
    }
    this.shoppingList = [];
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

  async toggleLikeRecipe(recipe: Recipe) {
    recipe.liked = !recipe.liked;
    if (db && isFirebaseOnline && this.user) {
      await updateDoc(doc(db, 'users', this.user.uid, 'recipes', recipe.id), {
        liked: recipe.liked
      });
    } else {
      this.saveRecipesOffline();
    }
  },

  async togglePinRecipe(recipe: Recipe) {
    recipe.pinned = !recipe.pinned;
    if (db && isFirebaseOnline && this.user) {
      await updateDoc(doc(db, 'users', this.user.uid, 'recipes', recipe.id), {
        pinned: recipe.pinned
      });
    } else {
      this.saveRecipesOffline();
    }
  },

  saveRecipesOffline() {
    localStorage.setItem('successor_recipes', JSON.stringify(this.recipes));
  },

  async changeRecipeServings(recipe: Recipe, change: number) {
    if (recipe.servings === undefined) {
      recipe.servings = recipe.defaultServings;
    }
    const newVal = recipe.servings + change;
    if (newVal >= 1 && newVal <= 50) {
      recipe.servings = newVal;
      if (db && isFirebaseOnline && this.user) {
        await updateDoc(doc(db, 'users', this.user.uid, 'recipes', recipe.id), {
          servings: recipe.servings
        });
      } else {
        this.saveRecipesOffline();
      }
    }
  },

  updateGlobalServings(newVal: number) {
    this.servings = newVal;
    this.recipes.forEach(async (r) => {
      r.servings = newVal;
      if (db && isFirebaseOnline && this.user) {
        await updateDoc(doc(db, 'users', this.user.uid, 'recipes', r.id), {
          servings: r.servings
        });
      }
    });
    this.saveRecipesOffline();
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
    
    const servingsCount = recipe.servings !== undefined ? recipe.servings : recipe.defaultServings;
    const factor = servingsCount / recipe.defaultServings;
    
    for (const ing of list) {
      const formatted = this.formatIngredient(ing, factor);
      
      const newItem: Omit<ShoppingItem, 'id'> = {
        name: formatted.name,
        qty: formatted.displayQty,
        zone: ing.zone,
        checked: false,
        recipeId: recipeId
      };
      
      if (db && isFirebaseOnline && this.user) {
        const docId = `${toSafeDocId(recipeId)}_${toSafeDocId(ing.name)}`;
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

  getExportText(): string {
    const zones = {
      supermarket: "SUPERMARKET (Staples & Cold)",
      greengrocer: "GREENGROCER & MARKET (Fresh Produce)",
      bulk: "BULK SHOP (Dry Grains & Spices)",
      asian: "ASIAN GROCER (Tofu & Seasonings)"
    };
    
    const lines: string[] = [];
    
    if (this.exportFormat === 'markdown') {
      lines.push("SUCCESSOR RECIPE APP SHOPPING LIST");
      lines.push("==================================");
      
      Object.keys(zones).forEach(key => {
        const items = this.shoppingList.filter(i => i.zone === key && !i.checked);
        if (items.length > 0) {
          lines.push(`\n[${(zones as any)[key]}]`);
          items.forEach(i => {
            lines.push(`- [ ] ${i.name} (${i.qty})`);
          });
        }
      });
    } else {
      // Google Keep clean format: flat list of unchecked items, one per line (no checkboxes or headings)
      Object.keys(zones).forEach(key => {
        const items = this.shoppingList.filter(i => i.zone === key && !i.checked);
        items.forEach(i => {
          lines.push(`${i.name} (${i.qty})`);
        });
      });
    }
    
    return lines.join('\n');
  },

  copyShoppingListToClipboard() {
    this.exportFormat = 'markdown';
    const text = this.getExportText();
    navigator.clipboard.writeText(text).then(() => {
      alert("Markdown shopping list copied to clipboard!");
    }).catch(err => {
      alert("Failed to copy list: " + err);
    });
  },

  shareShoppingList() {
    this.exportFormat = 'keep';
    const text = this.getExportText();
    if (navigator.share) {
      navigator.share({
        title: 'Successor Shopping List',
        text: text
      }).catch(err => {
        console.warn("Share sheet closed or failed:", err);
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("Clean shopping list copied! Paste into Google Keep, then select 'Show checkboxes' in Keep's menu.");
      }).catch(err => {
        alert("Native sharing is not supported by your current browser/device. Please use the Copy to Clipboard button instead.");
      });
    }
  },

  isShareSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.share;
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
     Recipe Active View Tabs
     ==================================== */
  getRecipeActiveView(recipeId: string): 'ingredients' | 'instructions' | 'notes' {
    return this.recipeActiveViews[recipeId] || 'ingredients';
  },

  setRecipeActiveView(recipeId: string, view: 'ingredients' | 'instructions' | 'notes') {
    this.recipeActiveViews[recipeId] = view;
  },

  /* ====================================
     Weekly Planner Operations
     ==================================== */
  async savePlanner(newPlanner: WeeklyPlanner) {
    this.planner = normalizePlanner(newPlanner);
    if (db && isFirebaseOnline && this.user) {
      await setDoc(doc(db, 'users', this.user.uid, 'planner', 'weekly'), this.planner);
    } else {
      localStorage.setItem('successor_planner', JSON.stringify(this.planner));
    }
  },

  async addRecipeToPlanner(day: string, meal: PlannerMeal, recipeId: string) {
    const updated = normalizePlanner(this.planner);
    updated[day][meal] = recipeId;
    await this.savePlanner(updated);
  },

  async removeRecipeFromPlanner(day: string, meal: PlannerMeal) {
    const updated = normalizePlanner(this.planner);
    if (updated[day]) {
      updated[day][meal] = '';
    }
    await this.savePlanner(updated);
  },

  async clearPlanner() {
    await this.savePlanner(createEmptyPlanner());
  },

  async aggregatePlannerToShoppingList() {
    const totals = new Map<string, { ingredient: Ingredient; qty: number }>();

    plannerDays.forEach(({ id: day }) => {
      plannerMealSlots.forEach(({ id: meal }) => {
        const recipe = this.getRecipeById(this.planner[day]?.[meal]);
        if (!recipe) return;
        const ingredients = recipe.id === 'parfait'
          ? (recipe.ingredients[this.parfaitPathway] || recipe.ingredients)
          : recipe.ingredients;
        const perServingFactor = 1 / recipe.defaultServings;

        ingredients.forEach((ingredient: Ingredient) => {
          const name = this.budgetMode ? ingredient.alt : ingredient.name;
          const key = `${ingredient.zone}:${name}:${ingredient.unit}`;
          const current = totals.get(key);
          if (current) {
            current.qty += ingredient.qty * perServingFactor;
          } else {
            totals.set(key, { ingredient: { ...ingredient, name, alt: name }, qty: ingredient.qty * perServingFactor });
          }
        });
      });
    });

    const plannerItems: Omit<ShoppingItem, 'id'>[] = Array.from(totals.values()).map(({ ingredient, qty }) => {
      const formatted = this.formatIngredient({ ...ingredient, qty }, 1);
      return { name: formatted.name, qty: formatted.displayQty, zone: ingredient.zone, checked: false, recipeId: 'planner' };
    });

    if (db && isFirebaseOnline && this.user) {
      for (const item of this.shoppingList.filter(item => item.recipeId === 'planner')) {
        if (item.id) await deleteDoc(doc(db, 'users', this.user.uid, 'shoppingList', item.id));
      }
      for (const item of plannerItems) {
        const docId = `planner_${toSafeDocId(item.zone)}_${toSafeDocId(item.name)}`;
        await setDoc(doc(db, 'users', this.user.uid, 'shoppingList', docId), item);
      }
    } else {
      this.shoppingList = [
        ...this.shoppingList.filter(item => item.recipeId !== 'planner'),
        ...plannerItems
      ];
      this.saveShoppingListOffline();
    }

    alert(plannerItems.length
      ? "Weekly plan ingredients have been calculated and added to your shopping list."
      : "Add meals to the planner before creating a shopping list.");
  },

  getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find(r => r.id === id);
  },

  getDayPlanEntries(day: string): Array<{ slot: string; recipe: Recipe }> {
    const entries = plannerMealSlots.map(({ id, label }) => {
      const recipe = this.getRecipeById(this.planner[day]?.[id]);
      return recipe ? { slot: label, recipe } : null;
    });
    return entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  },

  getDayPlanCalories(day: string): number {
    return this.getDayPlanEntries(day).reduce((total, entry) => total + this.getRecipeCalories(entry.recipe), 0);
  },

  getDayPlanCost(day: string): number {
    return this.getDayPlanEntries(day).reduce((total, entry) => total + this.getRecipeCostPerServing(entry.recipe), 0);
  },

  getDaySnackCount(day: string): number {
    return plannerSnackSlots.filter(({ id }) => Boolean(this.planner[day]?.[id])).length;
  },

  isPlannerSnackSectionOpen(day: string): boolean {
    if (Object.prototype.hasOwnProperty.call(this.expandedPlannerSnackDays, day)) {
      return this.expandedPlannerSnackDays[day];
    }
    return this.getDaySnackCount(day) > 0;
  },

  setPlannerSnackSectionOpen(day: string, isOpen: boolean) {
    this.expandedPlannerSnackDays[day] = isOpen;
  },

  formatPlannerEnergy(calories: number): string {
    if (this.recipeEnergyUnit === 'kJ') {
      return `${Math.round(calories * 4.184)} kJ`;
    }
    return `${Math.round(calories)} kcal`;
  },

  getPlannerExportText(): string {
    const lines = ['SUCCESSOR WEEKLY MEAL PLAN', '=========================='];
    plannerDays.forEach(({ id, label }) => {
      lines.push(`\n${label.toUpperCase()}`);
      const entries = this.getDayPlanEntries(id);
      if (!entries.length) {
        lines.push('No meals planned');
        return;
      }
      entries.forEach(({ slot, recipe }) => lines.push(`${slot}: ${recipe.title}`));
      lines.push(`Daily total: ${this.formatPlannerEnergy(this.getDayPlanCalories(id))} | $${this.getDayPlanCost(id).toFixed(2)}`);
    });
    lines.push(`\nWEEKLY TOTAL: ${this.formatPlannerEnergy(this.plannerWeeklyStats.totalCalories)} | $${this.plannerWeeklyStats.totalCost.toFixed(2)}`);
    return lines.join('\n');
  },

  async copyPlannerToClipboard() {
    try {
      await navigator.clipboard.writeText(this.getPlannerExportText());
      alert('Weekly meal plan copied to clipboard.');
    } catch (error) {
      alert('Unable to copy the weekly meal plan in this browser.');
    }
  },

  sharePlanner() {
    const text = this.getPlannerExportText();
    if (navigator.share) {
      navigator.share({ title: 'Successor Weekly Meal Plan', text }).catch(() => undefined);
      return;
    }
    this.copyPlannerToClipboard();
  },

  printPlanner() {
    window.print();
  },

  get plannerWeeklyStats() {
    let totalCalories = 0;
    let totalCost = 0;
    let totalCarbs = 0;
    let totalGI = 0;
    let totalMealsCount = 0;
    let healthyCount = 0;
    let parfaitScheduledCount = 0;

    plannerDays.forEach(({ id: day }) => {
      const dayPlan = this.planner[day];
      if (dayPlan) {
        plannerMealSlots.forEach(({ id: mealType }) => {
          const recipeId = dayPlan[mealType];
          if (recipeId) {
            const recipe = this.getRecipeById(recipeId);
            if (recipe) {
              totalCalories += this.getRecipeCalories(recipe);
              totalCost += this.getRecipeCostPerServing(recipe);
              totalCarbs += this.getRecipeCarbs(recipe);
              totalGI += this.getRecipeGI(recipe) * this.getRecipeCarbs(recipe);
              totalMealsCount++;
              if (recipe.category === 'healthy' || recipe.category === 'longevity') {
                healthyCount++;
              }
              if (recipeId === 'parfait') {
                parfaitScheduledCount++;
              }
            }
          }
        });
      }
    });

    const avgGI = totalCarbs > 0 ? Math.round(totalGI / totalCarbs) : 0;
    const avgDailyCalories = totalMealsCount > 0 ? Math.round(totalCalories / plannerDays.length) : 0;
    const avgDailyCost = totalMealsCount > 0 ? Number((totalCost / plannerDays.length).toFixed(2)) : 0;

    // Generate insights
    const insights: string[] = [];
    if (totalMealsCount === 0) {
      insights.push("Your planner is empty. Schedule meals in the Weekly Planner to see nutritional and cost analytics.");
    } else {
      if (avgDailyCalories > 0 && avgDailyCalories < 1500) {
        insights.push("Target daily energy is quite low. Ensure protein-dense sources are added to prevent muscle catabolism.");
      } else if (avgDailyCalories > 2400) {
        insights.push("Energy target is higher than standard baseline. Excellent if active in high physical output phases.");
      } else {
        insights.push("Weekly calorie density is well balanced for moderate, sustainable weight management.");
      }

      if (healthyCount / totalMealsCount >= 0.7) {
        insights.push("Superb fiber density! Over 70% of scheduled meals are classified as high-satiety, whole food items.");
      }

      if (parfaitScheduledCount >= 3) {
        insights.push("Frequent oats breakfasts scheduled. Viscous beta-glucans support morning satiety and glycemic stability.");
      }

      insights.push(`Average Glycemic Index (GI) of scheduled meals is ${avgGI} (${this.getGIRating(avgGI).toUpperCase()}). Low GI supports postprandial glucose stability.`);
    }

    return {
      totalCalories,
      avgDailyCalories,
      totalCost,
      avgDailyCost,
      totalCarbs,
      avgGI,
      insights
    };
  },

  async confirmClearShoppingList() {
    if (confirm("Are you sure you want to clear your entire shopping list? This cannot be undone.")) {
      await this.clearShoppingList();
    }
  },

  /* ====================================
     Custom Recipe Creator
     ==================================== */
  async createCustomRecipe(title: string, intro: string, ingredientsStr: string, instructionsStr: string, calories: number, carbs: number, gi: number) {
    const ingredients = ingredientsStr.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.match(/^([\d\.]+(?:\s*(?:g|ml|tbsp|tsp|cup|cups|spoons))?)\s+(.+)$/i);
      if (parts) {
        return { name: parts[2].trim(), qty: parts[1].trim(), zone: 'supermarket' };
      }
      return { name: line.trim(), qty: '1 unit', zone: 'supermarket' };
    });

    const instructions = instructionsStr.split('\n').filter(line => line.trim());

    const newRecipe: Recipe = {
      id: 'custom-' + Date.now(),
      title: title,
      category: 'healthy',
      defaultServings: 2,
      servings: 2,
      intro: intro,
      cookingTime: '15 mins',
      typeBadge: 'Custom Recipe',
      ingredients: ingredients,
      instructions: instructions,
      scienceNotes: ['Custom user-created recipe.'],
      imgUrl: 'images/bowl.png',
      caloriesPerServing: calories,
      carbsPerServing: carbs,
      gi: gi,
      liked: false,
      pinned: false
    };

    if (db && isFirebaseOnline && this.user) {
      await setDoc(doc(db, 'users', this.user.uid, 'recipes', newRecipe.id), newRecipe);
    } else {
      this.recipes.push(newRecipe);
      this.saveRecipesOffline();
    }
    alert("Custom recipe created successfully!");
  },

  /* ====================================
     SVG Health Chart Generators
     ==================================== */
  get sortedLogs(): LogEntry[] {
    return [...this.healthLogs].sort((a, b) => a.date.localeCompare(b.date));
  },

  getChartPoints(field: 'weight' | 'waist' | 'bpSys' | 'bpDia'): { x: number, y: number, val: number, date: string }[] {
    const logs = this.sortedLogs.filter(l => l[field] !== null && l[field] !== undefined);
    if (logs.length === 0) return [];
    if (logs.length === 1) {
      return [{ x: 250, y: 60, val: Number(logs[0][field]), date: logs[0].date }];
    }
    const values = logs.map(l => Number(l[field]));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    return logs.map((log, index) => {
      const x = (index / (logs.length - 1)) * 440 + 30; // 30px left padding, 30px right padding (total 500)
      const y = 130 - ((Number(log[field]) - minVal) / range) * 110; // scale to fit 150px height
      return { x, y, val: Number(log[field]), date: log.date };
    });
  },

  get bpChartPoints(): { sys: any[], dia: any[] } {
    const sysLogs = this.sortedLogs.filter(l => l.bpSys !== null && l.bpSys !== undefined);
    const diaLogs = this.sortedLogs.filter(l => l.bpDia !== null && l.bpDia !== undefined);
    if (sysLogs.length === 0) return { sys: [], dia: [] };
    
    const sysValues = sysLogs.map(l => Number(l.bpSys));
    const diaValues = diaLogs.map(l => Number(l.bpDia));
    const minVal = Math.min(...sysValues, ...diaValues);
    const maxVal = Math.max(...sysValues, ...diaValues);
    const range = maxVal - minVal || 1;

    const sys = sysLogs.map((log, index) => {
      const x = (index / (sysLogs.length - 1)) * 440 + 30;
      const y = 130 - ((Number(log.bpSys) - minVal) / range) * 110;
      return { x, y, val: Number(log.bpSys), date: log.date };
    });

    const dia = diaLogs.map((log, index) => {
      const x = (index / (diaLogs.length - 1)) * 440 + 30;
      const y = 130 - ((Number(log.bpDia) - minVal) / range) * 110;
      return { x, y, val: Number(log.bpDia), date: log.date };
    });

    return { sys, dia };
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
    const kJ = Math.round(kcal * 4.184);
    const servingsCount = recipe.servings !== undefined ? recipe.servings : recipe.defaultServings;
    const totalKcal = kcal * servingsCount;
    const totalKJ = Math.round(totalKcal * 4.184);
    if (this.recipeEnergyUnit === 'kJ') {
      return `${kJ} kJ (${kcal} kcal) / serving | Total: ${totalKJ} kJ (${totalKcal} kcal)`;
    }
    return `${kcal} kcal (${kJ} kJ) / serving | Total: ${totalKcal} kcal (${totalKJ} kJ)`;
  },

  getRecipeCostPerServing(recipe: Recipe): number {
    const isBudget = this.budgetMode;
    let costObj = isBudget ? recipe.budgetCostPerServing : recipe.costPerServing;
    if (costObj === undefined) {
      costObj = isBudget ? 2.50 : 4.00;
    }
    if (typeof costObj === 'object') {
      return (costObj as any)[this.parfaitPathway] || 3.00;
    }
    return costObj;
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
    const showLiked = this.recipeShowLikedOnly;
    const showPinned = this.recipeShowPinnedOnly;
    
    const filtered = this.recipes.filter(recipe => {
      // 1. Likes/Pins filter
      if (showLiked && !recipe.liked) return false;
      if (showPinned && !recipe.pinned) return false;

      // 2. Category filter
      if (cat !== 'all' && recipe.category !== cat) {
        return false;
      }
      
      // 3. Calories filter (always compared in kcal)
      if (this.recipeMaxCaloriesEnabled) {
        const cals = this.getRecipeCalories(recipe);
        if (cals > maxCal) {
          return false;
        }
      }
      
      // 4. Search query filter
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

    // Sort: Pinned recipes go to the top
    return filtered.sort((a, b) => {
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;
      return bPinned - aPinned;
    });
  },

  get filteredShoppingItems(): ShoppingItem[] {
    const q = this.shoppingSearch.toLowerCase().trim();
    const status = this.shoppingStatus;
    const zone = this.shoppingZone;
    const showLiked = this.shoppingShowLikedOnly;
    const showPinned = this.shoppingShowPinnedOnly;
    
    const filtered = this.shoppingList.filter(item => {
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

      // 4. Likes/Pins filter on recipe context
      if (showLiked) {
        if (!item.recipeId) return false;
        const recipe = this.recipes.find(r => r.id === item.recipeId);
        if (!recipe || !recipe.liked) return false;
      }
      if (showPinned) {
        if (!item.recipeId) return false;
        const recipe = this.recipes.find(r => r.id === item.recipeId);
        if (!recipe || !recipe.pinned) return false;
      }
      
      return true;
    });

    // Sort: Items from pinned recipes go to the top
    return filtered.sort((a, b) => {
      const aPinned = (a.recipeId && this.recipes.find(r => r.id === a.recipeId)?.pinned) ? 1 : 0;
      const bPinned = (b.recipeId && this.recipes.find(r => r.id === b.recipeId)?.pinned) ? 1 : 0;
      return bPinned - aPinned;
    });
  }
};

const reactiveStore = reactive(store);
(window as any).appStore = reactiveStore;

// Mount the reactive store in the document scope using Petite-Vue
createApp({ store: reactiveStore }).mount();
// Initialize preferences, auth observers, and service workers
reactiveStore.init();
