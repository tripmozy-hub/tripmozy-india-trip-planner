const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_DIR = 'C:\\Users\\user\\.gemini\\antigravity\\scratch\\ai-trip-planner';
const indexHtml = fs.readFileSync(path.join(PROJECT_DIR, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(PROJECT_DIR, 'app.js'), 'utf8');

console.log('================================================================');
console.log(' TEST SUITE: Itinerary "Est. Price" Removal & AI Disclaimer');
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

// 1. Static HTML & JS checks
assert('HTML contains AI-Generated Itinerary Disclaimer in dashboard', indexHtml.includes('AI-Generated Itinerary Disclaimer'));
assert('HTML contains AI disclaimer in Day-by-Day schedule view', indexHtml.includes('AI-Generated Itinerary:'));
assert('PDF generator in app.js contains AI-Generated Itinerary Disclaimer', appJs.includes('AI-Generated Itinerary Disclaimer'));
assert('PDF generator references artificial intelligence in disclaimer', appJs.includes('generated using Artificial Intelligence (AI)'));

// 2. Simulated Timeline Rendering: Verify NO "Est." or stop cost badge is rendered on stops
const mockContainer = { innerHTML: '' };
const mockDocument = {
  getElementById: (id) => {
    if (id === 'itineraryDaysContainer') return mockContainer;
    if (id === 'dayFilterChips') return { innerHTML: '' };
    return null;
  },
  querySelectorAll: () => []
};

const sandbox = {
  document: mockDocument,
  getCategoryColor: () => ({ bg: 'bg-blue-100', text: 'text-blue-800' }),
  getDistanceKm: () => 4.5,
  currentTrip: { coords: [32.2432, 77.1892] },
  lucide: { createIcons: () => {} },
  window: {},
  Number: Number
};

// Extract renderItineraryTimeline from app.js
const startTimelineIdx = appJs.indexOf('function renderItineraryTimeline(daysPlan)');
const endTimelineIdx = appJs.indexOf('function getCategoryColor(cat)');
const timelineFnCode = appJs.substring(startTimelineIdx, endTimelineIdx);

vm.runInNewContext(timelineFnCode, sandbox);

const sampleDaysPlan = [
  {
    day: 1,
    title: 'Arrival & Valley Exploration',
    dateStr: 'Day 1',
    overnight: 'Manali',
    stops: [
      { time: '09:30 AM', name: 'Hadimba Temple', category: 'Heritage', duration: '2h', cost: '₹50', desc: 'Historic temple', tip: 'Arrive early', coords: [32.248, 77.18] },
      { time: '12:30 PM', name: 'Mall Road', category: 'Shopping', duration: '2h', cost: '₹200', desc: 'Local shops', tip: 'Try momos', coords: [32.239, 77.18] }
    ]
  }
];

sandbox.renderItineraryTimeline(sampleDaysPlan);

assert('renderItineraryTimeline output does NOT contain "Est. ₹50"', !mockContainer.innerHTML.includes('Est. ₹50'));
assert('renderItineraryTimeline output does NOT contain "Est. ₹200"', !mockContainer.innerHTML.includes('Est. ₹200'));
assert('renderItineraryTimeline output does NOT contain "Est."', !mockContainer.innerHTML.includes('Est.'));
assert('renderItineraryTimeline still renders stop names (Hadimba Temple)', mockContainer.innerHTML.includes('Hadimba Temple'));
assert('renderItineraryTimeline still renders stop timings (09:30 AM)', mockContainer.innerHTML.includes('09:30 AM'));

// 3. Simulated PDF Document Rendering: Verify NO stop cost badge and AI disclaimer is present
const mockPdfContainer = { innerHTML: '' };
const pdfSandbox = {
  document: {
    getElementById: (id) => (id === 'printableItineraryDoc' ? mockPdfContainer : null)
  },
  formatINR: (num) => '₹' + Number(num).toLocaleString('en-IN'),
  window: {},
  Date: Date,
  Math: Math
};

vm.createContext(pdfSandbox);

const startPdfIdx = appJs.indexOf('function renderPrintableItineraryDoc(trip)');
const endPdfIdx = appJs.indexOf('// ==========================================', startPdfIdx);
const pdfFnCode = 'this.renderPrintableItineraryDoc = ' + appJs.substring(startPdfIdx, endPdfIdx).replace('function renderPrintableItineraryDoc(trip)', 'function(trip)');

vm.runInContext(pdfFnCode, pdfSandbox);

const sampleTrip = {
  destination: 'Manali, Himachal Pradesh',
  title: 'Himalayan Manali Getaway',
  subtitle: 'Snow peaks & scenic trails',
  days: 3,
  adults: 2,
  costPerPerson: 11500,
  daysPlan: sampleDaysPlan
};

pdfSandbox.renderPrintableItineraryDoc(sampleTrip);

assert('PDF output contains "AI-Generated Itinerary Disclaimer"', mockPdfContainer.innerHTML.includes('AI-Generated Itinerary Disclaimer'));
assert('PDF stop items do not contain "₹50"', !mockPdfContainer.innerHTML.includes('₹50'));
assert('PDF stop items do not contain "₹200"', !mockPdfContainer.innerHTML.includes('₹200'));
assert('PDF output contains destination (Manali, Himachal Pradesh)', mockPdfContainer.innerHTML.includes('Manali, Himachal Pradesh'));

console.log('\n================================================================');
console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
