const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_DIR = 'C:\\Users\\user\\.gemini\\antigravity\\scratch\\ai-trip-planner';
const appJs = fs.readFileSync(path.join(PROJECT_DIR, 'app.js'), 'utf8');
const engine = require(path.join(PROJECT_DIR, 'india_travel_engine.js'));
const catalog = fs.readFileSync(path.join(PROJECT_DIR, 'tripmozy_catalog.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(PROJECT_DIR, 'index.html'), 'utf8');

console.log('================================================================');
console.log(' TEST SUITE: Pre-Navigation Insufficient Budget Blocking');
console.log('================================================================\n');

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

// 1. Verify index.html elements
assert('HTML contains #formBudgetErrorBox', indexHtml.includes('id="formBudgetErrorBox"'));
assert('HTML contains #formBudgetReasonText', indexHtml.includes('id="formBudgetReasonText"'));
assert('HTML contains #formBudgetMinAmount', indexHtml.includes('id="formBudgetMinAmount"'));
assert('HTML contains #applyMinBudgetBtn', indexHtml.includes('id="applyMinBudgetBtn"'));
assert('HTML input has oninput="clearBudgetError()"', indexHtml.includes('oninput="clearBudgetError()"'));

// 2. Prepare full mock DOM environment
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
    print: () => {}
  },
  document: {
    title: 'TripMozy',
    getElementById: (id) => getOrCreateMock(id),
    querySelector: (selector) => {
      if (selector.includes('companion:checked')) return { value: 'Couple' };
      if (selector.includes('budget:checked')) return { value: 'Moderate' };
      if (selector.includes('travelStyle:checked')) return { value: 'Standard Sightseeing' };
      return null;
    },
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

// Setup form inputs in mock DOM
getOrCreateMock('destinationInput').value = 'Manali';
getOrCreateMock('durationRange').value = '4';
getOrCreateMock('heroSection').classList.remove('hidden'); // Initially visible
getOrCreateMock('loadingSection').classList.add('hidden'); // Initially hidden
getOrCreateMock('itineraryDashboard').classList.add('hidden'); // Initially hidden
getOrCreateMock('formBudgetErrorBox').classList.add('hidden'); // Initially hidden

// CASE 1: User enters insufficient budget (e.g. ₹2,000 for a 4-day trip)
getOrCreateMock('manualTargetBudgetInput').value = '2000';

sandbox.handleFormSubmit({ preventDefault: () => {} });

// VERIFY USER IS NOT ALLOWED TO ADVANCE TO NEXT PAGE
assert('User is NOT sent to loading screen (#loadingSection remains hidden)', 
  getOrCreateMock('loadingSection').classList.contains('hidden') === true
);
assert('User is NOT sent to dashboard (#itineraryDashboard remains hidden)', 
  getOrCreateMock('itineraryDashboard').classList.contains('hidden') === true
);
assert('Hero / planner form section remains visible', 
  getOrCreateMock('heroSection').classList.contains('hidden') === false
);

// VERIFY REASON AND MINIMUM AMOUNT ARE DISPLAYED
assert('#formBudgetErrorBox is revealed (hidden class removed)', 
  getOrCreateMock('formBudgetErrorBox').classList.contains('hidden') === false
);
const reasonText = getOrCreateMock('formBudgetReasonText').textContent;
assert('Reason text is displayed explaining why ₹2,000 is insufficient', 
  reasonText.includes("2,000") && (reasonText.includes("insufficient") || reasonText.includes("baseline")),
  reasonText
);
const minAmtText = getOrCreateMock('formBudgetMinAmount').textContent;
assert('Minimum amount needed is clearly shown', 
  minAmtText.includes("₹") && !minAmtText.includes("2,000"),
  minAmtText
);
assert('Input field is highlighted in red', 
  getOrCreateMock('manualTargetBudgetInput').classList.contains('border-rose-500') === true
);

// CASE 2: User clicks "Set Budget to Minimum & Continue"
const minAmtCalculated = sandbox.window.lastCalculatedMinAmount;
assert('lastCalculatedMinAmount was captured', minAmtCalculated > 2000, `Min: ${minAmtCalculated}`);

sandbox.applyMinimumBudgetAndProceed();

// Now input should have been updated to minAmtCalculated
assert('manualTargetBudgetInput value updated to minimum amount needed', 
  Number(getOrCreateMock('manualTargetBudgetInput').value) === minAmtCalculated,
  getOrCreateMock('manualTargetBudgetInput').value
);

console.log(`\n================================================================`);
console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`================================================================`);

if (failed > 0) process.exit(1);
