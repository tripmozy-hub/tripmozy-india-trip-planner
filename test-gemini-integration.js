const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passedCount = 0;
let failedCount = 0;

function assert(desc, condition) {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${desc}`);
    failedCount++;
  }
}

console.log('================================================================');
console.log(' TEST SUITE: TripMozy Gemini AI Integration & Resilient Fallback');
console.log('================================================================\n');

// 1. Static HTML checks
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

assert('HTML contains #geminiAiInsightsCard container', html.includes('id="geminiAiInsightsCard"'));
assert('HTML contains #geminiAiInsightsContent for dynamic rendering', html.includes('id="geminiAiInsightsContent"'));
assert('HTML includes Live Gemini AI badge indicator', html.includes('Live Gemini AI'));
assert('HTML defaults #geminiAiInsightsCard to hidden class', html.includes('id="geminiAiInsightsCard" class="hidden'));

// 2. JavaScript Engine & Helper checks
const appPath = path.join(__dirname, 'app.js');
const appCode = fs.readFileSync(appPath, 'utf8');

assert('app.js defines getTripMozyGeminiKey', appCode.includes('function getTripMozyGeminiKey'));
assert('app.js contains parseGeminiOutput function', appCode.includes('function parseGeminiOutput'));
assert('app.js contains formatGeminiItemsToHtml function', appCode.includes('function formatGeminiItemsToHtml'));
assert('app.js contains fetchGeminiAIInsights function', appCode.includes('async function fetchGeminiAIInsights'));
assert('app.js invokes fetchGeminiAIInsights inside renderDashboard', appCode.includes('fetchGeminiAIInsights(trip)'));

// 3. VM Functional Simulation
const cardMock = {
  hidden: true,
  classList: {
    add: function(c) { if (c === 'hidden') cardMock.hidden = true; },
    remove: function(c) { if (c === 'hidden') cardMock.hidden = false; }
  }
};
const contentMock = { innerHTML: '' };
const printableDocMock = { innerHTML: '' };

const sandbox = {
  console: console,
  Buffer: Buffer,
  atob: typeof atob !== 'undefined' ? atob : undefined,
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  AbortController: global.AbortController,
  document: {
    getElementById: function(id) {
      if (id === 'geminiAiInsightsCard') return cardMock;
      if (id === 'geminiAiInsightsContent') return contentMock;
      if (id === 'printableItineraryDoc') return printableDocMock;
      return { classList: { add: function(){}, remove: function(){} }, innerHTML: '', textContent: '' };
    }
  },
  window: {}
};

vm.createContext(sandbox);

// Extract only the Gemini helper functions and printable doc function to test logic cleanly
const parserCode = appCode.substring(appCode.indexOf('// ==========================================\n// GEMINI AI INTEGRATION'));
vm.runInContext(parserCode, sandbox);

// Test parser
const sampleAiText = `* Hidden Gem: Jogini Waterfall via Vashisht village trek.
* Local Food: Hot Siddu with ghee in Old Manali.
* Smart Travel Hack: Rent a scooty to skip Solang road traffic jams.`;

const parsed = sandbox.parseGeminiOutput(sampleAiText);
assert('parseGeminiOutput extracts 3 items from bullet text', parsed.length === 3);
assert('parseGeminiOutput captures title "Hidden Gem"', parsed[0].title === 'Hidden Gem');
assert('parseGeminiOutput captures desc correctly', parsed[0].desc.includes('Jogini Waterfall'));

const formattedHtml = sandbox.formatGeminiItemsToHtml(parsed);
assert('formatGeminiItemsToHtml produces list markup', formattedHtml.includes('<ul class="space-y-2 mt-1.5">'));
assert('formatGeminiItemsToHtml wraps items with ✦ icons', formattedHtml.includes('✦'));
assert('formatGeminiItemsToHtml includes strong title tags', formattedHtml.includes('<strong class="text-indigo-950 font-bold">Hidden Gem:</strong>'));

// Test Fallback Behavior when API fails (e.g. simulated network error)
async function testFallback() {
  sandbox.fetch = async function() {
    throw new Error('503 Service Unavailable / High Demand');
  };

  cardMock.hidden = false; // pretend it was unhidden
  const trip = { destination: 'Manali', days: 4, party: 'Couple', costPerPerson: 18000 };
  
  await sandbox.fetchGeminiAIInsights(trip);

  assert('When Gemini API encounters error, card is gracefully hidden (resilient fallback)', cardMock.hidden === true);
  assert('Trip object remains completely intact during fallback', trip.destination === 'Manali');
}

// Test Success Behavior when API returns valid output
async function testSuccess() {
  sandbox.fetch = async function() {
    return {
      ok: true,
      json: async function() {
        return {
          status: 'completed',
          steps: [
            {
              type: 'model_output',
              content: [{ text: sampleAiText }]
            }
          ]
        };
      }
    };
  };

  const trip = { destination: 'Manali', days: 4, party: 'Couple', costPerPerson: 18000 };
  await sandbox.fetchGeminiAIInsights(trip);

  assert('When Gemini API returns valid output, card is revealed', cardMock.hidden === false);
  assert('contentEl contains generated HTML', contentMock.innerHTML.includes('Hidden Gem:'));
  assert('trip.geminiAiInsights stores parsed items', trip.geminiAiInsights && trip.geminiAiInsights.items.length === 3);

  // Test printable doc inclusion
  assert('Printable doc contains Gemini AI insights section in app.js', appCode.includes('TripMozy AI Insights &amp; Local Secrets'));
}

async function run() {
  await testFallback();
  await testSuccess();

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

run();
