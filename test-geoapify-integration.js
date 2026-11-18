const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_DIR = 'C:\\Users\\user\\Documents\\ai-trip-planner';
const indexHtml = fs.readFileSync(path.join(PROJECT_DIR, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(PROJECT_DIR, 'app.js'), 'utf8');

console.log('================================================================');
console.log(' TEST SUITE: Geoapify Maps, Geocoding & Nearby Places Integration');
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

// 1. API Key & DOM Elements
const EXPECTED_KEY = '6dbe70a8f6134228930e932efb7ca268';
assert('app.js defines the exact Geoapify API Key', appJs.includes(EXPECTED_KEY));
assert('index.html contains #destinationAutocompleteDropdown container', indexHtml.includes('id="destinationAutocompleteDropdown"'));
assert('index.html contains Geoapify radar badge in Map header', indexHtml.includes('Geoapify Live Radar'));

// 2. Integration logic checks
assert('app.js defines fetchGeoapifyNearbyPlaces', appJs.includes('function fetchGeoapifyNearbyPlaces'));
assert('app.js defines setupDestinationAutocomplete', appJs.includes('function setupDestinationAutocomplete'));
assert('app.js connects resolveIndianCoordinates to Geoapify Geocoding API', appJs.includes('api.geoapify.com/v1/geocode/search'));
assert('app.js connects autocomplete to Geoapify Autocomplete API', appJs.includes('api.geoapify.com/v1/geocode/autocomplete'));
assert('app.js connects nearby attractions to Geoapify Places API', appJs.includes('api.geoapify.com/v2/places'));
assert('app.js connects Leaflet to Geoapify HD map tiles', appJs.includes('maps.geoapify.com/v1/tile/osm-bright'));

console.log('\n================================================================');
console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
