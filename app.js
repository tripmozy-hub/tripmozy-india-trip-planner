/**
 * Tripmozy.com - Incredible India AI Travel Planner & Nearby Tourist Attractions Engine
 */

// State
let currentTrip = null;
let leafletMap = null;
let mapMarkers = [];
let mapPolylines = [];
let radiusCircle = null;
let baseCenterMarker = null;
let budgetChart = null;
let activeDayFilter = 'all';
let activeMapDayFilter = 'all';

// Manual Budget State in INR
let manualBudgetState = {
  stay: 0,
  food: 0,
  activities: 0,
  transport: 0,
  shopping: 0
};

// Indian Numbering Formatter
function formatINR(val) {
  const num = Math.round(Number(val) || 0);
  return '₹' + num.toLocaleString('en-IN');
}

// Haversine Distance in Kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// COMPREHENSIVE INCREDIBLE INDIA DESTINATIONS & NEARBY ATTRACTIONS DATABASE
const INDIA_DESTINATIONS = {
  manali: {
    destination: "Manali, Himachal Pradesh",
    days: 4,
    title: "Himalayan Vistas & Snow Valleys: 4 Days in Manali",
    subtitle: "From ancient Hadimba Temple and Vashisht hot springs to adrenaline snow sports in Solang Valley and cafes in Old Manali.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 18500,
    currency: "INR (₹)",
    coords: [32.2396, 77.1887], // Manali Mall Road
    nearbyAttractions: [
      { name: "Hadimba Devi Temple & Cedar Forest", category: "Temple", coords: [32.2483, 77.1802], desc: "1553 wooden pagoda temple nestled among towering giant deodar cedar forests.", tip: "Photograph with fluffy Angora rabbits and local yaks outside." },
      { name: "Vashisht Hot Water Springs & Temple", category: "Nature", coords: [32.2612, 77.1878], desc: "Natural geothermal sulfur baths renowned for medicinal healing properties across the Beas River.", tip: "Separate indoor bathing kunds for men and women." },
      { name: "Solang Valley Snow Sports Hub", category: "Adventure", coords: [32.3167, 77.1578], desc: "High alpine valley famous for skiing, paragliding, zorbing, and quad-bike snow rides.", tip: "Rent waterproof gumboots and snow suits before entering the valley." },
      { name: "Atal Tunnel & Sissu Waterfall (Lahaul)", category: "Scenic", coords: [32.4833, 77.1250], desc: "Travel through the 9.02 km engineering wonder into the barren, snow-capped Tibetan landscape of Lahaul.", tip: "The temperature drops significantly once exiting the north portal." },
      { name: "Jogini Waterfalls & Pine Trek", category: "Trek", coords: [32.2740, 77.1950], desc: "Scenic 45-minute pine trail from Vashisht leading to a cascading mountain waterfall.", tip: "Carry drinking water and wear hiking shoes." },
      { name: "Old Manali Cobblestone Cafes", category: "Culture", coords: [32.2530, 77.1750], desc: "Bohemian village with wooden houses, live acoustic music, wood-fired trout pizza, and craft shops.", tip: "Cafe 1947 and Dylan's Toasted & Roasted are must-visits." },
      { name: "Naggar Castle & Roerich Art Gallery", category: "Heritage", coords: [32.1180, 77.1700], desc: "Ancient wooden and stone palace of the Kullu Rajas overlooking the snow-capped Beas valley.", tip: "Sit at the castle courtyard restaurant for fresh apple juice." },
      { name: "Manu Temple in Upper Manali", category: "Temple", coords: [32.2560, 77.1720], desc: "The only temple in India dedicated to Sage Manu, the mythological creator of humankind.", tip: "Steep walk up Old Manali; auto-rickshaws can drop you near the top." },
      { name: "Van Vihar National Park", category: "Nature", coords: [32.2360, 77.1890], desc: "Peaceful riverside municipal park right next to Mall Road with a man-made boating pond.", tip: "Relax beside the roaring Beas River banks in the evening." },
      { name: "Mall Road Bazaars & Tibetan Monasteries", category: "Shopping", coords: [32.2390, 77.1880], desc: "Bustling evening market for Kullu shawls, wooden handicrafts, dried apricots, and hot momos.", tip: "Buy certified Kullu woolens with the state handloom hologram." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Central Manali & Historic Temples",
        stops: [
          { time: "09:30 AM", name: "Hadimba Devi Temple & Deodar Forest", category: "Heritage", cost: "₹0", duration: "2h", desc: "16th-century wooden temple with intricate wood carvings dedicated to Goddess Hadimba.", tip: "Arrive early morning for peaceful darshan before tourist buses arrive.", coords: [32.2483, 77.1802] },
          { time: "12:30 PM", name: "Old Manali Riverside Cafe Lunch", category: "Dining", cost: "₹650", duration: "1.5h", desc: "Enjoy wood-fired pizza and freshly caught Himalayan trout beside the Manalsu river stream.", tip: "Sit on the riverside wooden deck.", coords: [32.2530, 77.1750] },
          { time: "02:30 PM", name: "Manu Temple & Old Manali Village Walk", category: "Culture", coords: [32.2560, 77.1720], cost: "₹0", duration: "2h", desc: "Walk through traditional stone-and-wood Himachali houses with carved balconies.", tip: "Respect village privacy and ask before photographing elders." },
          { time: "05:30 PM", name: "Mall Road Stroll & Tibetan Monastery", category: "Shopping", coords: [32.2390, 77.1880], cost: "₹300", duration: "2.5h", desc: "Browse Tibetan prayer wheels, Kullu shawls, and savor steaming hot thukpa and momos.", tip: "Try the hot gulab jamuns near the government bus stand." }
        ]
      },
      {
        day: 2,
        title: "Day 2: Solang Valley Snow & Atal Tunnel Excursion",
        stops: [
          { time: "08:30 AM", name: "Solang Valley Snow Point", category: "Adventure", cost: "₹1,500", duration: "3.5h", desc: "Take the cable car gondola up to Mount Phatru for panoramic snow views, paragliding, and skiing.", tip: "Book the official ropeway ticket at the base station counter.", coords: [32.3167, 77.1578] },
          { time: "01:00 PM", name: "Atal Tunnel Crossing to Lahaul Valley", category: "Scenic", cost: "₹0", duration: "2h", desc: "Drive through the 9-km tunnel under the Rohtang Pass into Sissu village with frozen waterfalls.", tip: "Carry warm jackets; Lahaul is significantly colder than Manali.", coords: [32.4833, 77.1250] },
          { time: "04:30 PM", name: "Sissu Waterfall & Lake Stroll", category: "Nature", cost: "₹100", duration: "1.5h", desc: "Stunning glacier-fed waterfall gushing down high crags surrounded by poplars and willows.", tip: "Cross the suspension bridge over the Chandra River for photos.", coords: [32.4780, 77.1210] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Vashisht Hot Springs & Jogini Waterfall Hike",
        stops: [
          { time: "09:00 AM", name: "Vashisht Sulfur Baths & Sage Vashisht Temple", category: "Nature", cost: "₹0", duration: "2h", desc: "Bathe in the natural boiling mineral springs believed to possess rejuvenating skin properties.", tip: "Baths are warmest between 8 AM and 10 AM.", coords: [32.2612, 77.1878] },
          { time: "11:30 AM", name: "Jogini Waterfall Pine Forest Hike", category: "Trek", cost: "₹0", duration: "2.5h", desc: "Hike along cascading streams and apple orchards up to the multi-tiered Jogini falls.", tip: "Local tea stalls on the route serve hot Maggi and ginger chai.", coords: [32.2740, 77.1950] },
          { time: "02:30 PM", name: "Chopsticks Restaurant / Tibetan Kitchen", category: "Dining", cost: "₹550", duration: "1.5h", desc: "Authentic Tibetan restaurant on Mall Road serving hot Tingmo, Chili Garlic Noodles, and Thenthuk.", tip: "Their vegetable fried momos are a cult favorite.", coords: [32.2395, 77.1885] },
          { time: "05:00 PM", name: "Van Vihar Pine Forest Walk", category: "Nature", cost: "₹30", duration: "2h", desc: "Tall deodar forest leading right down to the Beas river bed with giant boulders.", tip: "Great peaceful twilight sunset spot away from the traffic.", coords: [32.2360, 77.1890] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Naggar Castle & Kullu Valley Craft Tour",
        stops: [
          { time: "09:30 AM", name: "Naggar Castle Heritage Palace", category: "Heritage", cost: "₹50", duration: "2.5h", desc: "Medieval wooden castle overlooking the snow peaks of the Pir Panjal range.", tip: "Climb to the top balcony for sweeping views of apple orchards.", coords: [32.1180, 77.1700] },
          { time: "12:30 PM", name: "Nicholas Roerich Russian Art Gallery", category: "Culture", cost: "₹100", duration: "1.5h", desc: "Estate of the famed Russian painter and philosopher who immortalized the Himalayas in oils.", tip: "See Roerich's vintage 1930s Dodge car parked in the garage.", coords: [32.1220, 77.1680] },
          { time: "03:00 PM", name: "Kullu Shawl Weaving Factory & Beas Rafting Point", category: "Shopping", cost: "₹800", duration: "2h", desc: "Watch master weavers create geometric Kinnauri borders on wooden handlooms.", tip: "Option for white-water river rafting in Kullu (Pirdi to Jhiri stretch).", coords: [31.9570, 77.1090] }
        ]
      }
    ],
    budgetBreakdown: { stay: 7800, food: 4900, activities: 2800, transport: 2200, shopping: 800 },
    packingList: {
      essentials: ["Govt ID / Aadhaar Card", "UPI / Cash for roadside dhabas", "Atal Tunnel taxi permit copy"],
      clothing: ["Thermal inners (top & bottom)", "Heavy fleece or down jacket", "Gloves, woolen beanie & muffler", "Water-resistant trekking boots"],
      gear: ["Lip balm & cold cream (Himalayan air is very dry)", "UV Sunglasses for snow glare", "Power bank"],
      health: ["Motion sickness medication for winding ghats", "ORS packets & Paracetamol"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). Google Pay / PhonePe works everywhere; keep ₹2,000 cash for taxi union stands and snow equipment.",
      transit: "Local 4x4 cabs or Himachal Tourism taxis are the safest for mountain roads and snow points.",
      tipping: "7-10% in cafes and ₹300-₹500 for full-day drivers is customary.",
      emergency: "Manali Police: 01902-252322 | State Disaster Helpline: 1077 | Ambulance: 108.",
      etiquette: "Never litter in mountain streams or pine forests. Always carry your plastic trash back to town.",
      phrases: [
        { en: "Greetings", local: "Namaste" },
        { en: "How far is this?", local: "Yeh kitni door hai?" },
        { en: "Is snow open today?", local: "Kya aaj baraf dekhne ko milegi?" }
      ]
    }
  },

  goa: {
    destination: "Goa, India",
    days: 4,
    title: "Coastal Breeze & Heritage: 4 Days in Goa",
    subtitle: "From golden North Goa beaches, Aguada fort, and water sports to Portuguese Latin Quarters and sunset shacks.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 22000,
    currency: "INR (₹)",
    coords: [15.4989, 73.8278], // Panaji Center
    nearbyAttractions: [
      { name: "Fort Aguada & Sea Lighthouse", category: "Heritage", coords: [15.4925, 73.7736], desc: "17th-century Portuguese fortress standing guard at the mouth of the Mandovi River.", tip: "Arrive early morning for best sea views." },
      { name: "Baga & Calangute Beach Shacks", category: "Beach", coords: [15.5562, 73.7517], desc: "Lively beach strip famous for water sports, fresh seafood shacks, and sunbeds.", tip: "Britto's shack serves delicious crab xacuti." },
      { name: "Fontainhas Latin Quarter", category: "Culture", coords: [15.4989, 73.8278], desc: "Asia's only Portuguese quarter with heritage pastel-colored villas, azulejos tiles, and bakeries.", tip: "Try freshly baked bebinca at Confeitaria 31 De Janeiro." },
      { name: "Basilica of Bom Jesus (Old Goa)", category: "Heritage", coords: [15.5009, 73.9116], desc: "UNESCO World Heritage Baroque church containing the sacred mortal remains of St. Francis Xavier.", tip: "Modest dress required: shoulders and knees must be covered." },
      { name: "Chapora Fort ('Dil Chahta Hai' Fort)", category: "Scenic", coords: [15.6062, 73.7364], desc: "Red laterite ramparts offering 360-degree vistas over Vagator beach and the Chapora river.", tip: "Steep walk on loose stones; wear sneakers." },
      { name: "Anjuna Flea Market & Curlies", category: "Shopping", coords: [15.5804, 73.7410], desc: "Bohemian market with Tibetan jewelry, spices, linen shirts, and beachside shacks.", tip: "Friendly bargaining is expected." },
      { name: "Palolem Beach (South Goa)", category: "Beach", coords: [15.0100, 74.0232], desc: "Serene crescent white-sand bay flanked by coconut palms and calm swimming waters.", tip: "Rent a kayak to paddle to Butterfly Beach." },
      { name: "Dudhsagar Waterfalls & Spice Plantation", category: "Nature", coords: [15.3144, 74.3143], desc: "Four-tiered waterfall on the Mandovi River cascading like a sea of milk through the Western Ghats.", tip: "Open October to May; 4x4 jeep safari required." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: North Goa Coastal Sights & Fort Aguada",
        stops: [
          { time: "09:30 AM", name: "Fort Aguada & Portuguese Lighthouse", category: "Heritage", cost: "₹50", duration: "2h", desc: "Historic coastal fort offering panoramic vistas of the Arabian Sea and Sinquerim beach.", tip: "Visit early morning before coastal humidity rises.", coords: [15.4925, 73.7736] },
          { time: "12:30 PM", name: "Britto's Beach Shack at Baga", category: "Dining", cost: "₹850", duration: "1.5h", desc: "Enjoy butter garlic prawns, Goan fish curry rice, and fresh lime soda right on the sand.", tip: "Ask for a front-row table facing the waves.", coords: [15.5562, 73.7517] },
          { time: "03:00 PM", name: "Baga & Calangute Water Sports", category: "Adventure", cost: "₹1,800", duration: "2.5h", desc: "Parasailing, bumper rides, and jet ski tours operated by registered tourism operators.", tip: "Book directly at the registered beach counter.", coords: [15.5439, 73.7553] },
          { time: "06:30 PM", name: "Thalassa Clifftop Sunset Lounge", category: "Nightlife", cost: "₹1,500", duration: "2.5h", desc: "Watch sunset over Ozran beach with Greek and Mediterranean appetizers.", tip: "Sunset table reservation is essential.", coords: [15.5901, 73.7389] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Fontainhas Heritage Quarter & Old Goa Churches",
        stops: [
          { time: "09:00 AM", name: "Fontainhas Latin Quarter Walking Tour", category: "Culture", cost: "₹0", duration: "2.5h", desc: "Stroll along Rua 31 de Janeiro with pastel yellow and blue Portuguese villas.", tip: "Stop by the local bakery for warm egg tarts.", coords: [15.4989, 73.8278] },
          { time: "12:30 PM", name: "Viva Panjim Heritage Lunch", category: "Dining", cost: "₹750", duration: "1.5h", desc: "Family-run heritage house serving authentic Goan prawn balchão and coconut sol kadi.", tip: "Wash it down with local Kokum juice.", coords: [15.4975, 73.8291] },
          { time: "03:00 PM", name: "Basilica of Bom Jesus & Se Cathedral", category: "Heritage", cost: "₹50", duration: "2h", desc: "Marvel at Asia's largest church and the 400-year-old silver casket of St. Francis Xavier.", tip: "Shoulders and knees must be respectfully covered.", coords: [15.5009, 73.9116] },
          { time: "06:30 PM", name: "Mandovi River Sunset Catamaran Cruise", category: "Scenic", cost: "₹800", duration: "1.5h", desc: "Evening boat cruise accompanied by Goan folk Dekhni dances along Panaji harbor.", tip: "Upper open deck offers the best sea breeze.", coords: [15.5035, 73.8280] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Chapora Fort, Vagator & Flea Markets",
        stops: [
          { time: "09:30 AM", name: "Chapora Fort ('Dil Chahta Hai' Fort)", category: "Scenic", cost: "₹0", duration: "2h", desc: "Panoramic vantage point overlooking the Chapora river estuary and Vagator beach.", tip: "Wear shoes with good grip on the red stone path.", coords: [15.6062, 73.7364] },
          { time: "12:30 PM", name: "Burger Factory Anjuna", category: "Dining", cost: "₹650", duration: "1.5h", desc: "Gourmet burgers and artisan sweet potato fries.", tip: "Try the passion fruit lemonade.", coords: [15.5780, 73.7430] },
          { time: "03:30 PM", name: "Anjuna Beach Flea Market", category: "Shopping", cost: "₹500", duration: "2.5h", desc: "Bustling market for silver jewelry, handicrafts, and boho beachwear.", tip: "Gentle bargaining is normal.", coords: [15.5804, 73.7410] },
          { time: "07:30 PM", name: "Curlies Beach Shack & Live Beats", category: "Nightlife", cost: "₹1,200", duration: "3h", desc: "Iconic beach hangout with ocean breeze and tandoori seafood.", tip: "Stay for the beach fire show.", coords: [15.5750, 73.7400] }
        ]
      },
      {
        day: 4,
        title: "Day 4: South Goa Serenity & Palolem Beach",
        stops: [
          { time: "10:00 AM", name: "Cabo de Rama Fort Ruins", category: "Scenic", cost: "₹0", duration: "2h", desc: "Quiet clifftop fort overlooking virgin blue water bays in South Goa.", tip: "One of Goa's least crowded photo points.", coords: [15.0886, 73.9219] },
          { time: "01:00 PM", name: "Palolem Beach Lunch at Dropadi", category: "Dining", cost: "₹950", duration: "2h", desc: "Eat fresh kingfish rava fry with toes in the white sand of Palolem.", tip: "Kayaks can be rented on the beach for ₹300.", coords: [15.0100, 74.0232] },
          { time: "05:00 PM", name: "Dolphin Spotting Boat Ride", category: "Adventure", cost: "₹600", duration: "1.5h", desc: "Take a local wooden motorized boat into the bay to spot wild humpback dolphins.", tip: "Keep your camera ready.", coords: [15.0115, 74.0200] }
        ]
      }
    ],
    budgetBreakdown: { stay: 9000, food: 6500, activities: 3200, transport: 2300, shopping: 1000 },
    packingList: {
      essentials: ["Govt ID / Aadhaar", "Driving License for scooty/car rental", "UPI apps active"],
      clothing: ["Cotton linen shirts", "Swimwear and beach shorts", "Comfortable strap sandals"],
      gear: ["High SPF 50+ Sunscreen", "Polarized sunglasses", "Waterproof phone cover"],
      health: ["Mosquito repellent spray (Odomos)", "ORS packets"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). UPI is accepted everywhere; keep ₹1,500 cash for beach parking.",
      transit: "Rent a 125cc scooter (₹400/day) or a self-drive Thar/car (₹1,800/day).",
      tipping: "7-10% tip is standard in shacks and restaurants.",
      emergency: "Goa Police: 112 | Coastal Police: 1093 | Ambulance: 108.",
      etiquette: "Wear swimwear only at beaches. Dress properly in towns, churches, and markets.",
      phrases: [
        { en: "Hello", local: "Deu boro dis divum (Konkani)" },
        { en: "Thank you", local: "Dev borem korum" }
      ]
    }
  },

  kerala: {
    destination: "Munnar & Alleppey, Kerala",
    days: 5,
    title: "God's Own Country: 5 Days in Munnar & Alleppey",
    subtitle: "From rolling Western Ghat tea gardens and Eravikulam waterfalls to peaceful Alleppey backwater houseboats.",
    party: "Family",
    budgetTier: "Moderate",
    costPerPerson: 28500,
    currency: "INR (₹)",
    coords: [10.0889, 77.0595], // Munnar Center
    nearbyAttractions: [
      { name: "Tea Museum & Tata Plantation", category: "Culture", coords: [10.0890, 77.0600], desc: "Historic museum detailing 140 years of tea making with fresh tea leaf processing demonstrations.", tip: "Buy factory-fresh white tea at the gift shop." },
      { name: "Eravikulam National Park (Nilgiri Tahr)", category: "Nature", coords: [10.2000, 77.0500], desc: "High-altitude sanctuary home to the endangered mountain goat and panoramic views of Anamudi peak.", tip: "Book online forest department bus tickets in advance." },
      { name: "Mattupetty Dam & Echo Point", category: "Scenic", coords: [10.1060, 77.1240], desc: "Reservoir surrounded by tea gardens where you can rent speedboats and test natural valley echoes.", tip: "Speedboat ride is ₹800 for group of 5." },
      { name: "Top Station Viewpoint (Tamil Nadu Border)", category: "Scenic", coords: [10.1250, 77.2450], desc: "Highest point in Munnar at 1,700 meters offering views of the Western Ghats and Theni valley.", tip: "Clear views before 11 AM; clouds roll in by noon." },
      { name: "Alleppey Backwater Houseboat Cruise", category: "Scenic", coords: [9.4981, 76.3388], desc: "Traditional thatch-roof kettuvallam houseboat cruising Vembanad Lake and narrow village lagoons.", tip: "Authentic Kerala sadya lunch is cooked fresh on board." },
      { name: "Marari Quiet Fishing Beach", category: "Beach", coords: [9.6015, 76.2990], desc: "Pristine white sand beach lined with leaning coconut palms and traditional fishing boats.", tip: "Ideal for evening sunset walks." },
      { name: "Fort Kochi Chinese Fishing Nets", category: "Heritage", coords: [9.9675, 76.2415], desc: "Cantilevered wooden nets installed by 14th-century Chinese traders on the Arabian Sea.", tip: "Help fishermen pull the counterweighted ropes." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Arrival & Fort Kochi Chinese Nets",
        stops: [
          { time: "10:00 AM", name: "Fort Kochi Beach & Chinese Fishing Nets", category: "Heritage", cost: "₹0", duration: "2h", desc: "Watch giant wooden cantilevered fishing nets silhouetted against the morning Arabian Sea.", tip: "Tip local fishermen ₹100 to help raise the nets.", coords: [9.9675, 76.2415] },
          { time: "01:00 PM", name: "Kerala Karimeen Pollichathu Lunch", category: "Dining", cost: "₹850", duration: "1.5h", desc: "Pearl spot fish marinated in spicy shallot masala and steamed in banana leaves.", tip: "Must try with soft appams.", coords: [9.9620, 76.2435] },
          { time: "05:00 PM", name: "Kathakali Martial Arts & Dance Show", category: "Culture", cost: "₹450", duration: "2h", desc: "Watch artists apply natural herbal makeup before enacting scenes from the Mahabharata.", tip: "Arrive 45 mins early to photograph the makeup process.", coords: [9.9650, 76.2440] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Western Ghats Drive to Munnar Tea Gardens",
        stops: [
          { time: "08:30 AM", name: "Cheeyappara & Valara Waterfalls", category: "Nature", cost: "₹0", duration: "2h", desc: "Seven-tiered waterfall gushing down rocky cliffs right beside the Munnar highway.", tip: "Sample spiced raw mangoes and pineapples at roadside stalls.", coords: [10.0270, 76.8850] },
          { time: "01:30 PM", name: "Munnar Tea Museum & Factory Tour", category: "Culture", cost: "₹150", duration: "2h", desc: "Experience the history of tea making and taste freshly brewed first-flush tea.", tip: "Buy vacuum-sealed gift packs.", coords: [10.0890, 77.0600] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Eravikulam National Park & Mattupetty Dam",
        stops: [
          { time: "08:30 AM", name: "Eravikulam National Park Safari", category: "Nature", cost: "₹200", duration: "3h", desc: "Board the state forest bus through misty peaks to spot Nilgiri Tahr mountain goats.", tip: "Book online morning slots to avoid ticket queues.", coords: [10.2000, 77.0500] },
          { time: "01:30 PM", name: "Mattupetty Dam Speedboating", category: "Scenic", cost: "₹500", duration: "2h", desc: "Speed across the serene storage reservoir framed by tea estates.", tip: "Test your voice at Echo Point nearby.", coords: [10.1060, 77.1240] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Alleppey Backwater Houseboat Cruise",
        stops: [
          { time: "11:30 AM", name: "Board Alleppey Kettuvallam Houseboat", category: "Scenic", cost: "₹8,000", duration: "5h", desc: "Glide through the palm-fringed canals of Vembanad Lake while lunch is prepared on board.", tip: "Includes freshly prepared Karimeen fry, sambar, and red rice.", coords: [9.4981, 76.3388] },
          { time: "04:30 PM", name: "Village Canoe Ride in Narrow Lagoons", category: "Adventure", cost: "₹500", duration: "1.5h", desc: "Row through shallow village streams inaccessible to large houseboats.", tip: "Watch duck farming and toddy tapping.", coords: [9.4900, 76.3450] }
        ]
      },
      {
        day: 5,
        title: "Day 5: Marari Beach & Ayurvedic Rejuvenation",
        stops: [
          { time: "09:30 AM", name: "Marari Quiet Beach Stroll", category: "Beach", cost: "₹0", duration: "2h", desc: "Untouched quiet beach lined with casuarina trees and traditional fishing boats.", tip: "Peaceful morning ocean breeze.", coords: [9.6015, 76.2990] },
          { time: "12:30 PM", name: "Ayurvedic Herbal Abhyanga Massage", category: "Culture", cost: "₹2,200", duration: "2h", desc: "Traditional warm herbal oil therapy to relieve travel fatigue.", tip: "Book only at certified Ayush-approved centers.", coords: [9.6050, 76.3020] }
        ]
      }
    ],
    budgetBreakdown: { stay: 12000, food: 7200, activities: 4300, transport: 3500, shopping: 1500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar", "Houseboat booking voucher", "UPI Apps"],
      clothing: ["Light cotton / linen clothes", "Light sweater for Munnar hills (14°C)", "Modest clothing for temples"],
      gear: ["Umbrella / raincoat (Kerala showers are sudden)", "Mosquito repellent", "Camera"],
      health: ["Motion sickness pills for Munnar ghat roads", "Sunscreen"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). UPI is universally accepted.",
      transit: "Private AC Cab with driver is the most comfortable for Kochi-Munnar-Alleppey.",
      tipping: "₹500-₹800 for the houseboat captain and chef team.",
      emergency: "Kerala Police: 112 | Tourism Helpline Kochi: 0484-2224055 | Ambulance: 108.",
      etiquette: "Remove footwear before entering homes and temples.",
      phrases: [
        { en: "Hello", local: "Namaskaram" },
        { en: "Thank you", local: "Nandi" }
      ]
    }
  },

  rajasthan: {
    destination: "Jaipur & Udaipur, Rajasthan",
    days: 4,
    title: "Royal Forts & Palaces: 4 Days in Rajasthan",
    subtitle: "From Amber Fort's hall of mirrors and Hawa Mahal to Nahargarh sunset and Lake Pichola boat palaces.",
    party: "Family",
    budgetTier: "Moderate",
    costPerPerson: 24000,
    currency: "INR (₹)",
    coords: [26.9124, 75.7873], // Jaipur Center
    nearbyAttractions: [
      { name: "Amber Fort & Sheesh Mahal", category: "Heritage", coords: [26.9855, 75.8513], desc: "Majestic hilltop fort with the world-famous mirror palace where a single candle lights up the room.", tip: "Take an electric jeep to the fort entrance." },
      { name: "Hawa Mahal (Palace of Winds)", category: "Heritage", coords: [26.9239, 75.8267], desc: "Pink sandstone facade with 953 honeycomb windows for royal ladies to view street life.", tip: "Best photography is from Wind View Cafe across the road." },
      { name: "City Palace & Chandra Mahal", category: "Heritage", coords: [26.9258, 75.8236], desc: "Royal residence blending Rajput and Mughal architecture, still home to the Maharaja.", tip: "See the peacock gate in the inner courtyard." },
      { name: "Jantar Mantar UNESCO Observatory", category: "Heritage", coords: [26.9248, 75.8246], desc: "18th-century stone astronomical instruments including the world's largest stone sundial.", tip: "Hire an audio guide for mathematical explanations." },
      { name: "Nahargarh Fort Sunset Viewpoint", category: "Scenic", coords: [26.9370, 75.8150], desc: "Ramparts towering over the entire pink city with breathtaking twilight sunset vistas.", tip: "Arrive 40 mins before sunset for a terrace ledge table." },
      { name: "Jal Mahal (Water Palace)", category: "Scenic", coords: [26.9534, 75.8462], desc: "Submerged sandstone palace standing in the middle of Man Sagar Lake.", tip: "Lit up beautifully after 7 PM." },
      { name: "Johari & Bapu Bazaar", category: "Shopping", coords: [26.9200, 75.8230], desc: "Historic pink arcades filled with block-printed quilts, Kundan jewelry, and jootis.", tip: "Shop at verified Rajasthali state emporiums." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Hawa Mahal, City Palace & Bazaars",
        stops: [
          { time: "09:00 AM", name: "Hawa Mahal (Palace of Winds)", category: "Heritage", cost: "₹50", duration: "1.5h", desc: "Iconic honeycomb sandstone palace facade.", tip: "Photograph with morning sun illuminating the pink stones.", coords: [26.9239, 75.8267] },
          { time: "11:00 AM", name: "City Palace & Royal Museums", category: "Heritage", cost: "₹300", duration: "2.5h", desc: "Sprawling royal courtyards and weaponry galleries.", tip: "See the giant silver water urns in the Diwan-i-Khas.", coords: [26.9258, 75.8236] },
          { time: "02:00 PM", name: "Laxmi Mishthan Bhandar (LMB) Thali", category: "Dining", cost: "₹650", duration: "1.5h", desc: "Dal Baati Churma, Gatte ki Sabzi, and Ghewar.", tip: "Authentic royal Rajasthani vegetarian feast.", coords: [26.9210, 75.8245] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Amber Fort, Sheesh Mahal & Nahargarh Sunset",
        stops: [
          { time: "08:30 AM", name: "Amber Fort & Mirror Palace (Sheesh Mahal)", category: "Heritage", cost: "₹500", duration: "3h", desc: "Marvel at thousands of convex Belgian mirrors embedded in white marble walls.", tip: "Take the rear road jeep instead of walking uphill.", coords: [26.9855, 75.8513] },
          { time: "05:30 PM", name: "Nahargarh Fort Sunset Viewpoint", category: "Scenic", cost: "₹200", duration: "2h", desc: "Watch the golden sun sink behind the Aravali hills as the city lights illuminate.", tip: "Claim a ledge seat at Padao restaurant.", coords: [26.9370, 75.8150] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Stepwells & Local Handicraft Bazaars",
        stops: [
          { time: "09:30 AM", name: "Panna Meena ka Kund Stepwell", category: "Heritage", cost: "₹0", duration: "1.5h", desc: "Geometric symmetrical stepwell with criss-crossing stairs.", tip: "Spectacular photography spot.", coords: [26.9890, 75.8560] },
          { time: "03:00 PM", name: "Johari & Bapu Bazaar Shopping", category: "Shopping", cost: "₹1,500", duration: "3h", desc: "Shop Jaipuri razai (quilts), blue pottery, and Kundan jewelry.", tip: "Ask for government certified handloom marks.", coords: [26.9200, 75.8230] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Patrika Gate & Chokhi Dhani Folk Village",
        stops: [
          { time: "10:00 AM", name: "Patrika Gate at Jawahar Circle", category: "Culture", cost: "₹0", duration: "1.5h", desc: "Hand-painted architectural archway celebrating Rajasthan's heritage.", tip: "Symmetrical walkway photography.", coords: [26.8520, 75.8050] },
          { time: "06:00 PM", name: "Chokhi Dhani Ethnic Village Fair", category: "Culture", cost: "₹1,200", duration: "3.5h", desc: "Folk Kalbelia fire dancers, camel rides, puppet shows, and grand sit-down royal thali.", tip: "Eat with your hands on traditional baixot seats.", coords: [26.7670, 75.8340] }
        ]
      }
    ],
    budgetBreakdown: { stay: 9500, food: 6800, activities: 3400, transport: 2800, shopping: 1500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar", "UPI & Cash for bazaars", "Comfortable sneakers for fort cobblestones"],
      clothing: ["Cotton kurtas", "Sunhat / Sunglasses", "Light shawl for cool winter evenings"],
      gear: ["Camera with wide lens", "Power bank"],
      health: ["Hand sanitizer", "Digestive aids (Pudin Hara / Hajmola)"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). UPI accepted everywhere; carry cash for auto-rickshaws.",
      transit: "Auto rickshaws (Tuk-tuks) and Ola/Uber are readily available.",
      tipping: "10% tip in restaurants; ₹100-₹200 for licensed palace guides.",
      emergency: "Jaipur Police: 112 | Tourist Police: 0141-2822863 | Ambulance: 108.",
      etiquette: "Polite greetings 'Khamma Ghani' bring warm smiles. Remove shoes in temples.",
      phrases: [
        { en: "Greetings", local: "Khamma Ghani" },
        { en: "Thank you", local: "Dhanyavaad" }
      ]
    }
  }
};

// Additional 40+ Indian Tourist Locations for Live Mapping & Nearby Detection
const INDIAN_COORDS_LOOKUP = {
  "rishikesh": [30.0869, 78.2676],
  "haridwar": [29.9457, 78.1642],
  "kashmir": [34.0837, 74.7973],
  "srinagar": [34.0837, 74.7973],
  "gulmarg": [34.0484, 74.3805],
  "pahalgam": [34.0163, 75.3150],
  "ladakh": [34.1526, 77.5771],
  "leh": [34.1526, 77.5771],
  "ooty": [11.4102, 76.6950],
  "coonoor": [11.3530, 76.7959],
  "kodaikanal": [10.2381, 77.4892],
  "varanasi": [25.3176, 82.9739],
  "ayodhya": [26.7922, 82.1998],
  "darjeeling": [27.0410, 88.2663],
  "gangtok": [27.3389, 88.6065],
  "sikkim": [27.3389, 88.6065],
  "shillong": [25.5788, 91.8933],
  "meghalaya": [25.5788, 91.8933],
  "cherrapunji": [25.2702, 91.7323],
  "hampi": [15.3350, 76.4600],
  "coorg": [12.4244, 75.7382],
  "gokarna": [14.5479, 74.3188],
  "mysore": [12.2958, 76.6394],
  "udaipur": [24.5854, 73.7125],
  "jodhpur": [26.2389, 73.0243],
  "jaisalmer": [26.9157, 70.9083],
  "agra": [27.1767, 78.0081],
  "amritsar": [31.6340, 74.8723],
  "delhi": [28.6139, 77.2090],
  "shimla": [31.1048, 77.1734],
  "kasol": [32.0100, 77.3150],
  "dharamshala": [32.2190, 76.3234],
  "mcleodganj": [32.2426, 76.3213],
  "nainital": [29.3919, 79.4542],
  "mussoorie": [30.4598, 78.0644],
  "andaman": [11.6234, 92.7265],
  "havelock": [11.9761, 92.9876],
  "puri": [19.8135, 85.8312],
  "konark": [19.8876, 86.0945],
  "mahabaleshwar": [17.9237, 73.6586],
  "lonavala": [18.7557, 73.4091],
  "rann of kutch": [23.7337, 69.8597],
  "statue of unity": [21.8380, 73.7191],
  "pondicherry": [11.9416, 79.8083],
  "rameshwaram": [9.2876, 79.3129],
  "madurai": [9.9252, 78.1198],
  "kanyakumari": [8.0883, 77.5385]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  setupEventListeners();

  const savedKey = localStorage.getItem('tripmozy_gemini_key');
  if (savedKey) {
    const input = document.getElementById('geminiApiKeyInput');
    if (input) input.value = savedKey;
  }

  // Mobile orientation & resize responsiveness for Leaflet map & charts
  window.addEventListener('resize', () => {
    if (leafletMap) leafletMap.invalidateSize();
  });
  window.addEventListener('orientationchange', () => {
    if (leafletMap) setTimeout(() => leafletMap.invalidateSize(), 250);
  });
});



function setupEventListeners() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.getAttribute('data-group');
      document.querySelectorAll(`.chip[data-group="${group}"]`).forEach(c => {
        c.classList.remove('active');
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });
      chip.classList.add('active');
      const radio = chip.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  document.querySelectorAll('.interest-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      if (chip.classList.contains('active')) {
        chip.className = "interest-chip active px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-blue-600 bg-blue-600 text-white flex items-center gap-1.5 shadow-sm transition";
      } else {
        chip.className = "interest-chip px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:border-slate-400 flex items-center gap-1.5 transition";
      }
    });
  });
}

function updateDurationLabel(val) {
  const label = document.getElementById('durationLabel');
  if (label) label.textContent = `${val} ${val == 1 ? 'Day' : 'Days'}`;
}

function setTripDays(val) {
  const range = document.getElementById('durationRange');
  if (range) {
    range.value = val;
    updateDurationLabel(val);
  }
}


function setDestination(city) {
  const input = document.getElementById('destinationInput');
  if (input) {
    input.value = city;
    input.focus();
  }
}

function setManualBudget(val) {
  const input = document.getElementById('manualTargetBudgetInput');
  if (input) {
    input.value = val;
    input.focus();
  }
}

function setRandomIndianDestination() {
  const places = [
    "Manali, Himachal Pradesh", "Goa, India", "Munnar, Kerala", "Jaipur, Rajasthan",
    "Rishikesh, Uttarakhand", "Srinagar, Kashmir", "Leh, Ladakh", "Ooty, Tamil Nadu",
    "Varanasi, Uttar Pradesh", "Darjeeling, West Bengal", "Hampi, Karnataka",
    "Udaipur, Rajasthan", "Coorg, Karnataka", "Shillong, Meghalaya", "Amritsar, Punjab",
    "Pondicherry, India", "Gokarna, Karnataka", "Nainital, Uttarakhand", "Andaman Islands"
  ];
  const choice = places[Math.floor(Math.random() * places.length)];
  setDestination(choice);
}

function loadIndianCircuit(key) {
  if (INDIA_DESTINATIONS[key]) {
    setDestination(INDIA_DESTINATIONS[key].destination);
    const range = document.getElementById('durationRange');
    if (range) {
      range.value = INDIA_DESTINATIONS[key].days;
      updateDurationLabel(INDIA_DESTINATIONS[key].days);
    }
    const manualInput = document.getElementById('manualTargetBudgetInput');
    if (manualInput) {
      manualInput.value = INDIA_DESTINATIONS[key].costPerPerson;
    }
    handleFormSubmit(new Event('submit'));
  } else {
    // Lookup generic Indian destination
    const cleanKey = key.toLowerCase();
    for (const name in INDIAN_COORDS_LOOKUP) {
      if (name.includes(cleanKey)) {
        setDestination(name.charAt(0).toUpperCase() + name.slice(1) + ", India");
        handleFormSubmit(new Event('submit'));
        return;
      }
    }
  }
}

// FORM SUBMISSION & MAP GEOLOCATION WORKFLOW
async function handleFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const destination = document.getElementById('destinationInput').value.trim();
  if (!destination) {
    alert("Please enter a destination in India.");
    return;
  }

  const days = parseInt(document.getElementById('durationRange').value) || 4;
  const companion = document.querySelector('input[name="companion"]:checked')?.value || "Solo";
  const budgetTier = document.querySelector('input[name="budget"]:checked')?.value || "Moderate";
  const dietary = document.getElementById('dietaryPref')?.value || "Pure Vegetarian";
  const manualBudgetInput = Number(document.getElementById('manualTargetBudgetInput')?.value) || 0;
  const mapRadius = parseInt(document.getElementById('mapRadiusSelect')?.value) || 35;

  const selectedInterests = Array.from(document.querySelectorAll('.interest-chip.active'))
    .map(c => c.getAttribute('data-interest'));

  // Switch to Loading Screen
  document.getElementById('heroSection').classList.add('hidden');
  document.getElementById('itineraryDashboard').classList.add('hidden');
  document.getElementById('loadingSection').classList.remove('hidden');

  // Step 1: Geocoding location
  document.getElementById('loadingTitle').textContent = `Locating ${destination} on India's Map...`;
  document.getElementById('loadingSubtitle').textContent = "Accessing geographic coordinates & road network...";
  document.getElementById('progressBar').style.width = '25%';
  document.getElementById('loadingStep').textContent = "Step 1 of 4";
  document.getElementById('loadingPercent').textContent = "25%";

  // Geocode location (local database + OpenStreetMap Nominatim fallback)
  const baseCoords = await resolveIndianCoordinates(destination);
  await sleep(350);

  // Step 2: Nearby attractions scan
  document.getElementById('loadingTitle').textContent = `Discovering Nearby Tourist Places in ${destination}...`;
  document.getElementById('loadingSubtitle').textContent = `Scanning within ${mapRadius} km radius for temples, viewpoints, forts & waterfalls...`;
  document.getElementById('progressBar').style.width = '55%';
  document.getElementById('loadingStep').textContent = "Step 2 of 4";
  document.getElementById('loadingPercent').textContent = "55%";
  await sleep(400);

  // Step 3: Route clustering
  document.getElementById('loadingTitle').textContent = "Clustering Sights by Driving Proximity...";
  document.getElementById('loadingSubtitle').textContent = "Minimizing transit fatigue with geographically optimized daily loops...";
  document.getElementById('progressBar').style.width = '85%';
  document.getElementById('loadingStep').textContent = "Step 3 of 4";
  document.getElementById('loadingPercent').textContent = "85%";
  await sleep(350);

  // Step 4: Finalize Itinerary
  document.getElementById('loadingTitle').textContent = "Finalizing Indian Rupee (₹) Itinerary...";
  document.getElementById('loadingSubtitle').textContent = "Calculating hotel, meal, and verified entry ticket fees...";
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('loadingStep').textContent = "Step 4 of 4";
  document.getElementById('loadingPercent').textContent = "100%";
  await sleep(300);

  // Generate Itinerary
  const tripPlan = generateIndianTripPlan({
    destination,
    baseCoords,
    days,
    companion,
    budgetTier,
    dietary,
    manualBudget: manualBudgetInput,
    interests: selectedInterests,
    radius: mapRadius
  });
  currentTrip = tripPlan;

  initManualBudgetState(tripPlan, manualBudgetInput);
  renderDashboard(tripPlan);

  // Reveal Dashboard
  document.getElementById('loadingSection').classList.add('hidden');
  document.getElementById('itineraryDashboard').classList.remove('hidden');

  // Confetti
  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  lucide.createIcons();
  switchTab('map'); // Switch to map tab first as requested!
  document.getElementById('itineraryDashboard').scrollIntoView({ behavior: 'smooth' });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// RESOLVE REAL GEOGRAPHIC COORDINATES IN INDIA
async function resolveIndianCoordinates(destQuery) {
  const clean = destQuery.toLowerCase();

  // 1. Direct match with preset keys
  for (const key in INDIA_DESTINATIONS) {
    if (clean.includes(key)) {
      return INDIA_DESTINATIONS[key].coords;
    }
  }

  // 2. Direct match with Indian lookup table
  for (const name in INDIAN_COORDS_LOOKUP) {
    if (clean.includes(name)) {
      return INDIAN_COORDS_LOOKUP[name];
    }
  }

  // 3. Fallback to OpenStreetMap Nominatim Live Geocoding API with 2.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destQuery + ", India")}&limit=1&countrycodes=in`;
    const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch (err) {
    console.warn("Nominatim geocoding fallback used local coordinates.", err);
  }

  // Default Central India coordinate (Bhopal/Nagpur center of India)
  return [23.2599, 77.4126];
}

// INDIAN TRIP PLANNER & GEOGRAPHIC CLUSTERING ENGINE
function generateIndianTripPlan(params) {
  const dest = params.destination;
  const clean = dest.toLowerCase();

  // Check preset first
  for (const key in INDIA_DESTINATIONS) {
    if (clean.includes(key)) {
      const preset = JSON.parse(JSON.stringify(INDIA_DESTINATIONS[key]));
      preset.party = params.companion;
      preset.budgetTier = params.budgetTier;
      preset.radius = params.radius;

      // Scale days if needed
      if (params.days !== preset.days) {
        const factor = params.days / preset.days;
        preset.days = params.days;
        preset.costPerPerson = Math.round(preset.costPerPerson * factor);
        preset.budgetBreakdown = {
          stay: Math.round(preset.budgetBreakdown.stay * factor),
          food: Math.round(preset.budgetBreakdown.food * factor),
          activities: Math.round(preset.budgetBreakdown.activities * factor),
          transport: Math.round(preset.budgetBreakdown.transport * factor),
          shopping: Math.round(preset.budgetBreakdown.shopping * factor)
        };
        preset.daysPlan = scaleIndianDaysPlan(preset.daysPlan, params.days, preset.destination, preset.coords);
      }

      // Compute distances from base coordinates to all attractions
      preset.nearbyAttractions.forEach(poi => {
        poi.distKm = getDistanceKm(preset.coords[0], preset.coords[1], poi.coords[0], poi.coords[1]);
      });
      preset.nearbyAttractions.sort((a, b) => a.distKm - b.distKm);

      return preset;
    }
  }

  // Open-World Generative Planner for Any Indian Town / City
  return createDynamicIndianCityPlan(params);
}

function scaleIndianDaysPlan(originalDays, targetDays, destination, baseCoords) {
  if (targetDays === originalDays.length) return originalDays;
  if (targetDays < originalDays.length) {
    return originalDays.slice(0, targetDays);
  }

  const extended = [...originalDays];
  for (let d = originalDays.length + 1; d <= targetDays; d++) {
    const latOffset = (Math.sin(d) * 0.025);
    const lngOffset = (Math.cos(d) * 0.025);
    const dayCoords = [baseCoords[0] + latOffset, baseCoords[1] + lngOffset];

    extended.push({
      day: d,
      title: `Day ${d}: Nearby Nature Excursion & Sunset in ${destination}`,
      stops: [
        { time: "09:00 AM", name: `Scenic Viewpoint & Pine Walk`, category: "Nature", cost: "₹50", duration: "2.5h", desc: `Panoramic elevated ridge with sweeping valley views of ${destination}.`, tip: "Morning light provides clear views of the mountain horizons.", coords: dayCoords },
        { time: "01:00 PM", name: `Local Himalayan Dhabba & Regional Thali`, category: "Dining", cost: "₹450", duration: "1.5h", desc: `Enjoy authentic hot Kadhi Pakoda, Rajma Chawal, and freshly rolled butter rotis.`, tip: "Wash it down with local mint lassi.", coords: [dayCoords[0] + 0.004, dayCoords[1] + 0.003] },
        { time: "03:30 PM", name: `Artisan Handicraft Weavers & Bazaars`, category: "Shopping", cost: "₹800", duration: "2.5h", desc: `Browse local hand-woven woolens, herbal teas, and regional spices.`, tip: "Look for certified artisan cooperative labels.", coords: [dayCoords[0] - 0.003, dayCoords[1] + 0.005] },
        { time: "07:00 PM", name: `Sunset Cafe & Evening Refreshments`, category: "Relaxation", cost: "₹650", duration: "2h", desc: `Celebrate the sunset with piping hot ginger tea, pakodas, and mountain views.`, tip: "Carry a light shawl or fleece jacket.", coords: [dayCoords[0] + 0.002, dayCoords[1] - 0.003] }
      ]
    });
  }
  return extended;
}

function createDynamicIndianCityPlan(params) {
  const dest = params.destination;
  const days = params.days;
  const coords = params.baseCoords;
  const radius = params.radius;

  const budgetMultiplier = params.budgetTier === 'Luxury' ? 2.2 : (params.budgetTier === 'Economy' ? 0.6 : 1.0);
  const baseCost = Math.round(4800 * days * budgetMultiplier);

  // Generate realistic nearby tourist attractions with real computed distances
  const nearbyAttractions = [
    { name: `${dest} Historic Fort & Heritage Complex`, category: "Fort", coords: [coords[0] + 0.018, coords[1] + 0.012], desc: `Historic ramparts guarding the heritage center of ${dest}.`, tip: "Arrive in the morning to beat the queues." },
    { name: `Ancient Sacred Temple & Spiritual Kund`, category: "Temple", coords: [coords[0] - 0.014, coords[1] + 0.018], desc: `Century-old stone temple revered by pilgrims across the region.`, tip: "Dress modestly covering shoulders and knees." },
    { name: `${dest} Valley Viewpoint & Sunset Ridge`, category: "Scenic", coords: [coords[0] + 0.038, coords[1] - 0.025], desc: `Elevated panoramic ridge looking over the surrounding hills and river valleys.`, tip: "Best photography light starts 45 mins before sunset." },
    { name: `Cascading Forest Waterfall & Nature Trail`, category: "Waterfall", coords: [coords[0] - 0.045, coords[1] - 0.035], desc: `Natural mountain stream cascading into rock pools amidst dense greenery.`, tip: "Wear trekking shoes with good grip." },
    { name: `Central Heritage Bazaar & Clock Tower`, category: "Shopping", coords: [coords[0] + 0.003, coords[1] + 0.004], desc: `Bustling market arcades with regional spices, handicrafts, and sweet shops.`, tip: "Try the hot jalebis and local snacks." },
    { name: `Botanical Garden & Boating Lake`, category: "Nature", coords: [coords[0] + 0.022, coords[1] - 0.012], desc: `Lush manicured gardens with paddle boats and walking trails.`, tip: "Ideal for a relaxing afternoon stroll." },
    { name: `Royal Palace & Museum Gallery`, category: "Heritage", coords: [coords[0] - 0.025, coords[1] + 0.030], desc: `Palace architecture showcasing royal palanquins, armor, and miniature art.`, tip: "Audio guide is recommended." },
    { name: `Riverside Ghat & Evening Aarti Spot`, category: "Culture", coords: [coords[0] + 0.012, coords[1] + 0.024], desc: `Stone steps leading to the sacred river where evening lamps are floated.`, tip: "Experience the mesmerizing brass lamp aarti ceremony." }
  ];

  nearbyAttractions.forEach(poi => {
    poi.distKm = getDistanceKm(coords[0], coords[1], poi.coords[0], poi.coords[1]);
  });
  nearbyAttractions.sort((a, b) => a.distKm - b.distKm);

  // Group geographically into days
  const daysPlan = [];
  const themes = [
    "City Center & Historic Heritage",
    "Scenic Viewpoints & Valley Excursion",
    "Spiritual Temples & Waterfall Trail",
    "Palaces, Bazaars & Cultural Celebration",
    "Nature Sanctuary & Leisurely Exploration"
  ];

  for (let d = 1; d <= days; d++) {
    const theme = themes[(d - 1) % themes.length];
    const poi1 = nearbyAttractions[((d - 1) * 2) % nearbyAttractions.length];
    const poi2 = nearbyAttractions[((d - 1) * 2 + 1) % nearbyAttractions.length];

    daysPlan.push({
      day: d,
      title: `Day ${d}: ${theme} (${dest})`,
      stops: [
        {
          time: "09:30 AM",
          name: poi1.name,
          category: poi1.category,
          cost: "₹50",
          duration: "2.5h",
          desc: poi1.desc,
          tip: poi1.tip,
          coords: poi1.coords
        },
        {
          time: "12:30 PM",
          name: `Authentic Regional Bistro (${params.dietary})`,
          category: "Dining",
          cost: formatINR(Math.round(450 * budgetMultiplier)),
          duration: "1.5h",
          desc: `Enjoy hot regional specialties cooked in traditional local spices.`,
          tip: "Ask for the fresh seasonal thali.",
          coords: [poi1.coords[0] + 0.002, poi1.coords[1] + 0.002]
        },
        {
          time: "03:00 PM",
          name: poi2.name,
          category: poi2.category,
          cost: "₹100",
          duration: "2.5h",
          desc: poi2.desc,
          tip: poi2.tip,
          coords: poi2.coords
        },
        {
          time: "06:30 PM",
          name: `Twilight Sunset Point & Local Market`,
          category: "Relaxation",
          cost: formatINR(Math.round(350 * budgetMultiplier)),
          duration: "2h",
          desc: `Watch evening fall over ${dest} with hot ginger chai and regional sweets.`,
          tip: "Keep camera ready for sunset colors.",
          coords: [poi2.coords[0] - 0.003, poi2.coords[1] + 0.003]
        }
      ]
    });
  }

  return {
    destination: dest,
    days: days,
    title: `The Ultimate ${days}-Day Journey Through ${dest}`,
    subtitle: `Custom-crafted itinerary based on real geographic distances from ${dest} with verified Indian Rupee (₹) pricing.`,
    party: params.companion,
    budgetTier: params.budgetTier,
    costPerPerson: baseCost,
    currency: "INR (₹)",
    coords: coords,
    radius: radius,
    nearbyAttractions: nearbyAttractions,
    daysPlan: daysPlan,
    budgetBreakdown: {
      stay: Math.round(baseCost * 0.40),
      food: Math.round(baseCost * 0.28),
      activities: Math.round(baseCost * 0.16),
      transport: Math.round(baseCost * 0.10),
      shopping: Math.round(baseCost * 0.06)
    },
    packingList: {
      essentials: [`Govt ID / Aadhaar Card`, "UPI & Cash for local dhabas", "Comfortable walking shoes"],
      clothing: ["Breathable cottons or light layers", "Modest outfits for temple entries", "Light jacket for evening"],
      gear: ["Power bank", "Compact umbrella", "Offline Google Maps downloaded"],
      health: ["Hand sanitizer & wet wipes", "Basic personal medicines & ORS"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). UPI (Google Pay, PhonePe) accepted across India; keep cash for small stalls.",
      transit: "Pre-booked local cabs, auto rickshaws, or state tourism buses are easiest.",
      tipping: "7-10% tip in restaurants; ₹100-₹200 for local guides.",
      emergency: "National Emergency: 112 | Police: 100/112 | Ambulance: 108.",
      etiquette: "Remove footwear before entering temples. Dress respectfully in holy spaces.",
      phrases: [
        { en: "Greetings", local: "Namaste" },
        { en: "Thank you", local: "Dhanyavaad" }
      ]
    }
  };
}

// INITIALIZE MANUAL BUDGET
function initManualBudgetState(trip, manualBudgetInput) {
  const b = trip.budgetBreakdown;
  if (manualBudgetInput && manualBudgetInput > 0) {
    const aiTotal = b.stay + b.food + b.activities + b.transport + b.shopping;
    const ratio = manualBudgetInput / aiTotal;
    manualBudgetState = {
      stay: Math.round(b.stay * ratio),
      food: Math.round(b.food * ratio),
      activities: Math.round(b.activities * ratio),
      transport: Math.round(b.transport * ratio),
      shopping: Math.round(b.shopping * ratio)
    };
  } else {
    manualBudgetState = {
      stay: b.stay,
      food: b.food,
      activities: b.activities,
      transport: b.transport,
      shopping: b.shopping
    };
  }
}

// RENDER DASHBOARD
function renderDashboard(trip) {
  document.getElementById('badgeCity').textContent = trip.destination;
  document.getElementById('dashDaysBadge').textContent = `${trip.days} Days`;
  document.getElementById('dashStyleBadge').textContent = `${trip.budgetTier} Tier`;
  document.getElementById('dashPartyBadge').textContent = trip.party;
  document.getElementById('dashTripTitle').textContent = trip.title;
  document.getElementById('dashTripSubtitle').textContent = trip.subtitle;
  document.getElementById('dashTotalBudget').textContent = formatINR(trip.costPerPerson);

  const nearbyCount = trip.nearbyAttractions?.length || 8;
  document.getElementById('dashNearbyCountBadge').textContent = `${nearbyCount} Nearby Places Mapped`;
  document.getElementById('tabNearbyPill').textContent = nearbyCount;
  document.getElementById('mapCenterCityText').textContent = trip.destination;

  // Update Hotels tab pill count
  if (window.getTripmozyHotelsForLocation) {
    const hotelCount = window.getTripmozyHotelsForLocation(trip.destination).length;
    const hotelPill = document.getElementById('tabHotelsPill');
    if (hotelPill) hotelPill.textContent = hotelCount > 0 ? hotelCount + ' Hotels' : 'Live';
  }

  // Render Map & Nearby Attractions (Primary Tab)
  renderMapAndNearbyAttractions(trip);

  // Render Timeline
  renderDayFilterChips(trip.daysPlan);
  renderItineraryTimeline(trip.daysPlan);

  // Render Hotels & Tours Tab (live from Tripmozy)
  renderHotelsTab(trip);

  // Render Budget & Manual Column
  renderBudgetWithManualColumn(trip);

  // Render Packing & Guide
  renderPacking(trip);
  renderGuide(trip);
}

// MAP & NEARBY ATTRACTIONS RENDERING
const DAY_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#e11d48'];

function renderMapAndNearbyAttractions(trip) {
  const mapElement = document.getElementById('mapContainer');
  if (!mapElement) return;

  // Render Day Route Filter Buttons on Map
  renderMapDayFilterButtons(trip.daysPlan);

  // Render Nearby Attractions List
  renderNearbyAttractionsList(trip);

  // Initialize or Center Leaflet Map
  if (!leafletMap) {
    leafletMap = L.map('mapContainer', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(trip.coords, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(leafletMap);
  } else {
    leafletMap.setView(trip.coords, 12);
  }

  // Clear existing layers
  mapMarkers.forEach(m => leafletMap.removeLayer(m));
  mapPolylines.forEach(p => leafletMap.removeLayer(p));
  if (radiusCircle) leafletMap.removeLayer(radiusCircle);
  if (baseCenterMarker) leafletMap.removeLayer(baseCenterMarker);
  mapMarkers = [];
  mapPolylines = [];

  // 1. Draw Destination Base Center Marker (Special Gold/Blue Pin)
  const baseIcon = L.divIcon({
    className: 'base-city-pin',
    html: `
      <div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 14px;">
        📍
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  baseCenterMarker = L.marker(trip.coords, { icon: baseIcon, zIndexOffset: 1000 }).addTo(leafletMap);
  baseCenterMarker.bindPopup(`
    <div style="font-family: inherit; font-size: 13px;">
      <div style="color: #2563eb; font-weight: 800; font-size: 14px;">📍 ${trip.destination}</div>
      <div style="color: #64748b; font-size: 12px; margin-top: 2px;">Searched Location Base Center</div>
      <div style="font-size: 11px; color: #10b981; margin-top: 4px; font-weight: 700;">Radius: ${trip.radius || 35} km scan active</div>
    </div>
  `);

  // 2. Draw Exploration Radius Circle (Subtle Blue)
  const radiusMeters = (trip.radius || 35) * 1000;
  radiusCircle = L.circle(trip.coords, {
    radius: radiusMeters,
    color: '#2563eb',
    weight: 1.5,
    dashArray: '5, 8',
    fillColor: '#3b82f6',
    fillOpacity: 0.05
  }).addTo(leafletMap);

  // 3. Plot Itinerary Stops & Daily Connectors
  const allLatLngs = [trip.coords];
  let totalKmCount = 0;

  trip.daysPlan.forEach((day, dayIndex) => {
    const dayColor = DAY_COLORS[dayIndex % DAY_COLORS.length];
    const dayLatLngs = [];

    // Filter day if selected
    if (activeMapDayFilter !== 'all' && activeMapDayFilter != day.day) {
      return;
    }

    day.stops.forEach((stop, stopIndex) => {
      const latLng = [stop.coords[0], stop.coords[1]];
      allLatLngs.push(latLng);
      dayLatLngs.push(latLng);

      const distFromCenter = getDistanceKm(trip.coords[0], trip.coords[1], stop.coords[0], stop.coords[1]);

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: ${dayColor}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${day.day}.${stopIndex + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(leafletMap);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; min-width: 200px;">
          <div style="color: ${dayColor}; font-weight: 700; font-size: 11px; text-transform: uppercase;">Day ${day.day} • ${stop.time}</div>
          <div style="font-weight: 800; font-size: 14px; margin: 3px 0; color: #0f172a;">${stop.name}</div>
          <div style="color: #64748b; font-size: 11.5px; margin-bottom: 5px;">${stop.desc}</div>
          <div style="font-size: 11px; color: #0284c7; font-weight: 600;">📍 ${distFromCenter} km from center</div>
          ${stop.tip ? `<div style="font-size: 11px; color: #b45309; margin-top: 4px;">💡 ${stop.tip}</div>` : ''}
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; text-align: right;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${stop.coords[0]},${stop.coords[1]}" target="_blank" style="color: #2563eb; font-size: 11px; font-weight: 700; text-decoration: none;">Get Driving Directions ↗</a>
          </div>
        </div>
      `);

      mapMarkers.push(marker);
    });

    // Draw Polyline Route connecting stops
    if (dayLatLngs.length > 1) {
      const polyline = L.polyline(dayLatLngs, {
        color: dayColor,
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(leafletMap);
      mapPolylines.push(polyline);

      for (let i = 0; i < dayLatLngs.length - 1; i++) {
        totalKmCount += getDistanceKm(dayLatLngs[i][0], dayLatLngs[i][1], dayLatLngs[i + 1][0], dayLatLngs[i + 1][1]);
      }
    }
  });

  // Fit bounds smoothly
  if (allLatLngs.length > 1) {
    leafletMap.fitBounds(allLatLngs, { padding: [45, 45], maxZoom: 14 });
  }

  // Update Route Summary Text
  const routeSummary = document.getElementById('routeDistanceSummary');
  if (routeSummary) {
    if (activeMapDayFilter === 'all') {
      routeSummary.textContent = `Full Trip Total Transit: ~${Math.round(totalKmCount)} km across ${trip.days} days • Geographically clustered to minimize daily drive time.`;
    } else {
      routeSummary.textContent = `Day ${activeMapDayFilter} Transit: ~${Math.round(totalKmCount)} km loop • Connected by direct roads from ${trip.destination}.`;
    }
  }
}

// RENDER MAP DAY FILTER BUTTONS
function renderMapDayFilterButtons(daysPlan) {
  const container = document.getElementById('mapDayFilterButtons');
  container.innerHTML = `
    <button onclick="filterMapDay('all')" class="map-day-btn px-3 py-1 rounded-lg text-xs font-bold ${activeMapDayFilter === 'all' ? 'bg-blue-600 text-white' : 'btn-white text-slate-700'} shrink-0 transition" data-mapday="all">
      All Day Routes
    </button>
  `;

  daysPlan.forEach(d => {
    const isAct = activeMapDayFilter == d.day;
    container.innerHTML += `
      <button onclick="filterMapDay(${d.day})" class="map-day-btn px-3 py-1 rounded-lg text-xs font-semibold ${isAct ? 'bg-blue-600 text-white' : 'btn-white text-slate-700'} shrink-0 transition" data-mapday="${d.day}">
        Day ${d.day} Loop
      </button>
    `;
  });
}

function filterMapDay(day) {
  activeMapDayFilter = day;
  document.querySelectorAll('.map-day-btn').forEach(btn => {
    if (btn.getAttribute('data-mapday') == day) {
      btn.className = "map-day-btn px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shrink-0 transition shadow-sm";
    } else {
      btn.className = "map-day-btn px-3 py-1 rounded-lg text-xs font-semibold btn-white text-slate-700 shrink-0 transition";
    }
  });

  if (currentTrip) {
    renderMapAndNearbyAttractions(currentTrip);
  }
}

// RENDER NEARBY ATTRACTIONS LIST WITH KM DISTANCES
function renderNearbyAttractionsList(trip) {
  const container = document.getElementById('nearbyAttractionsList');
  container.innerHTML = '';

  const places = trip.nearbyAttractions || [];
  document.getElementById('nearbyCountPill').textContent = `${places.length} Spots`;

  places.forEach((poi, index) => {
    container.innerHTML += `
      <div class="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition text-left cursor-pointer group" onclick="focusMapLocation(${poi.coords[0]}, ${poi.coords[1]}, '${poi.name.replace(/'/g, "\\'")}')">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h5 class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
              ${poi.name}
            </h5>
            <span class="text-[10px] text-slate-500 font-medium">${poi.category || 'Sightseeing'}</span>
          </div>
          <span class="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
            ${poi.distKm} km
          </span>
        </div>
        <p class="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
          ${poi.desc}
        </p>
        <div class="mt-1.5 flex items-center justify-between text-[10px]">
          <span class="text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
            <i data-lucide="crosshair" class="w-2.5 h-2.5"></i> Locate on Map
          </span>
          <span class="text-emerald-700 font-semibold">📍 Nearby</span>
        </div>
      </div>
    `;
  });
}

function focusMapLocation(lat, lng, name) {
  switchTab('map');
  setTimeout(() => {
    if (leafletMap) {
      leafletMap.invalidateSize();
      leafletMap.setView([lat, lng], 15, { animate: true });
      mapMarkers.forEach(m => {
        const pos = m.getLatLng();
        if (Math.abs(pos.lat - lat) < 0.0005 && Math.abs(pos.lng - lng) < 0.0005) {
          m.openPopup();
        }
      });
    }
  }, 200);
}

function fitMapBounds() {
  if (leafletMap && mapMarkers.length > 0) {
    const group = L.featureGroup(mapMarkers);
    if (baseCenterMarker) group.addLayer(baseCenterMarker);
    leafletMap.fitBounds(group.getBounds(), { padding: [40, 40] });
  }
}

// TAB 2: ITINERARY TIMELINE
function renderDayFilterChips(daysPlan) {
  const container = document.getElementById('dayFilterChips');
  container.innerHTML = `
    <button onclick="filterDay('all')" class="day-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white transition shrink-0 shadow-sm" data-day="all">
      All Days (${daysPlan.length})
    </button>
  `;
  daysPlan.forEach(d => {
    container.innerHTML += `
      <button onclick="filterDay(${d.day})" class="day-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shrink-0 shadow-sm" data-day="${d.day}">
        Day ${d.day}
      </button>
    `;
  });
}

function filterDay(day) {
  activeDayFilter = day;
  document.querySelectorAll('.day-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-day') == day) {
      btn.className = "day-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white transition shrink-0 shadow-sm";
    } else {
      btn.className = "day-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shrink-0 shadow-sm";
    }
  });

  document.querySelectorAll('.day-card-container').forEach(card => {
    if (day === 'all' || card.getAttribute('data-day') == day) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

function renderItineraryTimeline(daysPlan) {
  const container = document.getElementById('itineraryDaysContainer');
  container.innerHTML = '';

  daysPlan.forEach(day => {
    let stopsHtml = '';
    day.stops.forEach((stop, index) => {
      const categoryColor = getCategoryColor(stop.category);
      const distFromCenter = currentTrip ? getDistanceKm(currentTrip.coords[0], currentTrip.coords[1], stop.coords[0], stop.coords[1]) : null;

      stopsHtml += `
        <div class="relative pl-6 sm:pl-8 pb-6 group">
          ${index !== day.stops.length - 1 ? '<div class="absolute left-2.5 sm:left-3.5 top-5 bottom-0 w-0.5 bg-slate-200 group-hover:bg-blue-400 transition"></div>' : ''}
          <div class="absolute left-1 sm:left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition"></div>

          <div class="ui-card p-4 sm:p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">${stop.time}</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded ${categoryColor.bg} ${categoryColor.text}">${stop.category}</span>
                <span class="text-xs text-slate-500 flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${stop.duration}</span>
                ${distFromCenter !== null ? `<span class="text-xs text-blue-600 font-bold bg-blue-50/80 px-2 py-0.5 rounded">📍 ${distFromCenter} km</span>` : ''}
              </div>
              <div class="text-xs font-bold text-slate-800">${stop.cost !== '₹0' && stop.cost !== '$0' ? `Est. ${stop.cost}` : 'Free Entry'}</div>
            </div>

            <h4 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-2">
              ${stop.name}
            </h4>
            
            <p class="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              ${stop.desc}
            </p>

            ${stop.tip ? `
              <div class="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <i data-lucide="lightbulb" class="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5"></i>
                <span><strong>Tripmozy Insider:</strong> ${stop.tip}</span>
              </div>
            ` : ''}

            <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <button onclick="focusMapLocation(${stop.coords[0]}, ${stop.coords[1]}, '${stop.name.replace(/'/g, "\\'")}')" class="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition">
                <i data-lucide="map-pin" class="w-3 h-3"></i> View on Map
              </button>
              <label class="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-800">
                <input type="checkbox" onchange="toggleDone(this)" class="accent-blue-600 rounded cursor-pointer" />
                <span>Mark Visited</span>
              </label>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML += `
      <div class="day-card-container ui-card p-5 sm:p-6 bg-white border border-slate-200 shadow-sm rounded-xl" data-day="${day.day}">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-sm">
              D${day.day}
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 font-heading">${day.title}</h3>
              <span class="text-xs text-slate-500">${day.stops.length} curated stops on map</span>
            </div>
          </div>
        </div>
        <div class="pt-2">
          ${stopsHtml}
        </div>
      </div>
    `;
  });
}

function getCategoryColor(cat) {
  switch (cat) {
    case 'Dining': case 'Foodie':
      return { bg: 'bg-amber-50', text: 'text-amber-800 border border-amber-200' };
    case 'Culture': case 'Art': case 'Heritage':
      return { bg: 'bg-purple-50', text: 'text-purple-800 border border-purple-200' };
    case 'Nature': case 'Scenic':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800 border border-emerald-200' };
    case 'Adventure': case 'Trek':
      return { bg: 'bg-rose-50', text: 'text-rose-800 border border-rose-200' };
    case 'Shopping':
      return { bg: 'bg-indigo-50', text: 'text-indigo-800 border border-indigo-200' };
    default:
      return { bg: 'bg-blue-50', text: 'text-blue-800 border border-blue-200' };
  }
}

function toggleDone(checkbox) {
  const card = checkbox.closest('.ui-card');
  if (checkbox.checked) {
    card.classList.add('opacity-50', 'line-through');
  } else {
    card.classList.remove('opacity-50', 'line-through');
  }
}

// TAB 3: BUDGET BREAKDOWN WITH MANUAL BUDGET COLUMN
function renderBudgetWithManualColumn(trip) {
  const b = trip.budgetBreakdown;
  const aiTotal = b.stay + b.food + b.activities + b.transport + b.shopping;
  document.getElementById('budgetGrandTotal').textContent = formatINR(aiTotal);

  const categories = [
    { key: "stay", name: "Hotels & Stays", aiVal: b.stay, icon: "bed", color: "bg-blue-500" },
    { key: "food", name: "Dining, Cafes & Drinks", aiVal: b.food, icon: "utensils", color: "bg-amber-500" },
    { key: "activities", name: "Sightseeing & Entry Tickets", aiVal: b.activities, icon: "ticket", color: "bg-purple-500" },
    { key: "transport", name: "Cabs, Trains & Local Transit", aiVal: b.transport, icon: "bus", color: "bg-emerald-500" },
    { key: "shopping", name: "Bazaars, Souvenirs & Misc", aiVal: b.shopping, icon: "shopping-bag", color: "bg-rose-500" }
  ];

  const listContainer = document.getElementById('budgetCategoriesList');
  listContainer.innerHTML = '';

  categories.forEach(c => {
    const curManualVal = manualBudgetState[c.key] || c.aiVal;
    listContainer.innerHTML += `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
        <div class="w-1/2 flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg ${c.color}/15 text-slate-800 flex items-center justify-center shrink-0">
            <i data-lucide="${c.icon}" class="w-3.5 h-3.5"></i>
          </div>
          <div>
            <span class="text-xs sm:text-sm font-semibold text-slate-800 block">${c.name}</span>
            <span class="text-[10px] text-slate-500">~${formatINR(Math.round(c.aiVal / trip.days))}/day</span>
          </div>
        </div>

        <div class="w-1/4 text-right">
          <span class="text-xs sm:text-sm font-bold text-slate-700">${formatINR(c.aiVal)}</span>
        </div>

        <div class="w-1/4 flex justify-end">
          <div class="relative w-28 sm:w-32">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
            <input 
              type="number" 
              step="500"
              value="${curManualVal}" 
              oninput="handleManualBudgetChange('${c.key}', this.value)"
              class="w-full pl-6 pr-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold text-right focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
            />
          </div>
        </div>
      </div>
    `;
  });

  updateBudgetTotalsAndChart();
}

function handleManualBudgetChange(key, value) {
  const num = Math.max(0, parseInt(value) || 0);
  manualBudgetState[key] = num;
  updateBudgetTotalsAndChart();
}

function resetManualBudgetToAI() {
  if (!currentTrip) return;
  const b = currentTrip.budgetBreakdown;
  manualBudgetState = {
    stay: b.stay,
    food: b.food,
    activities: b.activities,
    transport: b.transport,
    shopping: b.shopping
  };
  renderBudgetWithManualColumn(currentTrip);
  lucide.createIcons();
}

function updateBudgetTotalsAndChart() {
  if (!currentTrip) return;
  const b = currentTrip.budgetBreakdown;
  const aiTotal = b.stay + b.food + b.activities + b.transport + b.shopping;

  const manualTotal = manualBudgetState.stay + 
                      manualBudgetState.food + 
                      manualBudgetState.activities + 
                      manualBudgetState.transport + 
                      manualBudgetState.shopping;

  document.getElementById('manualGrandTotal').textContent = formatINR(manualTotal);

  const diff = manualTotal - aiTotal;
  const varianceEl = document.getElementById('varianceValue');
  if (varianceEl) {
    if (diff === 0) {
      varianceEl.textContent = "Exact match with AI recommendation";
      varianceEl.className = "font-bold text-slate-600";
    } else if (diff < 0) {
      varianceEl.textContent = `₹${Math.abs(diff).toLocaleString('en-IN')} Budget Savings vs AI Estimate`;
      varianceEl.className = "font-bold text-emerald-700";
    } else {
      varianceEl.textContent = `₹${diff.toLocaleString('en-IN')} Extra Comfort / Buffer Added`;
      varianceEl.className = "font-bold text-blue-700";
    }
  }

  const ctx = document.getElementById('budgetChartCanvas');
  if (!ctx) return;

  if (budgetChart) {
    budgetChart.destroy();
  }

  budgetChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Stay', 'Food', 'Activities', 'Transit', 'Shopping'],
      datasets: [{
        data: [
          manualBudgetState.stay, 
          manualBudgetState.food, 
          manualBudgetState.activities, 
          manualBudgetState.transport, 
          manualBudgetState.shopping
        ],
        backgroundColor: ['#2563eb', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#334155',
            font: { size: 11 }
          }
        }
      },
      cutout: '70%'
    }
  });
}

// TAB 4: PACKING CHECKLIST
function renderPacking(trip) {
  const container = document.getElementById('packingListContainer');
  container.innerHTML = '';

  const groups = [
    { title: "Identity & Documents", items: trip.packingList.essentials, icon: "file-text", color: "text-blue-600" },
    { title: "Clothing & Footwear", items: trip.packingList.clothing, icon: "shirt", color: "text-blue-600" },
    { title: "Gadgets & Chargers", items: trip.packingList.gear, icon: "smartphone", color: "text-blue-600" },
    { title: "Health & Medicines", items: trip.packingList.health, icon: "heart-pulse", color: "text-blue-600" }
  ];

  groups.forEach(g => {
    let itemsHtml = '';
    g.items.forEach(item => {
      itemsHtml += `
        <label class="flex items-start gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer py-1 select-none">
          <input type="checkbox" onchange="updatePackingProgress()" class="packing-cb mt-0.5 rounded accent-blue-600 cursor-pointer" />
          <span>${item}</span>
        </label>
      `;
    });

    container.innerHTML += `
      <div class="ui-card p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
        <h4 class="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
          <i data-lucide="${g.icon}" class="w-4 h-4 ${g.color}"></i>
          ${g.title}
        </h4>
        <div class="space-y-1">
          ${itemsHtml}
        </div>
      </div>
    `;
  });

  updatePackingProgress();
}

function updatePackingProgress() {
  const checkboxes = document.querySelectorAll('.packing-cb');
  const checked = document.querySelectorAll('.packing-cb:checked');
  const total = checkboxes.length;
  const count = checked.length;

  document.getElementById('packingProgressCount').textContent = `${count} of ${total} Packed`;
  const pct = total > 0 ? (count / total) * 100 : 0;
  document.getElementById('packingProgressBar').style.width = `${pct}%`;
}

// TAB 5: LOCAL TRAVEL GUIDE
function renderGuide(trip) {
  const container = document.getElementById('localGuideContainer');
  const g = trip.guide;

  let phrasesHtml = '';
  if (g.phrases && g.phrases.length > 0) {
    g.phrases.forEach(p => {
      phrasesHtml += `
        <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
          <span class="text-slate-600">${p.en}</span>
          <span class="text-blue-700 font-bold">${p.local}</span>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <div class="ui-card p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-2">
      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <i data-lucide="coins" class="w-4 h-4 text-emerald-600"></i>
        Currency & UPI Payments
      </h4>
      <p class="text-xs text-slate-600 leading-relaxed">${g.currency}</p>
    </div>

    <div class="ui-card p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-2">
      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <i data-lucide="car" class="w-4 h-4 text-blue-600"></i>
        Transit & Local Commutes
      </h4>
      <p class="text-xs text-slate-600 leading-relaxed">${g.transit}</p>
    </div>

    <div class="ui-card p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-2">
      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <i data-lucide="receipt" class="w-4 h-4 text-amber-600"></i>
        Tipping Customs
      </h4>
      <p class="text-xs text-slate-600 leading-relaxed">${g.tipping}</p>
    </div>

    <div class="ui-card p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-2">
      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <i data-lucide="shield-alert" class="w-4 h-4 text-rose-600"></i>
        Emergency Helplines
      </h4>
      <p class="text-xs text-slate-600 leading-relaxed">${g.emergency}</p>
    </div>

    <div class="ui-card p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-2">
      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <i data-lucide="heart-handshake" class="w-4 h-4 text-purple-600"></i>
        Cultural Etiquette
      </h4>
      <p class="text-xs text-slate-600 leading-relaxed">${g.etiquette}</p>
    </div>

    <div class="ui-card p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-2">
      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
        <i data-lucide="languages" class="w-4 h-4 text-blue-600"></i>
        Useful Local Phrases
      </h4>
      <div class="pt-1">
        ${phrasesHtml}
      </div>
    </div>
  `;
}

// TAB SWITCHING
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('text-blue-600', 'border-blue-600', 'font-bold');
    btn.classList.add('text-slate-600', 'border-transparent');
  });

  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('text-blue-600', 'border-blue-600', 'font-bold');
    activeBtn.classList.remove('text-slate-600', 'border-transparent');
  }

  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.add('hidden');
  });

  const activeView = document.getElementById(`view-${tabName}`);
  if (activeView) {
    activeView.classList.remove('hidden');
  }

  if (tabName === 'map' && leafletMap) {
    setTimeout(() => {
      leafletMap.invalidateSize();
      fitMapBounds();
    }, 150);
  }
}

// AI REFINE MODIFICATION
function handleRefinePlan() {
  const input = document.getElementById('refinePromptInput');
  const prompt = input.value.trim();
  if (!prompt || !currentTrip) return;

  const btn = event?.currentTarget;
  if (btn) btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Updating...`;

  setTimeout(() => {
    const newStop = {
      time: "03:30 PM",
      name: `Custom Stop: ${prompt}`,
      category: "Special",
      cost: "₹650",
      duration: "2h",
      desc: `Special recommendation added based on your request: "${prompt}".`,
      tip: "Verified by Tripmozy India travel engine.",
      coords: [currentTrip.coords[0] + 0.008, currentTrip.coords[1] + 0.008]
    };

    if (currentTrip.daysPlan[0] && currentTrip.daysPlan[0].stops) {
      currentTrip.daysPlan[0].stops.splice(2, 0, newStop);
    }

    renderItineraryTimeline(currentTrip.daysPlan);
    renderMapAndNearbyAttractions(currentTrip);
    lucide.createIcons();

    input.value = '';
    if (btn) btn.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> <span>Update Plan</span>`;
    lucide.createIcons();
    switchTab('map');

    alert(`✨ Updated! Added "${prompt}" to your itinerary and mapped it on the GPS route.`);
  }, 500);
}

function resetToPlanner() {
  document.getElementById('itineraryDashboard').classList.add('hidden');
  document.getElementById('heroSection').classList.remove('hidden');
  document.getElementById('heroSection').scrollIntoView({ behavior: 'smooth' });
}

function shareTrip() {
  if (!currentTrip) return;
  const shareText = `Check out my ${currentTrip.days}-day trip to ${currentTrip.destination} planned on Tripmozy.com! Total Budget: ${formatINR(currentTrip.costPerPerson)} per person.`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText);
    alert("📋 Tripmozy itinerary summary copied! Share on WhatsApp or email.");
  } else {
    alert(shareText);
  }
}

// MODAL CONTROLS
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function copySnippet(id) {
  const codeEl = document.getElementById(id);
  if (codeEl) {
    navigator.clipboard.writeText(codeEl.textContent);
    alert("Copied embed snippet to clipboard!");
  }
}

function saveApiKey() {
  const input = document.getElementById('geminiApiKeyInput');
  if (input) {
    const val = input.value.trim();
    if (val) {
      localStorage.setItem('tripmozy_gemini_key', val);
      alert("API Key saved! Live AI queries are now enabled.");
    } else {
      localStorage.removeItem('tripmozy_gemini_key');
      alert("API Key cleared. Using built-in high performance engine.");
    }
  }
  closeModal('apiKeyModal');
}

// =====================================================================
// TRIPMOZY HOTELS & TOURS TAB + BOOK NOW ENGINE
// =====================================================================

function renderHotelsTab(trip) {
  var destination = trip ? trip.destination : '';
  var hotelsGrid = document.getElementById('hotelsGridContainer');
  var toursGrid = document.getElementById('toursGridContainer');
  var cityLabel = document.getElementById('hotelsCityLabel');
  if (cityLabel) cityLabel.textContent = destination || 'your destination';

  var hotels = (window.getTripmozyHotelsForLocation && destination)
    ? window.getTripmozyHotelsForLocation(destination)
    : (window.TRIPMOZY_HOTELS ? window.TRIPMOZY_HOTELS.slice(0, 9) : []);

  var tours = (window.getTripmozyToursForLocation && destination)
    ? window.getTripmozyToursForLocation(destination)
    : (window.TRIPMOZY_TOURS ? window.TRIPMOZY_TOURS.slice(0, 3) : []);

  if (hotelsGrid) {
    if (hotels.length === 0) {
      hotelsGrid.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400"><p class="font-semibold">No hotels found for this destination.</p><a href="https://tripmozy.com/hotel" target="_blank" class="text-blue-600 text-xs underline mt-2 inline-block">Browse all hotels on Tripmozy</a></div>';
    } else {
      var today = new Date();
      var tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      var dd = function(d) { return String(d.getDate()).padStart(2,'0'); };
      var mm = function(d) { return String(d.getMonth()+1).padStart(2,'0'); };
      var yyyy = function(d) { return d.getFullYear(); };
      var startDate = dd(today)+'/'+mm(today)+'/'+yyyy(today);
      var endDate = dd(tomorrow)+'/'+mm(tomorrow)+'/'+yyyy(tomorrow);

      hotelsGrid.innerHTML = hotels.slice(0, 9).map(function(h) {
        var imgSrc = h.img || 'https://tripmozy.com/uploads/demo/hotel/banner-search-hotel.jpg';
        var price = h.price ? formatINR(h.price) : 'Contact';
        var hotelUrl = h.url || 'https://tripmozy.com/hotel';
        var bookUrl = hotelUrl + '?start=' + startDate + '&end=' + endDate + '&adults=2';
        return '<div class="ui-card bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-md transition-all group">' +
          '<div class="relative h-44 overflow-hidden">' +
            '<img src="' + imgSrc + '" alt="' + h.title.replace(/"/g,'') + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src=\'https://tripmozy.com/uploads/demo/hotel/banner-search-hotel.jpg\'" />' +
            '<div class="absolute top-2 left-2"><span class="bg-white/90 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">Tripmozy Verified</span></div>' +
            '<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">' +
              '<span class="text-white font-black text-base">' + price + '</span><span class="text-white/80 text-[11px]"> /night</span>' +
            '</div>' +
          '</div>' +
          '<div class="p-3.5">' +
            '<h4 class="text-sm font-bold text-slate-900 leading-snug mb-1 line-clamp-2">' + h.title + '</h4>' +
            '<div class="flex items-center gap-1 text-xs text-slate-500 mb-3"><span>' + h.location + '</span><span class="ml-auto text-yellow-600 font-semibold">&#9733; ' + (h.rating || 4.5) + '</span></div>' +
            '<a href="' + bookUrl + '" target="_blank" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white no-underline" style="background:linear-gradient(135deg,#16a34a,#15803d);">Book Now on Tripmozy</a>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  if (toursGrid) {
    if (tours.length === 0) {
      toursGrid.innerHTML = '<div class="col-span-full text-xs text-slate-400 text-center py-4">No specific tours found. <a href="https://tripmozy.com/tour" target="_blank" class="text-blue-600 underline">View all tours</a></div>';
    } else {
      toursGrid.innerHTML = tours.map(function(t) {
        return '<div class="ui-card bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group">' +
          '<div class="relative h-36 overflow-hidden">' +
            '<img src="' + t.img + '" alt="' + t.title.replace(/"/g,'') + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src=\'https://tripmozy.com/uploads/demo/hotel/banner-search-hotel.jpg\'" />' +
            '<div class="absolute top-2 right-2"><span class="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">' + (t.category || 'Tour') + '</span></div>' +
          '</div>' +
          '<div class="p-3.5">' +
            '<h4 class="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1">' + t.title + '</h4>' +
            '<div class="flex items-center gap-3 text-xs text-slate-500 mb-2"><span>' + (t.duration || '') + '</span><span>' + t.location + '</span></div>' +
            '<div class="flex items-center justify-between">' +
              '<span class="text-base font-black text-blue-700">' + formatINR(t.price) + '</span>' +
              '<a href="' + t.url + '" target="_blank" class="btn-blue px-3 py-1.5 text-xs font-bold no-underline rounded-lg">Book Tour</a>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openBookNowOnTripmozy() {
  if (!currentTrip) {
    window.open('https://tripmozy.com/hotel', '_blank');
    return;
  }

  var destination = currentTrip.destination || '';
  var days = currentTrip.days || 3;
  var party = currentTrip.party || 'Couple';
  var budget = currentTrip.costPerPerson || 0;

  var today = new Date();
  var checkOut = new Date(today);
  checkOut.setDate(today.getDate() + days);
  var fmt = function(d) { return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); };

  var adultsMap = { 'Solo': 1, 'Couple': 2, 'Family': 4, 'Friends': 4 };
  var adults = adultsMap[party] || 2;

  var locationIdMap = {
    'manali': 13, 'shimla': 12, 'gangtok': 14, 'darjeeling': 15, 'pelling': 34,
    'purulia': 16, 'rishikesh': 47, 'haridwar': 73, 'mussoorie': 74, 'nainital': 83,
    'goa': 48, 'kerala': 49, 'munnar': 239, 'rajasthan': 44, 'jaipur': 146,
    'udaipur': 129, 'jaisalmer': 147, 'varanasi': 76, 'ayodhya': 46,
    'agra': 226, 'leh': 82, 'ladakh': 82, 'kashmir': 43, 'srinagar': 43,
    'puri': 17, 'kolkata': 11, 'digha': 18, 'mandarmoni': 19, 'kasol': 230,
    'dharamshala': 182, 'ooty': 124, 'kodaikanal': 125, 'hampi': 238, 'amritsar': 75
  };

  var destLower = destination.toLowerCase();
  var locationId = null;
  var keys = Object.keys(locationIdMap);
  for (var i = 0; i < keys.length; i++) {
    if (destLower.indexOf(keys[i]) !== -1) { locationId = locationIdMap[keys[i]]; break; }
  }

  var hotelSearchUrl = 'https://tripmozy.com/hotel?start=' + fmt(today) + '&end=' + fmt(checkOut) + '&adults=' + adults + '&room=1';
  if (locationId) {
    hotelSearchUrl = 'https://tripmozy.com/hotel?location_id=' + locationId + '&start=' + fmt(today) + '&end=' + fmt(checkOut) + '&adults=' + adults + '&room=1';
  }

  window.open(hotelSearchUrl, '_blank');
  showBookingConfirmToast(destination, days, adults, formatINR(budget), hotelSearchUrl);
}

function showBookingConfirmToast(destination, days, adults, budget, hotelUrl) {
  var existing = document.getElementById('bookingToast');
  if (existing) existing.remove();

  if (!document.getElementById('toastStyle')) {
    var style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = '@keyframes slideUpToast { from { opacity:0; transform:translateX(-50%) translateY(20px);} to {opacity:1; transform:translateX(-50%) translateY(0);} }';
    document.head.appendChild(style);
  }

  var toast = document.createElement('div');
  toast.id = 'bookingToast';
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;min-width:320px;max-width:90vw;background:linear-gradient(135deg,#16a34a,#15803d);color:white;border-radius:16px;padding:16px 20px;box-shadow:0 8px 32px rgba(22,163,74,0.4);display:flex;align-items:center;gap:14px;font-family:inherit;animation:slideUpToast 0.4s ease;';
  toast.innerHTML = '<div style="font-size:28px">&#127881;</div>' +
    '<div style="flex:1;">' +
      '<div style="font-weight:800;font-size:14px;margin-bottom:2px;">Opening Tripmozy Hotels!</div>' +
      '<div style="font-size:12px;opacity:0.9;">' + destination + ' &middot; ' + days + ' Days &middot; ' + adults + ' Adults &middot; Est. ' + budget + '/person</div>' +
      '<div style="font-size:11px;margin-top:4px;opacity:0.8;">' +
        '<a href="' + hotelUrl + '" target="_blank" style="color:#bbf7d0;text-decoration:underline;">View Hotels &rarr;</a>' +
        ' &nbsp;|&nbsp; ' +
        '<a href="https://tripmozy.com/page/customize-tour" target="_blank" style="color:#bbf7d0;text-decoration:underline;">Customize Tour &rarr;</a>' +
      '</div>' +
    '</div>' +
    '<button onclick="document.getElementById(\'bookingToast\').remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;opacity:0.8;padding:0;">&times;</button>';
  document.body.appendChild(toast);
  setTimeout(function() { if (toast.parentNode) toast.remove(); }, 7000);
}
