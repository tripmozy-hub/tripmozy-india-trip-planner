const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_DIR = 'C:\\Users\\user\\.gemini\\antigravity\\scratch\\ai-trip-planner';
const appJs = fs.readFileSync(path.join(PROJECT_DIR, 'app.js'), 'utf8');
const engine = require(path.join(PROJECT_DIR, 'india_travel_engine.js'));
const catalog = fs.readFileSync(path.join(PROJECT_DIR, 'tripmozy_catalog.js'), 'utf8');

console.log('Testing all newly implemented capabilities in sandbox...\n');

// Build full DOM mock sandbox
const mockElements = {};
function getOrCreateMock(id) {
  if (!mockElements[id]) {
    mockElements[id] = {
      id: id,
      value: '',
      textContent: '',
      innerHTML: '',
      className: '',
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      style: {},
      scrollIntoView: () => {},
      focus: () => {},
      appendChild: (el) => {},
      querySelectorAll: () => [],
      addEventListener: () => {}
    };
  }
  return mockElements[id];
}

const sandbox = {
  console: console,
  alert: (msg) => console.log('Mock Alert:', msg),
  prompt: (msg, def) => def || "1",
  Math: Math,
  Date: Date,
  parseInt: parseInt,
  parseFloat: parseFloat,
  Number: Number,
  String: String,
  Array: Array,
  Object: Object,
  JSON: JSON,
  isFinite: isFinite,
  isNaN: isNaN,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  window: {
    TripMozyEngine: engine,
    addEventListener: () => {}
  },
  document: {
    getElementById: (id) => getOrCreateMock(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => getOrCreateMock('tag_' + Math.random()),
    body: { appendChild: () => {} },
    addEventListener: () => {}
  },
  TripMozyEngine: engine,
  confetti: () => {},
  lucide: { createIcons: () => {} }
};

vm.createContext(sandbox);
vm.runInContext(catalog, sandbox);
vm.runInContext(appJs, sandbox);

let testsPassed = 0;
let testsFailed = 0;

function check(desc, cond) {
  if (cond) {
    testsPassed++;
    console.log(`  [PASS] ${desc}`);
  } else {
    testsFailed++;
    console.error(`  [FAIL] ${desc}`);
  }
}

// 1. Verify Real Destinations in INDIA_DESTINATIONS
const indiaDests = vm.runInContext('INDIA_DESTINATIONS', sandbox);
const expectedDests = ['kashmir', 'jaipur', 'udaipur', 'ooty', 'rishikesh', 'varanasi', 'ladakh', 'agra', 'amritsar', 'shimla', 'manali', 'goa', 'kerala'];
expectedDests.forEach(d => {
  const destObj = indiaDests[d];
  check(`INDIA_DESTINATIONS contains '${d}' with real coords and real attractions`, !!destObj && destObj.coords?.length === 2 && destObj.nearbyAttractions?.length >= 5);
});

// 2. Verify Real Attractions have Ticket Fees & Budget Tiers
const kashmir = indiaDests['kashmir'];
check('Kashmir has Dal Lake Shikara with ticketCost', kashmir.nearbyAttractions.some(p => p.name.includes('Shikara') && p.ticketCost));
check('Kashmir has Gulmarg Gondola with ticketCost', kashmir.nearbyAttractions.some(p => p.name.includes('Gondola') && p.ticketCost));

// 3. Test generateIndianTripPlan for Kashmir
const plan = sandbox.generateIndianTripPlan({
  destination: "Kashmir",
  days: 5,
  adults: 2,
  children: 0,
  budgetTier: "Moderate",
  manualBudget: 25000,
  baseCoords: [34.0837, 74.7973]
});
check('Trip plan for Kashmir generated 5 real days', plan.daysPlan.length === 5);
check('Day 1 has Dal Lake with coordinates and real name', plan.daysPlan[0].stops.some(s => s.name.includes('Dal Lake') && s.coords));

// 4. Test adding custom tourist place manually
sandbox.testPlan = plan;
vm.runInContext('currentTrip = testPlan;', sandbox);

// Prepare mock inputs
getOrCreateMock('customPlaceName').value = 'Little Buddha Hidden Cafe';
getOrCreateMock('customPlaceDay').value = '2';
getOrCreateMock('customPlaceTime').value = '04:00 PM';
getOrCreateMock('customPlaceCategory').value = 'Dining';
getOrCreateMock('customPlaceCost').value = '350';
getOrCreateMock('customPlaceTip').value = 'Riverside seat with mountain view';

const initialDay2Stops = plan.daysPlan[1].stops.length;
sandbox.handleCustomPlaceSubmit({ preventDefault: () => {} });

check('Custom tourist place added to Day 2 stops', plan.daysPlan[1].stops.length === initialDay2Stops + 1);
const addedStop = plan.daysPlan[1].stops[plan.daysPlan[1].stops.length - 1];
check('Added stop has name "Little Buddha Hidden Cafe"', addedStop.name === 'Little Buddha Hidden Cafe');
check('Added stop has isCustom flag', addedStop.isCustom === true);
check('Added stop has resolved coordinates', Array.isArray(addedStop.coords) && addedStop.coords.length === 2);
check('Custom place also added to nearbyAttractions list', plan.nearbyAttractions.some(p => p.name === 'Little Buddha Hidden Cafe' && p.isCustom));

// 5. Test removing the custom tourist place
sandbox.removeCustomTouristPlace(1, plan.daysPlan[1].stops.length - 1);
check('Custom place removed cleanly from Day 2 stops', plan.daysPlan[1].stops.length === initialDay2Stops);

// 6. Test Budget Filtering function
check('filterAttractionsByBudget is defined', typeof sandbox.filterAttractionsByBudget === 'function');
sandbox.filterAttractionsByBudget('free');
const activeFilter = vm.runInContext('currentAttractionBudgetFilter', sandbox);
check('currentAttractionBudgetFilter set to "free"', activeFilter === 'free');

console.log(`\nResults: ${testsPassed} passed, ${testsFailed} failed.`);
if (testsFailed > 0) process.exit(1);
