const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('C:/Users/user/Documents/ai-trip-planner/index.html', 'utf8');
const app = fs.readFileSync('C:/Users/user/Documents/ai-trip-planner/app.js', 'utf8');

console.log('================================================================');
console.log(' TEST SUITE: Promotional Tour Offer Ad & Close Button');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(desc, condition) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${desc}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${desc}`);
  }
}

assert('index.html contains #promoAdModal', html.includes('id="promoAdModal"'));
assert('index.html contains #inPagePromoAdBanner', html.includes('id="inPagePromoAdBanner"'));
assert('Ad image references tour offer image', html.includes('tripmozy_kinnaur_tour_offer.jpg') || html.includes('tripmozy_tour_ad.jpg'));
assert('Close button uses welcome-ad-close-btn with 44px min touch target', 
  html.includes('welcome-ad-close-btn') && html.includes('closePromoAdModal()'));
assert('In-page ad has dismiss close button on top-right corner', 
  html.includes('dismissInPagePromoAd()'));
assert('Ad image links to official WhatsApp reservation desk', 
  html.includes('https://wa.me/919641866181'));
assert('Ad image file exists on disk', 
  fs.existsSync('C:/Users/user/Documents/ai-trip-planner/tripmozy_kinnaur_tour_offer.jpg') &&
  fs.existsSync('C:/Users/user/Documents/ai-trip-planner/tripmozy_tour_ad.jpg'));
assert('app.js defines openPromoAdModal', app.includes('function openPromoAdModal()'));
assert('app.js defines closePromoAdModal', app.includes('function closePromoAdModal()'));
assert('app.js defines dismissInPagePromoAd', app.includes('function dismissInPagePromoAd()'));
assert('app.js triggers auto-open promo ad modal on visit', app.includes('openPromoAdModal()'));
assert('app.js has Escape key listener to close promo ad', app.includes('closePromoAdModal()'));

console.log(`\n================================================================`);
console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`================================================================`);

if (failed > 0) process.exit(1);
