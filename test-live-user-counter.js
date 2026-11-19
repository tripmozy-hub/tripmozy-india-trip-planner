const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_DIR = __dirname;
const indexHtml = fs.readFileSync(path.join(PROJECT_DIR, 'index.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(PROJECT_DIR, 'styles.css'), 'utf8');
const appJs = fs.readFileSync(path.join(PROJECT_DIR, 'app.js'), 'utf8');

console.log('================================================================');
console.log(' TEST SUITE: TripMozy Live User Counter Corner Widget (1-50 Range)');
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

// 1. DOM verification
assert('HTML contains #liveUserCounterWidget container', indexHtml.includes('id="liveUserCounterWidget"'));
assert('HTML contains #liveUserCounterNumber text target', indexHtml.includes('id="liveUserCounterNumber"'));
assert('HTML contains live pulse indicator (animate-ping / bg-emerald-500)', indexHtml.includes('animate-ping') && indexHtml.includes('bg-emerald-500'));
assert('HTML contains users icon', indexHtml.includes('data-lucide="users"'));
assert('HTML contains viewers online text', indexHtml.includes('viewers online'));
assert('HTML marks counter widget with no-print class', indexHtml.includes('id="liveUserCounterWidget"') && indexHtml.includes('no-print'));

// 2. CSS verification
assert('CSS has fixed positioning for #liveUserCounterWidget', stylesCss.includes('#liveUserCounterWidget') && stylesCss.includes('position: fixed;'));
assert('CSS includes safe area support on mobile', stylesCss.includes('safe-area-inset-bottom'));
assert('CSS includes .counter-num-pop animation', stylesCss.includes('.counter-num-pop') && stylesCss.includes('@keyframes counterPop'));
assert('CSS includes .counter-num-drop animation for decreases', stylesCss.includes('.counter-num-drop') && stylesCss.includes('@keyframes counterDrop'));

// 3. Logic & Behavior testing via Simulated Environment
function createMockEnvironment(initialStorageValue = null) {
  const store = {};
  if (initialStorageValue !== null) {
    store['tripmozy_live_user_counter'] = initialStorageValue.toString();
  }

  const mockLocalStorage = {
    getItem: (key) => store[key] !== undefined ? store[key] : null,
    setItem: (key, val) => { store[key] = val.toString(); },
    removeItem: (key) => { delete store[key]; }
  };

  const mockElement = {
    textContent: '',
    classList: {
      classes: new Set(),
      add: function(...args) { args.forEach(c => this.classes.add(c)); },
      remove: function(...args) { args.forEach(c => this.classes.delete(c)); },
      contains: function(c) { return this.classes.has(c); }
    },
    offsetWidth: 100
  };

  const mockDocument = {
    getElementById: (id) => {
      if (id === 'liveUserCounterNumber') return mockElement;
      return null;
    },
    addEventListener: () => {}
  };

  const sandbox = {
    localStorage: mockLocalStorage,
    document: mockDocument,
    window: {
      addEventListener: () => {}
    },
    setInterval: () => 1234,
    clearInterval: () => {},
    Math: Math,
    parseInt: parseInt,
    isNaN: isNaN,
    Number: Number
  };

  return { sandbox, store, mockElement };
}

// Test Case A: First visit (Stored count is 0 / null) -> Generates random number between 1 and 50
{
  const { sandbox, store, mockElement } = createMockEnvironment(null);
  
  const startIdx = appJs.indexOf('let liveActiveUserCount = 0;');
  const endIdx = appJs.indexOf('function setupEventListeners()');
  const counterCode = appJs.substring(startIdx, endIdx) + '\ninitLiveUserCounter();';

  vm.runInNewContext(counterCode, sandbox);

  const savedCount = parseInt(store['tripmozy_live_user_counter'], 10);
  assert('First visit (when 0): Generates a number between 1 and 50', savedCount >= 1 && savedCount <= 50, `Actual: ${savedCount}`);
  assert('First visit: Sets textContent in DOM within 1 to 50', parseInt(mockElement.textContent, 10) === savedCount && savedCount <= 50, `Actual: ${mockElement.textContent}`);
}

// Test Case B: Repeat visit (Stored count is e.g. 35) -> Increments by 1 to 36, then tests increment & decrement
{
  const { sandbox, store, mockElement } = createMockEnvironment(35);
  
  const startIdx = appJs.indexOf('let liveActiveUserCount = 0;');
  const endIdx = appJs.indexOf('function setupEventListeners()');
  const counterCode = appJs.substring(startIdx, endIdx) + '\ninitLiveUserCounter();';

  vm.runInNewContext(counterCode, sandbox);

  const savedCount = parseInt(store['tripmozy_live_user_counter'], 10);
  assert('Subsequent visit: Increments counter by 1 (35 -> 36)', savedCount === 36, `Actual: ${savedCount}`);
  assert('Subsequent visit: Updates DOM element to 36', mockElement.textContent === '36', `Actual: ${mockElement.textContent}`);

  // Test manual incrementLiveUserCounter function
  vm.runInNewContext('incrementLiveUserCounter()', sandbox);
  assert('Manual increment: Increments counter to 37', sandbox.getLiveUserCount() === 37, `Actual: ${sandbox.getLiveUserCount()}`);
  assert('Manual increment: Applies pop animation class', mockElement.classList.contains('counter-num-pop'));

  // Test manual decrementLiveUserCounter function
  vm.runInNewContext('decrementLiveUserCounter(1)', sandbox);
  assert('Manual decrement: Decreases counter from 37 to 36', sandbox.getLiveUserCount() === 36, `Actual: ${sandbox.getLiveUserCount()}`);
  assert('Manual decrement: Updates DOM textContent to 36', mockElement.textContent === '36', `Actual: ${mockElement.textContent}`);
  assert('Manual decrement: Applies drop animation class', mockElement.classList.contains('counter-num-drop'));

  // Multi-unit decrement test
  vm.runInNewContext('decrementLiveUserCounter(3)', sandbox);
  assert('Multi-unit decrement: Decreases counter by 3 to 33', sandbox.getLiveUserCount() === 33, `Actual: ${sandbox.getLiveUserCount()}`);
  assert('Multi-unit decrement: Updates DOM textContent to 33', mockElement.textContent === '33', `Actual: ${mockElement.textContent}`);
}

// Test Case C: Legacy high stored count (> 50, e.g. 150) -> Safely clamps to <= 50
{
  const { sandbox, store, mockElement } = createMockEnvironment(150);
  
  const startIdx = appJs.indexOf('let liveActiveUserCount = 0;');
  const endIdx = appJs.indexOf('function setupEventListeners()');
  const counterCode = appJs.substring(startIdx, endIdx) + '\ninitLiveUserCounter();';

  vm.runInNewContext(counterCode, sandbox);

  const currentCount = sandbox.getLiveUserCount();
  assert('Legacy count > 50 is automatically normalized between 1 and 50', currentCount >= 1 && currentCount <= 50, `Actual: ${currentCount}`);
  assert('DOM textContent reflects clamped value <= 50', parseInt(mockElement.textContent, 10) <= 50, `Actual: ${mockElement.textContent}`);
}

// Test Case D: Boundary limits (Cannot exceed 50 or drop below 1)
{
  const { sandbox, store, mockElement } = createMockEnvironment(50);
  const startIdx = appJs.indexOf('let liveActiveUserCount = 0;');
  const endIdx = appJs.indexOf('function setupEventListeners()');
  const counterCode = appJs.substring(startIdx, endIdx) + '\ninitLiveUserCounter();';
  vm.runInNewContext(counterCode, sandbox);

  vm.runInNewContext('incrementLiveUserCounter(5)', sandbox);
  assert('Upper boundary: Counter capped at maximum 50', sandbox.getLiveUserCount() <= 50, `Actual: ${sandbox.getLiveUserCount()}`);

  vm.runInNewContext('decrementLiveUserCounter(100)', sandbox);
  assert('Lower boundary: Counter floored at minimum 1', sandbox.getLiveUserCount() >= 1, `Actual: ${sandbox.getLiveUserCount()}`);
}

console.log('\n================================================================');
console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
