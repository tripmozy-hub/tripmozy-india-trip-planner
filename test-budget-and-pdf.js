const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_DIR = 'C:\\Users\\user\\.gemini\\antigravity\\scratch\\ai-trip-planner';
const appJs = fs.readFileSync(path.join(PROJECT_DIR, 'app.js'), 'utf8');
const engine = require(path.join(PROJECT_DIR, 'india_travel_engine.js'));
const catalog = fs.readFileSync(path.join(PROJECT_DIR, 'tripmozy_catalog.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(PROJECT_DIR, 'index.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(PROJECT_DIR, 'styles.css'), 'utf8');

console.log('====================================================');
console.log(' TEST SUITE: Insufficient Budget & Printable PDF Itinerary');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(desc, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${desc}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${desc} -> ${details}`);
  }
}

// 1. Verify HTML elements exist
assert('HTML contains #insufficientBudgetBanner', indexHtml.includes('id="insufficientBudgetBanner"'));
assert('HTML contains #insufficientBudgetText', indexHtml.includes('id="insufficientBudgetText"'));
assert('HTML contains #insufficientBudgetMinBadge', indexHtml.includes('id="insufficientBudgetMinBadge"'));
assert('HTML contains #printableItineraryDoc container', indexHtml.includes('id="printableItineraryDoc"'));
assert('HTML contains downloadItineraryPDF() button', indexHtml.includes('downloadItineraryPDF()'));

// 2. Verify styles.css print rules
assert('CSS has #printableItineraryDoc hidden on screen', stylesCss.includes('#printableItineraryDoc {') && stylesCss.includes('display: none;'));
assert('CSS has @media print showing #printableItineraryDoc', stylesCss.includes('@media print') && stylesCss.includes('#printableItineraryDoc {') && stylesCss.includes('display: block !important;'));
assert('CSS hides web app UI during print', stylesCss.includes('#itineraryDashboard') && stylesCss.includes('display: none !important;'));

// 3. Test Engine Calculation for Insufficient Budget
// When user enters an insufficient budget of ₹3,000 for a 4-day trip to Manali (2 adults)
const calculated = engine.calculateAccurateTripBudget({
  destination: "Manali, Himachal Pradesh",
  days: 4,
  adults: 2,
  children: 0,
  roomSharingPref: "auto",
  transportPref: "private_cab",
  budgetTier: "Moderate",
  targetBudget: 3000 // Insufficient budget!
});

assert('Engine flags insufficient budget', calculated.budgetAnalysis.isInsufficient === true);
assert('Engine reports status shortfall', calculated.budgetAnalysis.status === 'shortfall');
assert('Engine calculates minimumAmountNeeded > 3000', calculated.budgetAnalysis.minimumAmountNeeded > 3000, `min: ${calculated.budgetAnalysis.minimumAmountNeeded}`);
assert('Engine generates insufficientNote advising to increase budget', 
  calculated.budgetAnalysis.insufficientNote.includes("isn't sufficient") && 
  calculated.budgetAnalysis.insufficientNote.includes("please increase it to"),
  calculated.budgetAnalysis.insufficientNote
);
assert('Optimized plan reflects minimumAmountNeeded instead of broken ₹3,000', 
  calculated.budgetAnalysis.optimizedPlan.costPerPerson === calculated.budgetAnalysis.minimumAmountNeeded,
  `opt: ${calculated.budgetAnalysis.optimizedPlan.costPerPerson}`
);

// 4. Test app.js DOM rendering in Sandbox
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
      appendChild: () => {},
      querySelectorAll: () => [],
      addEventListener: () => {}
    };
  }
  return mockElements[id];
}

const sandbox = {
  console: console,
  alert: () => {},
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
    addEventListener: () => {},
    print: () => { sandbox.printed = true; }
  },
  document: {
    title: 'TripMozy',
    getElementById: (id) => getOrCreateMock(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => getOrCreateMock('tag_' + Math.random()),
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

// Generate plan with insufficient budget
const plan = sandbox.generateIndianTripPlan({
  destination: "Manali",
  days: 4,
  adults: 2,
  children: 0,
  budgetTier: "Moderate",
  manualBudget: 3000,
  baseCoords: [32.2396, 77.1887]
});

assert('Generated plan costPerPerson is adjusted to minimumAmountNeeded', 
  plan.costPerPerson === plan.accurateBudget.budgetAnalysis.minimumAmountNeeded,
  `Plan cost: ₹${plan.costPerPerson}, minNeeded: ₹${plan.accurateBudget.budgetAnalysis.minimumAmountNeeded}`
);

// Run renderDashboard with this plan
sandbox.testPlan = plan;
vm.runInContext('currentTrip = testPlan;', sandbox);
sandbox.renderDashboard(plan);

const bannerMock = getOrCreateMock('insufficientBudgetBanner');
assert('Insufficient budget banner is shown (not hidden)', !bannerMock.classList.contains('hidden'));

const bannerTextMock = getOrCreateMock('insufficientBudgetText');
assert('Banner text displays increase instruction', 
  bannerTextMock.innerHTML.includes("isn't sufficient") && bannerTextMock.innerHTML.includes("please increase it to"),
  bannerTextMock.innerHTML
);

const budgetDisplayMock = getOrCreateMock('dashTotalBudget');
assert('Dashboard budget display shows minimumAmountNeeded', 
  budgetDisplayMock.textContent.includes(plan.accurateBudget.budgetAnalysis.minimumAmountNeeded.toLocaleString('en-IN')),
  budgetDisplayMock.textContent
);

// 5. Test Printable Itinerary Document Rendering
const printDocMock = getOrCreateMock('printableItineraryDoc');
sandbox.renderPrintableItineraryDoc(plan);

assert('Printable doc contains company name "TripMozy.com"', printDocMock.innerHTML.includes('TripMozy.com'));
assert('Printable doc contains contact number "+91 9641866181"', printDocMock.innerHTML.includes('+91 9641866181'));
assert('Printable doc contains email "tripmozy@gmail.com"', printDocMock.innerHTML.includes('tripmozy@gmail.com'));
assert('Printable doc contains website "www.tripmozy.com"', printDocMock.innerHTML.includes('www.tripmozy.com'));
assert('Printable doc contains insufficient budget notice', 
  printDocMock.innerHTML.includes("isn't sufficient") && printDocMock.innerHTML.includes("please increase it to")
);
assert('Printable doc contains day-by-day stops and timings', 
  printDocMock.innerHTML.includes('Hadimba Devi Temple') && printDocMock.innerHTML.includes('09:30 AM')
);
assert('Printable doc contains insider tips and descriptions', printDocMock.innerHTML.includes('TripMozy Insider'));

// 6. Test downloadItineraryPDF() trigger
sandbox.printed = false;
sandbox.downloadItineraryPDF();
assert('downloadItineraryPDF() triggers print dialog', sandbox.printed === true);

console.log(`\n====================================================`);
console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`====================================================`);

if (failed > 0) process.exit(1);
