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
  },

  darjeeling: {
    destination: "Darjeeling, West Bengal",
    days: 4,
    title: "Queen of the Hills & Kanchenjunga Vistas: 4 Days in Darjeeling",
    subtitle: "From early morning golden sunrise over Mt. Kanchenjunga at Tiger Hill to heritage tea estates, colonial architecture, and Himalayan mountain railways.",
    party: "Family",
    budgetTier: "Moderate",
    costPerPerson: 16500,
    currency: "INR (₹)",
    coords: [27.0410, 88.2663], // Chowrasta Mall Road
    nearbyAttractions: [
      { name: "Tiger Hill Sunrise Viewpoint", category: "Scenic", coords: [26.9944, 88.2861], desc: "Iconic mountain peak providing panoramic 360-degree views of Mt. Everest and the Kanchenjunga range bathed in dawn light.", tip: "Depart hotel by 4:00 AM; carry thermal caps and gloves." },
      { name: "Batasia Loop & Gorkha War Memorial", category: "Heritage", coords: [27.0169, 88.2494], desc: "Spiral railway loop of the Darjeeling Himalayan Railway landscaped with flowering gardens and panoramic views.", tip: "Listen for the whistling steam locomotive as it rounds the loop." },
      { name: "Ghoom Monastery (Yiga Choeling)", category: "Temple", coords: [27.0108, 88.2547], desc: "Built in 1850, housing a magnificent 15-foot statue of Maitreya Buddha and sacred Tibetan manuscripts.", tip: "Quiet contemplation; take off footwear before entering the prayer hall." },
      { name: "Happy Valley Tea Estate & Factory", category: "Nature", coords: [27.0528, 88.2625], desc: "One of Darjeeling's oldest estates producing world-famous Muscatel black tea on terraced mountain slopes.", tip: "Take the guided tea-tasting tour to taste First Flush vs Second Flush." },
      { name: "Himalayan Mountaineering Institute & Zoo", category: "Culture", coords: [27.0583, 88.2708], desc: "Founded by Tenzing Norgay; zoo preserves rare Red Pandas, Snow Leopards, and Himalayan Black Bears.", tip: "Closed on Thursdays; allow at least 2.5 hours." },
      { name: "Japanese Peace Pagoda & Temple", category: "Spiritual", coords: [27.0305, 88.2611], desc: "Pristine white pagoda built by Buddhist monk Nichidatsu Fujii showcasing four avatars of Lord Buddha.", tip: "Attend the resonant 4:30 PM drum prayer chant." },
      { name: "Chowrasta Mall Road & Glenary's Bakery", category: "Dining", coords: [27.0430, 88.2670], desc: "Pedestrianized promenade lined with colonial heritage cafes, bookshops, and steaming pots of Darjeeling tea.", tip: "Enjoy breakfast bakery items and chocolate rum balls at Glenary's (Est. 1886)." },
      { name: "Rock Garden & Ganga Maya Park", category: "Nature", coords: [27.0250, 88.2250], desc: "Multi-level terraced garden carved through natural waterfalls and rocky hillsides 10 km down the valley.", tip: "Steep winding drive; hire a skilled local 4x4 cab." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Arrival, Hotel Check-in & Evening Chowrasta Mall",
        overnight: "Darjeeling (Mall Road / Gandhi Road Area)",
        transitSummary: "Siliguri/NJP to Darjeeling: 70 km ~ 3h 15m on scenic Hill Cart Road",
        stops: [
          { time: "12:30 PM", name: "Hotel Check-in & Freshen Up", category: "Stay", cost: "₹0", duration: "1.5h", desc: "Check in to your verified TripMozy partner hotel or heritage homestay with Kanchenjunga valley views.", tip: "Hot ginger tea and Darjeeling momos served on arrival." },
          { time: "02:30 PM", name: "Keventer's Colonial Rooftop Lunch", category: "Dining", cost: "₹550", duration: "1.5h", desc: "Iconic colonial open-air terrace famous for full English breakfast, meat platters, and hot Darjeeling First Flush tea.", tip: "Terrace seats provide uninterrupted valley panoramas." },
          { time: "04:30 PM", name: "Chowrasta Mall & Heritage Stroll", category: "Relaxation", cost: "₹0", duration: "2h", desc: "Stroll along the vehicle-free promenade, watch local artists, and browse Oxford Book & Stationery.", tip: "Sit on the green benches to watch sunset clouds roll across the valley." },
          { time: "07:30 PM", name: "Glenary's Bakery & Pub Dinner", category: "Dining", cost: "₹750", duration: "2h", desc: "Live acoustic Western and Nepali folk music, wood-fired sizzlers, and freshly baked pastries.", tip: "Try the warm apple pie with vanilla custard." }
        ]
      },
      {
        day: 2,
        title: "Day 2: Tiger Hill Dawn Sunrise, Batasia Loop & Monastery",
        overnight: "Darjeeling",
        transitSummary: "Local Mountain Transit: 28 km ~ 1h 20m in shared/private cab",
        stops: [
          { time: "04:15 AM", name: "Tiger Hill Sunrise over Mt. Kanchenjunga", category: "Scenic", cost: "₹50", duration: "2h", desc: "Watch the snow peaks of the third highest mountain in the world ignite with pink, crimson, and golden light.", tip: "Dress in heavy warm woolens; winter dawn temperatures drop near freezing.", coords: [26.9944, 88.2861] },
          { time: "07:30 AM", name: "Batasia Loop & Toy Train Track", category: "Heritage", cost: "₹30", duration: "1h", desc: "Engineering marvel where the narrow-gauge train loops around a manicured war memorial garden.", tip: "Great panorama photography point.", coords: [27.0169, 88.2494] },
          { time: "09:00 AM", name: "Ghoom Monastery (Yiga Choeling)", category: "Spiritual", cost: "₹0", duration: "1h", desc: "Ancient Gelugpa Tibetan Buddhist monastery with brass prayer wheels and butter lamps.", tip: "Rotate prayer wheels clockwise.", coords: [27.0108, 88.2547] },
          { time: "11:30 AM", name: "Hotel Rest & Warm Mountain Brunch", category: "Relaxation", cost: "₹400", duration: "2h", desc: "Return to hotel for a relaxing hot bath, rest, and steaming noodle thukpa after the early dawn wake-up.", tip: "Essential rest window before afternoon sightseeing." },
          { time: "02:30 PM", name: "Japanese Peace Pagoda & Temple", category: "Culture", cost: "₹0", duration: "2h", desc: "Tranquil hillside pagoda surrounded by pine and cedar trees radiating messages of universal peace.", tip: "Quiet zone; serene mountain reflections.", coords: [27.0305, 88.2611] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Tea Estates, Red Pandas & Mountaineering History",
        overnight: "Darjeeling",
        transitSummary: "Local City Circuit: 18 km ~ 50m",
        stops: [
          { time: "09:00 AM", name: "Himalayan Mountaineering Institute & Zoo", category: "Heritage", cost: "₹120", duration: "2.5h", desc: "Museum displaying historic Everest expedition artifacts alongside red pandas and snow leopards.", tip: "Notice: Zoo is closed on Thursdays.", coords: [27.0583, 88.2708] },
          { time: "12:30 PM", name: "Hot Tibetan Lunch at Kunga / Dekevas", category: "Dining", cost: "₹450", duration: "1.5h", desc: "Famous cozy family-run joint serving steamed shaphale, hot wonton soup, and Tingmo bread.", tip: "Small seating capacity; arrive promptly at 12:30 PM." },
          { time: "02:30 PM", name: "Happy Valley Tea Estate Guided Tour", category: "Nature", cost: "₹100", duration: "2h", desc: "Walk between lush tea bushes, learn the orthodox tea processing method, and taste freshly brewed tea.", tip: "Purchase genuine First Flush single-estate tea directly from the factory outlet.", coords: [27.0528, 88.2625] },
          { time: "05:30 PM", name: "Mall Bazaar Souvenir Shopping", category: "Shopping", cost: "₹800", duration: "2h", desc: "Shop for hand-knit woolens, Darjeeling CTC & orthodox tea, brass singing bowls, and prayer flags.", tip: "Look for the green Darjeeling Tea logo for genuine tea quality." }
        ]
      },
      {
        day: 4,
        title: "Day 4: Morning Tea Garden Stroll, Check-out & Departure",
        overnight: "Departure to Siliguri/Bagdogra",
        transitSummary: "Darjeeling to Siliguri/Bagdogra Airport: 72 km ~ 3h 30m downhill",
        stops: [
          { time: "08:30 AM", name: "Nathmulls Tea Tasting Lounge", category: "Dining", cost: "₹300", duration: "1.5h", desc: "Sample rare silver needle white tea and organic Muscatel varieties prepared by certified tea masters.", tip: "Ask for vacuum-packed gift caddies for flights." },
          { time: "10:30 AM", name: "Hotel Check-out & Luggage Load", category: "Stay", cost: "₹0", duration: "1h", desc: "Complete hotel checkout and meet your TripMozy private cab driver for departure transfer.", tip: "Keep your camera accessible for roadside valley viewpoints." },
          { time: "12:00 PM", name: "Mirik Lake & Tea Valley Scenic Drive", category: "Scenic", cost: "₹100", duration: "2h", desc: "Optional scenic detour via Mirik Lake bordered by cryptomeria pine trees and cardamom groves.", tip: "Horse riding and footbridge walks over the lake." }
        ]
      }
    ],
    budgetBreakdown: { stay: 7200, food: 4400, activities: 2100, transport: 2200, shopping: 600 },
    packingList: {
      essentials: ["Govt ID / Aadhaar", "Cash for roadside tea stalls", "Voucher copy"],
      clothing: ["Woolen sweaters & fleece jacket", "Thermal innerwear (Oct-March)", "Comfortable walking sneakers"],
      gear: ["Power bank", "Compact umbrella (hill showers are sudden)", "Moisturizer / Lip balm"],
      health: ["Motion sickness pills for winding hill roads", "Paracetamol & Band-aids"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). UPI accepted widely; keep ₹1,500 cash for Tiger Hill entry and drivers.",
      transit: "Pre-booked 4x4 private cabs (Innova / Sumo Gold) are the most reliable on Darjeeling's steep slopes.",
      tipping: "7-10% in cafes; ₹300-₹500 daily tip for cab driver.",
      emergency: "Darjeeling Sadar Police: 0354-2254422 | Tourism Helpline: 0354-2255351 | Ambulance: 108.",
      etiquette: "Never pluck tea leaves without permission. Walk around monasteries and stupas clockwise.",
      phrases: [
        { en: "Greetings", local: "Namaste / Tashi Delek" },
        { en: "How much is this tea?", local: "Yeh chai kitne ki hai?" },
        { en: "Thank you", local: "Dhanyavaad" }
      ]
    }
  },

  sikkim: {
    destination: "Gangtok & East Sikkim",
    days: 4,
    title: "Glacial Lakes & Monasteries: 4 Days in Gangtok, Sikkim",
    subtitle: "From high-altitude Tsomgo Glacial Lake and Baba Mandir to sacred Rumtek Monastery and vibrant pedestrianized MG Marg.",
    party: "Family",
    budgetTier: "Moderate",
    costPerPerson: 18500,
    currency: "INR (₹)",
    coords: [27.3389, 88.6065], // MG Marg Gangtok
    nearbyAttractions: [
      { name: "Tsomgo (Changu) Glacial Lake", category: "Scenic", coords: [27.3742, 88.7619], desc: "Sacred oval alpine lake situated at 12,310 ft elevation reflecting towering snow peaks.", tip: "Requires Restricted Area Permit (PAP). Ride colorfully decorated local yaks around the shore." },
      { name: "Baba Harbhajan Singh Mandir", category: "Heritage", coords: [27.3917, 88.8250], desc: "Unique high-altitude military memorial temple dedicated to an Indian Army soldier at 13,123 ft.", tip: "Temperature drops below 5°C even in summer; warm jackets essential." },
      { name: "Rumtek Dharma Chakra Centre", category: "Spiritual", coords: [27.3039, 88.5478], desc: "Seat of the Karmapa Lama; largest monastery in Sikkim filled with sacred murals and golden stupas.", tip: "Carry original Govt photo ID for entry through security checkpoints." },
      { name: "Nathula Pass (Indo-China Border)", category: "Scenic", coords: [27.3865, 88.8310], desc: "Historic Silk Route mountain pass connecting India and Tibet at 14,140 ft altitude.", tip: "NOTICE: Strictly closed on Mondays & Tuesdays. Only Indian citizens with prior permits allowed." },
      { name: "MG Marg Pedestrian Boulevard", category: "Shopping", coords: [27.3314, 88.6138], desc: "Clean, vehicle-free European-style cobblestone street lined with Tibetan cafes, bakeries, and state craft emporiums.", tip: "Spit-free and litter-free eco zone with active fines." },
      { name: "Ban Jhakri Falls & Energy Park", category: "Nature", coords: [27.3600, 88.6000], desc: "100-foot cascading waterfall set within a forested shamanistic cultural theme park.", tip: "Great for families with children." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Arrival in Gangtok & Evening MG Marg Promenade",
        overnight: "Gangtok",
        transitSummary: "Siliguri/Bagdogra to Gangtok: 115 km ~ 4h 30m along the roaring Teesta River",
        stops: [
          { time: "01:00 PM", name: "Hotel Check-in & Freshen Up", category: "Stay", cost: "₹0", duration: "1.5h", desc: "Check in to your TripMozy partner hotel overlooking the lush green Ranipool valley.", tip: "Hand over passport photos & Aadhaar copies to your driver for next day's Tsomgo permit." },
          { time: "03:30 PM", name: "Enchey Monastery Peaceful Stroll", category: "Spiritual", cost: "₹0", duration: "1.5h", desc: "200-year-old Nyingma monastery perched on a forested ridge blessed by Lama Druptob Karpo.", tip: "Surrounded by fluttering colorful prayer flags.", coords: [27.3450, 88.6200] },
          { time: "05:30 PM", name: "MG Marg Evening Stroll & Shopping", category: "Shopping", cost: "₹500", duration: "2.5h", desc: "Enjoy vehicle-free pedestrian boulevard, shop Sikkimese black cardamom, and try hot momos at The Roll House.", tip: "Taste authentic Tibetan Tingmo and shaphale at Taste of Tibet.", coords: [27.3314, 88.6138] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Alpine Excursion to Tsomgo Lake & Baba Mandir (13,100 ft)",
        overnight: "Gangtok",
        transitSummary: "Mountain Highway: 80 km round-trip ~ 3h 30m in rugged 4x4 cab",
        stops: [
          { time: "08:00 AM", name: "Permit Check & Ascent to Tsomgo Glacial Lake", category: "Scenic", cost: "₹250", duration: "3h", desc: "Drive up the high alpine military highway to the crystal turquoise sacred lake at 12,310 ft.", tip: "Rent warm coats and snow boots at the Kyongnosla mountain checkpoint.", coords: [27.3742, 88.7619] },
          { time: "12:00 PM", name: "Baba Harbhajan Singh Memorial Temple", category: "Heritage", cost: "₹0", duration: "1.5h", desc: "Visit the revered high-altitude temple honoring the soldier guardian of the Nathula frontier.", tip: "Army canteen serves hot Maggi and complimentary sweet tea.", coords: [27.3917, 88.8250] },
          { time: "03:30 PM", name: "Return to Gangtok & Relaxation", category: "Relaxation", cost: "₹0", duration: "2h", desc: "Descend back to Gangtok; rest and acclimate after high altitude excursion.", tip: "Drink plenty of warm water to prevent altitude fatigue." }
        ]
      },
      {
        day: 3,
        title: "Day 3: Sacred Rumtek Monastery & Ban Jhakri Waterfalls",
        overnight: "Gangtok",
        transitSummary: "Local Sightseeing Circuit: 45 km ~ 2h 15m",
        stops: [
          { time: "09:30 AM", name: "Rumtek Dharma Chakra Centre", category: "Spiritual", cost: "₹50", duration: "2.5h", desc: "Majestic Tibetan monastery housing sacred relics, gold-plated stupas, and young monk chanting halls.", tip: "Carry original Govt photo ID for entry security.", coords: [27.3039, 88.5478] },
          { time: "01:00 PM", name: "Nimtho Restaurant Traditional Sikkimese Lunch", category: "Dining", cost: "₹650", duration: "1.5h", desc: "Organic Sikkimese feast featuring Gundruk soup, wild fern saag, and millet momos.", tip: "Authentic local culinary experience on MG Marg." },
          { time: "03:00 PM", name: "Ban Jhakri Falls & Shamanistic Garden", category: "Nature", cost: "₹50", duration: "2h", desc: "Cascading 100-foot waterfall set in landscaped gardens depicting ancestral mountain healers.", tip: "Boating lake and bridges for photos.", coords: [27.3600, 88.6000] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Flower Exhibition, Ropeway & Departure",
        overnight: "Departure via Siliguri / NJP",
        transitSummary: "Gangtok to NJP / Bagdogra: 115 km ~ 4h 30m",
        stops: [
          { time: "09:00 AM", name: "Gangtok Cable Car Ropeway", category: "Adventure", cost: "₹150", duration: "1h", desc: "Bi-cable passenger ropeway gliding over Gangtok town with aerial views of Mt. Kanchenjunga.", tip: "Board at Deorali station early to avoid waiting." },
          { time: "10:30 AM", name: "Directorate of Handicrafts & Handloom", category: "Shopping", cost: "₹500", duration: "1.5h", desc: "See skilled artisans weave Lepcha wool carpets, carved Choktse tables, and thankas.", tip: "Fixed government prices with quality guarantee." },
          { time: "12:30 PM", name: "Hotel Check-out & Return Journey", category: "Stay", cost: "₹0", duration: "1h", desc: "Check out and commence comfortable transfer to NJP Railway Station / Bagdogra Airport.", tip: "Plan extra 1 hour buffer during monsoon months." }
        ]
      }
    ],
    budgetBreakdown: { stay: 8400, food: 5200, activities: 2400, transport: 2000, shopping: 500 },
    packingList: {
      essentials: ["Govt ID / Voter Card / Passport (Aadhaar not accepted for Nathula pass)", "4 Passport Photos for permits", "Permit fee cash"],
      clothing: ["Thermal layer top & bottom", "Windproof winter jacket", "Warm woolen cap & gloves"],
      gear: ["Power bank", "UV sunglasses for alpine snow glare", "Sturdy walking boots"],
      health: ["Diamox (for altitude acclimatization)", "Motion sickness pills", "Lip balm"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). UPI works in Gangtok; carry ₹2,000 cash for high-altitude Tsomgo points.",
      transit: "Only Sikkim-registered commercial 4x4 vehicles (Innova, Scorpio, Bolero) permitted to Tsomgo Lake.",
      tipping: "10% in restaurants; ₹300-₹500/day for high-altitude mountain drivers.",
      emergency: "Sikkim Tourist Police: 03592-202022 | Emergency Helpline: 112 | STNM Hospital Gangtok: 03592-202944.",
      etiquette: "Dress conservatively at monasteries. Do not photograph inside sanctum sanctorums without permission.",
      phrases: [
        { en: "Hello", local: "Kuzoozangpo / Namaste" },
        { en: "Thank you", local: "Kadrinchhe / Dhanyavaad" }
      ]
    }
  },

  meghalaya: {
    destination: "Shillong & Cherrapunji, Meghalaya",
    days: 4,
    title: "Abode of Clouds & Crystal Waters: 4 Days in Meghalaya",
    subtitle: "From roaring Nohkalikai Falls and limestone Mawsmai caves in Cherrapunji to crystal clear Dawki river and cleanest village Mawlynnong.",
    party: "Family",
    budgetTier: "Moderate",
    costPerPerson: 19500,
    currency: "INR (₹)",
    coords: [25.5788, 91.8933], // Police Bazar Shillong
    nearbyAttractions: [
      { name: "Nohkalikai Falls (Tallest Plunge Waterfall)", category: "Scenic", coords: [25.2756, 91.6917], desc: "India's tallest plunge waterfall (1,115 ft) cascading from a verdant cliff into a turquoise pool.", tip: "Best photography light between 10 AM and 2 PM before mist rises." },
      { name: "Mawsmai Limestone Caves", category: "Adventure", coords: [25.2444, 91.7167], desc: "Natural subterranean limestone cave system illuminated with internal lights, stalactites and stalagmites.", tip: "Wear shoes with rubber grip; cave floor has shallow flowing water." },
      { name: "Dawki Umngot River Boating", category: "Scenic", coords: [25.1850, 92.0150], desc: "World-famous transparent river where wooden country boats appear to float on pure air above the riverbed.", tip: "Best crystal clarity from November to April." },
      { name: "Mawlynnong Cleanest Village", category: "Culture", coords: [25.2010, 91.9160], desc: "Recognized as Asia's cleanest village with bamboo dustbins at every corner, orchids, and a Single Decker Root Bridge nearby in Riwai.", tip: "Walk through the blooming treehouse viewpoint overlooking Bangladesh plains." },
      { name: "Umiam (Barapani) Lake", category: "Nature", coords: [25.6667, 91.8944], desc: "Sprawling sapphire highland water reservoir framed by lush coniferous pine hills outside Shillong.", tip: "Speedboat and water scooter rides available at the water sports complex." },
      { name: "Elephant Falls & Shillong Peak", category: "Nature", coords: [25.5361, 91.8250], desc: "Three-tiered mountain stream flowing over dark fern-covered rocks named by British officers.", tip: "Easy paved walkway with railings suitable for all ages." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Guwahati to Shillong via Scenic Umiam Lake",
        overnight: "Shillong (Police Bazar / Laitumkhrah)",
        transitSummary: "Guwahati Airport to Shillong: 100 km ~ 3h on smooth 4-lane highway",
        stops: [
          { time: "11:30 AM", name: "Umiam Lake Viewpoint & Water Sports", category: "Scenic", cost: "₹300", duration: "1.5h", desc: "Stop at the breathtaking highland reservoir for mountain lake breeze and boat ride.", tip: "Try hot roasted corn with lemon chili by the lake.", coords: [25.6667, 91.8944] },
          { time: "01:30 PM", name: "Hotel Check-in & Traditional Khasi Lunch", category: "Dining", cost: "₹500", duration: "1.5h", desc: "Enjoy Jadoh rice with aromatic herbs and local bamboo shoot delicacies in Shillong.", tip: "Trattoria in Police Bazar is famous for authentic Khasi cuisine." },
          { time: "04:30 PM", name: "Ward's Lake & Botanical Stroll", category: "Nature", cost: "₹50", duration: "2h", desc: "Horseshoe-shaped colonial lake with wooden footbridge, lotus beds, and paddle boating.", tip: "Feed colorful Japanese koi fish from the bridge." },
          { time: "07:00 PM", name: "Police Bazar Evening Cafes & Rock Music", category: "Relaxation", cost: "₹450", duration: "2h", desc: "Shillong is India's rock music capital; visit Dylan's Cafe or Cafe Shillong for live music and hot coffee.", tip: "Lively shopping street for Scottish woolens and bamboo crafts." }
        ]
      },
      {
        day: 2,
        title: "Day 2: Cherrapunji (Sohra) Waterfalls & Limestone Caves",
        overnight: "Cherrapunji (Sohra)",
        transitSummary: "Shillong to Cherrapunji: 55 km ~ 2h along dramatic misty gorge ridges",
        stops: [
          { time: "08:30 AM", name: "Elephant Falls Three-Tier Cascades", category: "Nature", cost: "₹30", duration: "1.5h", desc: "Walk down wooden steps alongside three cascading mountain torrents.", tip: "Morning light provides misty rainbow photo opportunities.", coords: [25.5361, 91.8250] },
          { time: "11:30 AM", name: "Mawkdok Dympep Valley Viewpoint", category: "Scenic", cost: "₹50", duration: "1h", desc: "Dramatic iron bridge crossing a sheer green mountain chasm; optional mountain zipline.", tip: "Zip across the 2,600 ft canyon if you love adventure." },
          { time: "01:30 PM", name: "Nohkalikai Falls & Cliff View Lunch", category: "Scenic", cost: "₹450", duration: "2h", desc: "India's highest plunge waterfall plummeting into an emerald pool.", tip: "Buy local cinnamon, bay leaves, and pure wild honey from Khasi village stalls.", coords: [25.2756, 91.6917] },
          { time: "04:00 PM", name: "Mawsmai Cave Spelunking", category: "Adventure", cost: "₹50", duration: "1.5h", desc: "Explore prehistoric limestone cave passages with natural calcite rock formations.", tip: "Safe illuminated trail; duck slightly in narrow squeeze spots.", coords: [25.2444, 91.7167] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Crystal Clear Dawki River & Mawlynnong Cleanest Village",
        overnight: "Shillong",
        transitSummary: "Cherrapunji to Dawki & Mawlynnong: 95 km ~ 3h 15m",
        stops: [
          { time: "09:00 AM", name: "Dawki Umngot River Transparent Boating", category: "Scenic", cost: "₹800", duration: "2h", desc: "Glide on water so transparent that your boat appears suspended mid-air above smooth river pebbles.", tip: "Hire a private country wooden boat for a tranquil row to the gorge.", coords: [25.1850, 92.0150] },
          { time: "12:30 PM", name: "India-Bangladesh Tamabil Border Checkpost", category: "Culture", cost: "₹0", duration: "45m", desc: "Friendly international border post where travelers photograph the historic boundary markers.", tip: "Respect security guidelines and border guards." },
          { time: "02:00 PM", name: "Mawlynnong Village Traditional Lunch", category: "Dining", cost: "₹400", duration: "1.5h", desc: "Home-cooked Khasi chicken, lentils, and fresh organic garden vegetables served in a floral village home.", tip: "Village is 100% plastic-free." },
          { time: "03:30 PM", name: "Riwai Single-Decker Living Root Bridge", category: "Nature", cost: "₹40", duration: "1.5h", desc: "Ancient bridge grown over centuries by training Ficus elastica tree roots across a boulder river.", tip: "Short 10-minute stone walk from village car park.", coords: [25.2010, 91.9160] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Don Bosco Indigenous Museum & Return Transfer",
        overnight: "Departure to Guwahati Airport / Station",
        transitSummary: "Shillong to Guwahati: 100 km ~ 3h",
        stops: [
          { time: "09:00 AM", name: "Don Bosco Centre for Indigenous Cultures", category: "Culture", cost: "₹100", duration: "2h", desc: "Seven-story hexagonal museum showcasing authentic tribal attire, weapons, and musical instruments of all 8 Northeast states.", tip: "Visit the rooftop skywalk for panoramic views of Shillong." },
          { time: "11:30 AM", name: "Hotel Check-out & Highway Departure Transfer", category: "Stay", cost: "₹0", duration: "1h", desc: "Depart for Guwahati airport with pleasant memories and fresh Meghalaya pineapples.", tip: "Buy sweet honey pineapples at Nongpoh highway stalls." }
        ]
      }
    ],
    budgetBreakdown: { stay: 8600, food: 5400, activities: 2600, transport: 2400, shopping: 500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar", "Cash for Dawki boatmen and village stalls", "Waterproof pouch for mobile"],
      clothing: ["Light cottons + warm fleece jacket (Cherrapunji evenings are cool)", "Raincoat / Umbrella", "Comfortable walking shoes with rubber grip"],
      gear: ["Power bank", "Camera with polarized lens (cuts water glare in Dawki)"],
      health: ["Mosquito repellent cream", "Band-aids", "Motion sickness pills"]
    },
    guide: {
      currency: "Indian Rupees (₹ INR). UPI accepted in Shillong; keep ₹2,500 cash for Dawki boating and village entry.",
      transit: "A dedicated private cab from Guwahati is the most comfortable and reliable way to travel Meghalaya.",
      tipping: "7-10% in cafes; ₹300-₹400/day for driver.",
      emergency: "Meghalaya Police: 112 | Shillong Civil Hospital: 0364-2224100 | Tourism Info: 0364-2226220.",
      etiquette: "Khasi society is matrilineal; show high respect to women elders. Never litter in villages.",
      phrases: [
        { en: "Hello", local: "Khublei" },
        { en: "Thank you", local: "Khublei Shibun" }
      ]
    }
  },

  kashmir: {
    destination: "Srinagar & Kashmir Valley, Jammu & Kashmir",
    days: 5,
    title: "Paradise on Earth: 5 Days in Srinagar, Gulmarg & Pahalgam",
    subtitle: "From Dal Lake Shikara cruises and Mughal terraced gardens to the alpine gondola in Gulmarg and Betaab Valley in Pahalgam.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 22500,
    currency: "INR (₹)",
    coords: [34.0837, 74.7973], // Srinagar Dal Lake
    nearbyAttractions: [
      { name: "Dal Lake Shikara & Char Chinar", category: "Scenic", coords: [34.0837, 74.8373], ticketCost: "₹800", costValue: 800, budgetTier: "premium", desc: "Traditional wooden water taxi ride through floating gardens, lotus blooms, and historic houseboats.", tip: "Take a 2-hour sunset shikara to Char Chinar island for golden photography." },
      { name: "Nishat & Shalimar Mughal Gardens", category: "Heritage", coords: [34.1230, 74.8770], ticketCost: "₹25", costValue: 25, budgetTier: "budget", desc: "17th-century terraced imperial Mughal pleasure gardens overlooking the serene Dal Lake.", tip: "Visit in the afternoon when water fountains are fully active." },
      { name: "Gulmarg Gondola & Apharwat Peak", category: "Adventure", coords: [34.0484, 74.3805], ticketCost: "₹1,050", costValue: 1050, budgetTier: "premium", desc: "World's second highest operating cable car ascending to 3,980 meters in snow peaks.", tip: "Book Phase 1 & Phase 2 tickets 3 weeks ahead on the official portal." },
      { name: "Pahalgam Betaab Valley & Lidder River", category: "Nature", coords: [34.0163, 75.3150], ticketCost: "₹100", costValue: 100, budgetTier: "budget", desc: "Scenic mountain valley surrounded by lush pine meadows and snow-fed Lidder stream.", tip: "Baisaran (Mini Switzerland) pony trek starts from the Pahalgam taxi stand." },
      { name: "Shankaracharya Ancient Shiva Temple", category: "Temple", coords: [34.0720, 74.8450], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Historic 200 BC hilltop stone shrine offering 360-degree panoramic vistas of Srinagar.", tip: "240 stone steps to reach top; mobile phones not permitted inside sanctum." },
      { name: "Aru Valley Wildlife & Pine Sanctuary", category: "Nature", coords: [34.0900, 75.2600], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Quiet eco-village with rolling alpine pastures and base camp for Kolahoi Glacier.", tip: "Local Pahalgam union cab required to visit Aru & Chandanwari." },
      { name: "Lal Chowk & Old City Saffron Bazaar", category: "Shopping", coords: [34.0725, 74.8090], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Vibrant market for pure Kashmiri saffron (Kesar), Pashmina shawls, and walnuts.", tip: "Look for Govt GI-tagged Kashmiri Pashmina and dry fruit cooperatives." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Dal Lake Shikara & Floating Flower Markets",
        overnight: "Overnight in Srinagar Houseboat",
        transitSummary: "Local Srinagar ~ 18 km",
        stops: [
          { time: "09:30 AM", name: "Dal Lake Shikara & Char Chinar", category: "Scenic", cost: "₹800", costValue: 800, duration: "2.5h", desc: "Glide along the jewel of Kashmir through floating vegetable gardens and lotus beds.", tip: "Carry cash for hot saffron kahwa tea sold by lake vendors.", coords: [34.0837, 74.8373] },
          { time: "01:00 PM", name: "Traditional Kashmiri Wazwan Lunch", category: "Dining", cost: "₹750", costValue: 750, duration: "1.5h", desc: "Savor aromatic Rogan Josh, Gushtaba, Rista, and saffron rice.", tip: "Ahdoos on Residency Road is legendary for Wazwan.", coords: [34.0710, 74.8150] },
          { time: "03:30 PM", name: "Shankaracharya Hilltop Temple", category: "Temple", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Climb the stone stairs to the sacred Shiva lingam with bird's-eye valley views.", tip: "Keep valid government photo ID handy at security checkpost.", coords: [34.0720, 74.8450] },
          { time: "06:30 PM", name: "Boulevard Road Sunset Promenade", category: "Relaxation", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Leisure stroll along Dal Lake embankment with glowing snow peaks in background.", tip: "Buy freshly roasted chestnuts and walnuts.", coords: [34.0850, 74.8300] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Imperial Mughal Gardens & Old Srinagar",
        overnight: "Overnight in Srinagar Hotel",
        transitSummary: "Srinagar loop ~ 26 km",
        stops: [
          { time: "09:30 AM", name: "Nishat & Shalimar Mughal Gardens", category: "Heritage", cost: "₹25", costValue: 25, duration: "3h", desc: "Walk through 12 grand terraces of Nishat Bagh built by Asif Khan in 1633.", tip: "Great photography along the central water channel lined with chinar trees.", coords: [34.1230, 74.8770] },
          { time: "01:30 PM", name: "Hazratbal Shrine & Lakeside Trout Cafe", category: "Culture", cost: "₹450", costValue: 450, duration: "1.5h", desc: "White marble domed shrine on northern bank of Dal Lake.", tip: "Dress conservatively covering head.", coords: [34.1280, 74.8420] },
          { time: "04:00 PM", name: "Lal Chowk & Old City Saffron Bazaar", category: "Shopping", cost: "Free Entry", costValue: 0, duration: "2.5h", desc: "Shop for certified Kashmiri saffron, walnut wood carvings, and papier-mâché.", tip: "Saffron strands should turn water golden yellow, not red.", coords: [34.0725, 74.8090] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Gulmarg High Alpine Meadow & Gondola Snow",
        overnight: "Overnight in Gulmarg / Srinagar",
        transitSummary: "Srinagar to Gulmarg ~ 54 km (2h)",
        stops: [
          { time: "09:00 AM", name: "Gulmarg Gondola & Apharwat Peak", category: "Adventure", cost: "₹1,050", costValue: 1050, duration: "3.5h", desc: "Board Phase 1 to Kongdoori and Phase 2 to Apharwat summit snowfields at 3,980m.", tip: "Dress in warm waterproof layers and rent snow boots at Tangmarg.", coords: [34.0484, 74.3805] },
          { time: "01:30 PM", name: "Highland Park Alpine Dining", category: "Dining", cost: "₹650", costValue: 650, duration: "1.5h", desc: "Warm up with hot mutton Yakhni soup, Nadru Yakhni, and naan.", tip: "Warm wooden lounge with fireplace.", coords: [34.0500, 74.3850] },
          { time: "03:30 PM", name: "Strawberry Valley & St. Mary's Church", category: "Nature", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Walk through pine groves to the 100-year-old British stone church on the golf course.", tip: "Ponies or walking are both pleasant options across the meadow.", coords: [34.0450, 74.3900] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Pahalgam Valley of Shepherds & Betaab Valley",
        overnight: "Overnight in Pahalgam",
        transitSummary: "Srinagar to Pahalgam ~ 92 km (2.5h)",
        stops: [
          { time: "09:30 AM", name: "Pahalgam Betaab Valley & Lidder River", category: "Nature", cost: "₹100", costValue: 100, duration: "3h", desc: "Explore the emerald meadows where the Bollywood movie Betaab was filmed.", tip: "Enjoy the cold glacier water flowing from Sheshnag lake.", coords: [34.0163, 75.3150] },
          { time: "01:30 PM", name: "Riverside Dhaba & Kashmiri Trout Fish", category: "Dining", cost: "₹600", costValue: 600, duration: "1.5h", desc: "Freshly caught Himalayan brown trout pan-fried with local butter and herbs.", tip: "Ask for lemon-butter sauce.", coords: [34.0150, 75.3200] },
          { time: "03:30 PM", name: "Baisaran Pine Meadow (Mini Switzerland)", category: "Scenic", cost: "₹250", costValue: 250, duration: "3h", desc: "High mountain clearing surrounded by dense deodar forests with snow peak backdrops.", tip: "Wear shoes with firm rubber traction.", coords: [34.0100, 75.3300] }
        ]
      },
      {
        day: 5,
        title: "Day 5: Aru Eco-Valley & Departure Transfer",
        overnight: "Overnight in Srinagar / Airport",
        transitSummary: "Pahalgam to Srinagar Airport ~ 90 km (2.5h)",
        stops: [
          { time: "09:00 AM", name: "Aru Valley Wildlife & Pine Sanctuary", category: "Nature", cost: "₹50", costValue: 50, duration: "2.5h", desc: "Pristine mountain village nestled amidst wildflower pastures and snow streams.", tip: "Early morning walks offer sightings of Himalayan birds.", coords: [34.0900, 75.2600] },
          { time: "12:30 PM", name: "Avantipur Ancient Ruins & Saffron Fields", category: "Heritage", cost: "₹25", costValue: 25, duration: "1.5h", desc: "9th-century stone temple ruins of King Avantivarman and Pampore saffron fields.", tip: "Pampore has official saffron testing labs on NH44.", coords: [33.9200, 75.0100] },
          { time: "03:30 PM", name: "Srinagar Airport Transfer", category: "Transit", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Arrive 3 hours early at Srinagar International Airport due to mandatory multi-tier security.", tip: "Keep hand baggage light as battery banks must stay in check-in luggage.", coords: [33.9870, 74.7740] }
        ]
      }
    ],
    budgetBreakdown: { stay: 8500, food: 5500, activities: 3500, transport: 3500, shopping: 1500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Cash for pony union & shikara", "Thermal innerwear"],
      clothing: ["Fleece jacket or down parka", "Woolen socks & gloves", "Modest outfits for religious sites"],
      gear: ["Power bank", "UV sunglasses for snow glare", "Sturdy grip trekking boots"],
      health: ["Cold & cough tablets", "Sunscreen SPF 50+", "Moisturizer & lip balm"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI works well in Srinagar; carry cash for Gulmarg & Pahalgam pony rides.",
      transit: "Pre-book a trusted private cab for the entire circuit through Tripmozy for seamless travel.",
      tipping: "₹200-₹300/day for cab driver; ₹100 for shikara boatman.",
      emergency: "Kashmir Tourist Police: 0194-2452224 | Emergency: 112.",
      etiquette: "Dress respectfully at mosques and temples. Always confirm pony rates with union ticket counter.",
      phrases: [{ en: "Hello", local: "Salam Alaikum" }, { en: "Thank you", local: "Shukriya" }]
    }
  },

  jaipur: {
    destination: "Jaipur, Rajasthan",
    days: 4,
    title: "Royal Forts & Pink City Splendors: 4 Days in Jaipur",
    subtitle: "From majestic Amber Fort and Sheesh Mahal to Hawa Mahal, astronomy at Jantar Mantar, and evening celebrations at Chokhi Dhani.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 16500,
    currency: "INR (₹)",
    coords: [26.9124, 75.7873], // Jaipur City Center
    nearbyAttractions: [
      { name: "Amber Fort & Sheesh Mahal", category: "Fort", coords: [26.9855, 75.8513], ticketCost: "₹100", costValue: 100, budgetTier: "budget", desc: "Majestic hilltop fortress overlooking Maota Lake with the world-renowned Hall of Mirrors.", tip: "Hire an official ASI guide at the sun gate entrance." },
      { name: "Hawa Mahal (Palace of Winds)", category: "Heritage", coords: [26.9239, 75.8267], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Five-story pink sandstone palace with 953 honeycomb windows designed for royal court ladies.", tip: "Cross the street to Tattoo Cafe for iconic rooftop photos facing the facade." },
      { name: "City Palace & Chandra Mahal", category: "Heritage", coords: [26.9258, 75.8236], ticketCost: "₹200", costValue: 200, budgetTier: "moderate", desc: "Magnificent royal residence blending Rajput, Mughal, and European architecture.", tip: "Don't miss the Peacock Gate in the inner courtyard." },
      { name: "Jantar Mantar UNESCO Observatory", category: "Heritage", coords: [26.9248, 75.8246], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Astronomical collection of 19 architectural instruments built by Maharaja Sawai Jai Singh II.", tip: "Features the world's largest stone sundial accurate to within two seconds." },
      { name: "Nahargarh Fort & Sunset Point", category: "Scenic", coords: [26.9373, 75.8155], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Rugged fortress perched atop Aravalli hills with sweeping sunset vistas over the Pink City.", tip: "Padao restaurant inside offers cold refreshments with the panoramic sunset." },
      { name: "Jal Mahal (Water Palace)", category: "Scenic", coords: [26.9535, 75.8462], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Serene submerged palace floating in the center of Man Sagar Lake.", tip: "Illuminated beautifully with yellow lamps after 7:00 PM." },
      { name: "Chokhi Dhani Ethnic Cultural Village", category: "Culture", coords: [26.7663, 75.8360], ticketCost: "₹900", costValue: 900, budgetTier: "premium", desc: "Vibrant Rajasthani village fair with folk dances, camel rides, fire acts, and royal thali feast.", tip: "Arrive around 5:30 PM to enjoy all village performances before dining." },
      { name: "Johari Bazaar & Bapu Bazaar", category: "Shopping", coords: [26.9190, 75.8270], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Pink City street market for silver jewelry, handcrafted juttis, and block-print quilts.", tip: "Check out Laxmi Mishthan Bhandar (LMB) for authentic Pyaaz Kachori and Ghewar." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Historic Forts & Royal Mansions of Amer",
        overnight: "Overnight in Jaipur Hotel / Haveli",
        transitSummary: "Amer circuit ~ 24 km",
        stops: [
          { time: "09:00 AM", name: "Amber Fort & Sheesh Mahal", category: "Fort", cost: "₹100", costValue: 100, duration: "3h", desc: "Explore grand courtyards, Diwan-e-Aam, and dazzling Sheesh Mahal glass palace.", tip: "Wear comfortable walking shoes for the cobblestone ramparts.", coords: [26.9855, 75.8513] },
          { time: "12:30 PM", name: "Jal Mahal (Water Palace) & Lunch", category: "Dining", cost: "₹550", costValue: 550, duration: "1.5h", desc: "Enjoy authentic Rajasthani Gatte Ki Sabzi and Ker Sangri overlooking the lake.", tip: "Try the sweet lassi at roadside stalls.", coords: [26.9535, 75.8462] },
          { time: "03:00 PM", name: "Nahargarh Fort & Sunset Point", category: "Scenic", cost: "₹50", costValue: 50, duration: "2.5h", desc: "Watch the sun sink into the Aravalli horizon as Jaipur city lights illuminate below.", tip: "Carry a light jacket as the hilltop gets breezy after dark.", coords: [26.9373, 75.8155] }
        ]
      },
      {
        day: 2,
        title: "Day 2: The Walled Pink City, Palaces & Bazaars",
        overnight: "Overnight in Jaipur Hotel",
        transitSummary: "Old City loop ~ 14 km",
        stops: [
          { time: "09:30 AM", name: "Hawa Mahal (Palace of Winds)", category: "Heritage", cost: "₹50", costValue: 50, duration: "1.5h", desc: "Marvel at the pink lattice facade and wind flow channels inside.", tip: "Morning sunlight directly illuminates the eastern facade.", coords: [26.9239, 75.8267] },
          { time: "11:30 AM", name: "City Palace & Chandra Mahal", category: "Heritage", cost: "₹200", costValue: 200, duration: "2.5h", desc: "Visit the royal arms museum, costume gallery, and the world's largest silver vessels.", tip: "Composite tickets available at the ticket window.", coords: [26.9258, 75.8236] },
          { time: "02:30 PM", name: "Jantar Mantar UNESCO Observatory", category: "Heritage", cost: "₹50", costValue: 50, duration: "1.5h", desc: "Discover how ancient astronomers measured time and tracked constellations with stone.", tip: "Audio guides explain each instrument clearly.", coords: [26.9248, 75.8246] },
          { time: "04:30 PM", name: "Johari Bazaar & Bapu Bazaar", category: "Shopping", coords: [26.9190, 75.8270], cost: "Free Entry", costValue: 0, duration: "2.5h", desc: "Shop for tie-and-dye Bandhani dupattas, blue pottery, and silver jewelry.", tip: "Savor hot Pyaaz Kachori at LMB.", coords: [26.9190, 75.8270] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Albert Hall Museum, Birla Temple & Chokhi Dhani",
        overnight: "Overnight in Jaipur Hotel",
        transitSummary: "Jaipur South loop ~ 32 km",
        stops: [
          { time: "10:00 AM", name: "Albert Hall Museum & Ram Niwas Garden", category: "Heritage", cost: "₹40", costValue: 40, duration: "2h", desc: "State museum housed in stunning Indo-Saracenic palace featuring Egyptian mummies and pottery.", tip: "Feeding pigeons in front of Albert Hall is a popular photo ritual.", coords: [26.9116, 75.8195] },
          { time: "01:00 PM", name: "Traditional Rajasthani Thali Lunch", category: "Dining", cost: "₹450", costValue: 450, duration: "1.5h", desc: "Unlimited authentic thali with Dal Baati Churma, Bajre Ki Roti, and Gatte Ki Kadhi.", tip: "Rawat Mishthan Bhandar or Thali & More.", coords: [26.9200, 75.7950] },
          { time: "03:30 PM", name: "Birla Mandir White Marble Temple", category: "Temple", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Pure white Makrana marble temple dedicated to Lakshmi Narayan beneath Moti Dungri fortress.", tip: "Remove footwear outside; socks permitted on marble floors.", coords: [26.8924, 75.8155] },
          { time: "05:30 PM", name: "Chokhi Dhani Ethnic Cultural Village", category: "Culture", cost: "₹900", costValue: 900, duration: "4h", desc: "Immerse in desert folk traditions with puppet shows, acrobatics, and royal feast.", tip: "Pre-book admission to skip the evening line.", coords: [26.7663, 75.8360] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Jaigarh Fort Cannon & Blue Pottery Departure",
        overnight: "Departure Transfer",
        transitSummary: "Jaipur to Airport / Railway Station ~ 18 km",
        stops: [
          { time: "09:30 AM", name: "Jaigarh Fort & Jaivana Giant Cannon", category: "Fort", cost: "₹50", costValue: 50, duration: "2.5h", desc: "See the world's largest cannon on wheels perched high above Amber Fort.", tip: "Offers underground tunnel walk connecting directly to Amber.", coords: [26.9840, 75.8450] },
          { time: "12:30 PM", name: "Sanganer Hand-Block Printing Workshop", category: "Shopping", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Watch master artisans carve wooden blocks and stamp vibrant organic vegetable dyes.", tip: "Direct factory prices for cotton bedsheets and kurtas.", coords: [26.8150, 75.7700] },
          { time: "03:30 PM", name: "Jaipur Airport / Junction Transfer", category: "Transit", cost: "Free Entry", costValue: 0, duration: "1h", desc: "Safe drop-off for flight or superfast train back home.", tip: "Pack a box of sweet Ghewar to take home.", coords: [26.8280, 75.8050] }
        ]
      }
    ],
    budgetBreakdown: { stay: 6500, food: 4200, activities: 2800, transport: 2200, shopping: 800 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "UPI / Cash for market bargaining", "Sunscreen SPF 50+"],
      clothing: ["Breathable cotton shirts & kurtas", "Comfortable walking shoes", "Sunhat & sunglasses"],
      gear: ["Power bank", "Camera for royal facades", "Canvas tote bag for shopping"],
      health: ["Electrolytes / ORS sachets", "Hand sanitizer", "Basic indigestion pills"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI accepted everywhere in Jaipur from street carts to luxury palaces.",
      transit: "Pre-booked private AC sedan is best due to distances between Amer and city center.",
      tipping: "7-10% at restaurants; ₹200/day for private driver.",
      emergency: "Jaipur Tourist Helpline: 0141-2822863 | Police: 112.",
      etiquette: "Bargaining is expected in street bazaars; maintain polite smiles.",
      phrases: [{ en: "Hello", local: "Khamma Ghani" }, { en: "Thank you", local: "Dhanyawaad" }]
    }
  },

  udaipur: {
    destination: "Udaipur, Rajasthan",
    days: 4,
    title: "City of Lakes & White Palaces: 4 Days in Udaipur",
    subtitle: "From Lake Pichola sunset boat cruises and grand City Palace museum to Saheliyon Ki Bari and Dharohar folk dances at Bagore Ki Haveli.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 17500,
    currency: "INR (₹)",
    coords: [24.5854, 73.7125], // Udaipur Center
    nearbyAttractions: [
      { name: "Udaipur City Palace & Royal Museum", category: "Heritage", coords: [24.5764, 73.6835], ticketCost: "₹300", costValue: 300, budgetTier: "moderate", desc: "Rajasthan's largest palace complex built over 400 years with marble arches, mirror work, and lake panoramas.", tip: "Hire an audio guide for the King's personal gallery." },
      { name: "Lake Pichola Sunset Boat Cruise to Jag Mandir", category: "Scenic", coords: [24.5720, 73.6800], ticketCost: "₹450", costValue: 450, budgetTier: "moderate", desc: "Scenic boat cruise gliding past Taj Lake Palace to the island palace garden of Jag Mandir.", tip: "Book the 5:00 PM sunset slot for glowing lake vistas." },
      { name: "Saheliyon Ki Bari (Garden of the Maidens)", category: "Nature", coords: [24.6015, 73.6872], ticketCost: "₹20", costValue: 20, budgetTier: "budget", desc: "Lush courtyards with marble elephant fountains, lotus pools, and rose gardens designed for royal princesses.", tip: "Fountains operate entirely on natural water pressure without pumps." },
      { name: "Bagore Ki Haveli Dharohar Folk Dance", category: "Culture", coords: [24.5794, 73.6811], ticketCost: "₹100", costValue: 100, budgetTier: "budget", desc: "Historic 18th-century waterfront mansion hosting evening Chari, Terah Taali, and Bhavai puppet and pot-balancing dances.", tip: "Queue by 6:00 PM as seats fill quickly for the 7:00 PM performance." },
      { name: "Sajjangarh Monsoon Palace", category: "Fort", coords: [24.5898, 73.6375], ticketCost: "₹60", costValue: 60, budgetTier: "budget", desc: "White hilltop palace atop Bansdara mountain overlooking lakes and Aravalli mountain sunsets.", tip: "Take forest department vans from the base gate." },
      { name: "Jagdish Ancient Temple", category: "Temple", coords: [24.5786, 73.6838], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Intricately carved 1651 stone temple with sculpted elephant friezes dedicated to Lord Vishnu.", tip: "Attend the morning 9:00 AM aarti with cymbals and bells." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: City Palace & Lake Pichola Sunset Cruise",
        overnight: "Overnight in Udaipur Heritage Hotel",
        transitSummary: "Lakeside circuit ~ 12 km",
        stops: [
          { time: "09:30 AM", name: "Udaipur City Palace & Royal Museum", category: "Heritage", cost: "₹300", costValue: 300, duration: "3h", desc: "Wander through the Peacock Courtyard, Manak Mahal, and Krishna Vilas.", tip: "Wear comfortable shoes as the palace has several stone steps.", coords: [24.5764, 73.6835] },
          { time: "01:00 PM", name: "Lakeside Haveli Lunch (Ambrai / Tribute)", category: "Dining", cost: "₹650", costValue: 650, duration: "1.5h", desc: "Savor authentic Laal Maas and freshly baked butter naan overlooking Lake Pichola.", tip: "Reserve a lakefront table in advance.", coords: [24.5790, 73.6780] },
          { time: "03:30 PM", name: "Jagdish Ancient Temple", category: "Temple", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Admire centuries-old Indo-Aryan stone carvings and the black stone Vishnu idol.", tip: "Leave shoes with the temple shoe caretaker.", coords: [24.5786, 73.6838] },
          { time: "05:00 PM", name: "Lake Pichola Sunset Boat Cruise to Jag Mandir", category: "Scenic", cost: "₹450", costValue: 450, duration: "2h", desc: "Glide across golden waters past Lake Palace to Jag Mandir island palace.", tip: "Sit on the open upper deck for best photos.", coords: [24.5720, 73.6800] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Royal Gardens, Monsoon Palace & Cultural Dance",
        overnight: "Overnight in Udaipur Hotel",
        transitSummary: "Udaipur west loop ~ 22 km",
        stops: [
          { time: "09:30 AM", name: "Saheliyon Ki Bari (Garden of the Maidens)", category: "Nature", cost: "₹20", costValue: 20, duration: "2h", desc: "Relax amidst marble pavilions, rain fountains, and lotus ponds.", tip: "Listen to the natural rain effect generated by the marble fountains.", coords: [24.6015, 73.6872] },
          { time: "12:30 PM", name: "Fateh Sagar Lake Promenade & Lunch", category: "Dining", cost: "₹450", costValue: 450, duration: "1.5h", desc: "Enjoy famous cold coffee and regional street snacks at Bombay Market.", tip: "Sukhadia Circle street food is nearby.", coords: [24.6000, 73.6750] },
          { time: "03:30 PM", name: "Sajjangarh Monsoon Palace", category: "Fort", cost: "₹60", costValue: 60, duration: "2.5h", desc: "Ascend to the hilltop castle for dramatic 360-degree sunset panoramas.", tip: "Watch the sun melt into the Aravalli hills.", coords: [24.5898, 73.6375] },
          { time: "06:45 PM", name: "Bagore Ki Haveli Dharohar Folk Dance", category: "Culture", cost: "₹100", costValue: 100, duration: "2h", desc: "Witness world-famous Rajasthani Bhavai pot-balancing and puppet masters.", tip: "Cameras require a nominal ₹100 photography permit at the desk.", coords: [24.5794, 73.6811] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Vintage Car Museum & Karni Mata Ropeway",
        overnight: "Overnight in Udaipur Hotel",
        transitSummary: "Central Udaipur ~ 16 km",
        stops: [
          { time: "10:00 AM", name: "Royal Vintage & Classic Car Collection", category: "Heritage", cost: "₹250", costValue: 250, duration: "2h", desc: "See the Maharanas' rare Rolls-Royces, Cadillacs, and 1934 Rolls-Royce Phantom.", tip: "Several cars were featured in James Bond's Octopussy.", coords: [24.5750, 73.6930] },
          { time: "01:00 PM", name: "Rajasthani Thali Lunch at Natraj", category: "Dining", cost: "₹350", costValue: 350, duration: "1.5h", desc: "Famous unlimited traditional Gujarati and Rajasthani vegetarian thali.", tip: "Come hungry; the service is famously fast and generous.", coords: [24.5850, 73.6980] },
          { time: "04:00 PM", name: "Mansapurna Karni Mata Ropeway", category: "Scenic", cost: "₹110", costValue: 110, duration: "2.5h", desc: "Cable car ride to Machhla Magra hilltop overlooking both Pichola and Fateh Sagar lakes.", tip: "Spectacular dusk view as city bridges light up.", coords: [24.5700, 73.6850] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Shilpgram Artisan Village & Departure",
        overnight: "Departure Transfer",
        transitSummary: "Udaipur to Airport ~ 24 km",
        stops: [
          { time: "09:30 AM", name: "Shilpgram Rural Arts & Crafts Complex", category: "Shopping", cost: "₹50", costValue: 50, duration: "2.5h", desc: "Living ethnographic museum showcasing traditional tribal mud houses and live potters.", tip: "Direct purchase from rural weavers with zero middlemen.", coords: [24.6150, 73.6600] },
          { time: "01:00 PM", name: "Old Bazaars (Hathi Pol) for Miniature Paintings", category: "Shopping", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Browse authentic Pichwai temple art and camel bone miniature paintings.", tip: "Inspect fine brushwork made using natural stone colors.", coords: [24.5850, 73.6870] },
          { time: "03:30 PM", name: "Udaipur Maharana Pratap Airport Drop-off", category: "Transit", cost: "Free Entry", costValue: 0, duration: "1h", desc: "Smooth departure transfer concluding your romantic lake vacation.", tip: "Carry souvenirs securely packed in hand luggage.", coords: [24.6170, 73.8960] }
        ]
      }
    ],
    budgetBreakdown: { stay: 7000, food: 4500, activities: 2800, transport: 2200, shopping: 1000 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Cash for ferry & street bazaars", "Sun protection"],
      clothing: ["Light cotton clothing", "Smart evening wear for rooftop lake dinners", "Walking sandals"],
      gear: ["Power bank", "Camera for sunset reflections", "Light shawl for evening breeze"],
      health: ["Hand wipes", "Hydration tablets", "Basic personal medication"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI accepted widely in Udaipur.",
      transit: "Auto-rickshaws for narrow old alleys; pre-booked private cab for airport and outer lakes.",
      tipping: "7-10% at restaurants; ₹200/day for private driver.",
      emergency: "Tourist Assistance: 0294-2411535 | Police: 112.",
      etiquette: "Modest attire inside Jagdish temple. Confirm boat timings before heading to the jetty.",
      phrases: [{ en: "Hello", local: "Namaste" }, { en: "Thank you", local: "Dhanyawaad" }]
    }
  },

  ooty: {
    destination: "Ooty (Udhagamandalam), Tamil Nadu",
    days: 3,
    title: "Queen of the Nilgiris: 3 Days in Ooty & Coonoor",
    subtitle: "From heritage UNESCO Nilgiri toy train and fragrant botanical gardens to Doddabetta Peak, Pykara falls, and lush tea estates.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 14500,
    currency: "INR (₹)",
    coords: [11.4102, 76.6950], // Ooty Town
    nearbyAttractions: [
      { name: "Government Botanical Gardens & Italian Garden", category: "Nature", coords: [11.4180, 76.7110], ticketCost: "₹40", costValue: 40, budgetTier: "budget", desc: "22 hectares of exotic flora, lush terraced lawns, and a 20-million-year-old fossilized tree trunk.", tip: "Visit morning before tourist buses arrive." },
      { name: "Ooty Lake & Boat House", category: "Scenic", coords: [11.4050, 76.6850], ticketCost: "₹120", costValue: 120, budgetTier: "moderate", desc: "Picturesque man-made lake with motor, rowing, and pedal boats framed by eucalyptus trees.", tip: "Rent a 4-seater paddle boat for tranquil lake exploration." },
      { name: "Doddabetta Peak & Telescope House", category: "Scenic", coords: [11.4010, 76.7360], ticketCost: "₹10", costValue: 10, budgetTier: "budget", desc: "Highest peak in the Nilgiri Mountains at 2,637 meters offering sweeping Chamundi hill views.", tip: "Clear mornings offer views reaching down into Coimbatore plains." },
      { name: "Nilgiri Mountain Railway Heritage Toy Train", category: "Heritage", coords: [11.4080, 76.7020], ticketCost: "₹150", costValue: 150, budgetTier: "moderate", desc: "UNESCO steam railway cutting through dark tunnels, tea valleys, and viaducts down to Coonoor.", tip: "Book first-class window seats 60 days ahead on IRCTC." },
      { name: "Pykara Lake & Cascading Waterfalls", category: "Nature", coords: [11.4500, 76.6000], ticketCost: "₹175", costValue: 175, budgetTier: "moderate", desc: "Sacred Toda river cascading into tiered waterfalls surrounded by pine forests.", tip: "Speedboat ride on Pykara dam lake is thrilling." },
      { name: "Highfield Tea Factory & Chocolate Museum", category: "Culture", coords: [11.3600, 76.7900], ticketCost: "₹20", costValue: 20, budgetTier: "budget", desc: "Watch fresh tea leaves undergo CTC crushing and sample hot green tea and homemade fudge.", tip: "Try the eucalyptus oil and cardamom tea packs." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Botanical Gardens, Doddabetta & Tea Factory",
        overnight: "Overnight in Ooty Tea Resort",
        transitSummary: "Ooty central circuit ~ 18 km",
        stops: [
          { time: "09:30 AM", name: "Government Botanical Gardens", category: "Nature", cost: "₹40", costValue: 40, duration: "2.5h", desc: "Explore the glass house, fern house, and rare cork trees planted in 1848.", tip: "Wear comfortable walking shoes.", coords: [11.4180, 76.7110] },
          { time: "12:30 PM", name: "South Indian Thali Lunch", category: "Dining", cost: "₹350", costValue: 350, duration: "1.5h", desc: "Authentic hot rice, sambar, rasam, kootu, and crispy appalam on banana leaf.", tip: "Junior Kuppanna or Shinkows Chinese.", coords: [11.4120, 76.7000] },
          { time: "02:30 PM", name: "Doddabetta Peak & Telescope House", category: "Scenic", cost: "₹10", costValue: 10, duration: "2h", desc: "Look across the Nilgiri blue mountains through the summit telescope.", tip: "Carry warm woolens as Doddabetta is significantly cooler than town.", coords: [11.4010, 76.7360] },
          { time: "05:00 PM", name: "Highfield Tea Factory & Chocolate Museum", category: "Culture", cost: "₹20", costValue: 20, duration: "2h", desc: "Sip freshly steeped cardamom tea and buy handmade hazelnut chocolates.", tip: "Factory tour lasts 25 mins.", coords: [11.3600, 76.7900] }
        ]
      },
      {
        day: 2,
        title: "Day 2: UNESCO Toy Train Joyride to Coonoor & Sim's Park",
        overnight: "Overnight in Ooty Hotel",
        transitSummary: "Ooty to Coonoor ~ 20 km (Toy Train)",
        stops: [
          { time: "09:00 AM", name: "Nilgiri Mountain Railway Heritage Toy Train", category: "Heritage", cost: "₹150", costValue: 150, duration: "1.5h", desc: "Chug along the scenic rack-and-pinion railway tracks with mountain gorge vistas.", tip: "Board at Ooty railway station; train leaves at 09:15 AM.", coords: [11.4080, 76.7020] },
          { time: "11:30 AM", name: "Sim's Park & Rose Garden (Coonoor)", category: "Nature", coords: [11.3530, 76.7959], cost: "₹30", costValue: 30, duration: "2h", desc: "Natural botanical garden featuring rare temperate trees, magnolias, and pines.", tip: "Gentle walking paths with zero steep climbs.", coords: [11.3530, 76.7959] },
          { time: "02:00 PM", name: "Dolphin's Nose Viewpoint & Catherine Falls", category: "Scenic", coords: [11.3400, 76.8300], cost: "Free Entry", costValue: 0, duration: "2h", desc: "Dramatic rock promontory looking into deep St. Catherine waterfall cascades.", tip: "Tea stalls along the route sell hot Nilgiri chai.", coords: [11.3400, 76.8300] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Pykara Waterfalls, Lake Boating & Departure",
        overnight: "Departure Transfer to Coimbatore / Bangalore",
        transitSummary: "Pykara loop ~ 42 km",
        stops: [
          { time: "09:30 AM", name: "Pykara Lake & Cascading Waterfalls", category: "Nature", cost: "₹175", costValue: 175, duration: "3h", desc: "Experience pure mountain serenity with pine forest walks and speedboat cruise.", tip: "Battery buggies available from the road to the falls.", coords: [11.4500, 76.6000] },
          { time: "01:30 PM", name: "Ooty Lake & Boat House Promenade", category: "Scenic", cost: "₹120", costValue: 120, duration: "2h", desc: "Leisure boat ride followed by shopping for Nilgiri honey and essential oils.", tip: "Look for certified Nilgiri eucalyptus oil.", coords: [11.4050, 76.6850] },
          { time: "04:00 PM", name: "Coimbatore Airport / Mettupalayam Drop-off", category: "Transit", cost: "Free Entry", costValue: 0, duration: "2.5h", desc: "Descend the scenic Kallar mountain hairpin bends to Coimbatore.", tip: "Driver will pause briefly at tea stall viewpoints.", coords: [11.0300, 77.0400] }
        ]
      }
    ],
    budgetBreakdown: { stay: 5800, food: 3800, activities: 2200, transport: 2200, shopping: 500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Cash for state park entry tickets", "Light umbrella"],
      clothing: ["Light sweaters & cardigans", "Full trousers", "Walking sneakers"],
      gear: ["Power bank", "Binoculars for Doddabetta telescope view", "Camera"],
      health: ["Motion sickness medication for winding ghats", "Moisturizer", "Band-aids"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI accepted in most shops; keep cash for toll gates and boat counters.",
      transit: "Private cab is the safest and most convenient option across mountain roads.",
      tipping: "7-10% at cafes; ₹200-₹300/day for private driver.",
      emergency: "Ooty Police: 0423-2444010 | Emergency: 112.",
      etiquette: "Protect the fragile Nilgiri ecosystem: do not discard plastic bottles along ghats.",
      phrases: [{ en: "Hello", local: "Vanakkam" }, { en: "Thank you", local: "Nandri" }]
    }
  },

  rishikesh: {
    destination: "Rishikesh, Uttarakhand",
    days: 3,
    title: "Yoga Capital & Himalayan Ganges: 3 Days in Rishikesh",
    subtitle: "From evening Triveni Ghat Ganga Aarti and iconic suspension bridges to The Beatles Ashram, Neer Garh falls, and white water rafting.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 12500,
    currency: "INR (₹)",
    coords: [30.0869, 78.2676], // Rishikesh Ganga Center
    nearbyAttractions: [
      { name: "Triveni Ghat Evening Maha Ganga Aarti", category: "Spiritual", coords: [30.1040, 78.2980], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Sacred confluence where oil lamps are floated into the holy river amidst Vedic chants and brass lamps.", tip: "Arrive by 5:30 PM to secure prime riverside steps." },
      { name: "Ram Jhula & Swarg Ashram Suspension Bridge", category: "Heritage", coords: [30.1235, 78.3180], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Historic 450-foot iron suspension footbridge connecting ashrams across turquoise mountain waters.", tip: "Watch out for mischievous monkeys on the bridge railings." },
      { name: "The Beatles Ashram (Chaurasi Kutia)", category: "Culture", coords: [30.1170, 78.3240], ticketCost: "₹150", costValue: 150, budgetTier: "moderate", desc: "Fabled meditation retreat where the Beatles stayed in 1968; filled with pop-art graffiti murals.", tip: "Walk inside the stone meditation domes." },
      { name: "Shivpuri White Water River Rafting Hub", category: "Adventure", coords: [30.1370, 78.3880], ticketCost: "₹650", costValue: 650, budgetTier: "premium", desc: "16 km Grade III/IV river rafting down Marine Drive, Roller Coaster, and Golf Course rapids.", tip: "Wear quick-dry clothes and water sandals; life jackets provided." },
      { name: "Neer Garh Cascading Waterfall & Nature Trail", category: "Nature", coords: [30.1420, 78.3360], ticketCost: "₹30", costValue: 30, budgetTier: "budget", desc: "Pristine multi-tier mountain waterfall with natural swimming rock pools.", tip: "Short 20-minute uphill hike; wear shoes with good wet grip." },
      { name: "Parmarth Niketan Ashram & Shiva Statue", category: "Spiritual", coords: [30.1190, 78.3150], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Renowned spiritual center featuring a giant seated Lord Shiva statue overlooking the Ganga.", tip: "Join the sunset aarti with devotional singing." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Ram Jhula, Ashrams & Evening Ganga Aarti",
        overnight: "Overnight in Rishikesh Riverside Resort",
        transitSummary: "Local Rishikesh ~ 14 km",
        stops: [
          { time: "09:30 AM", name: "Ram Jhula & Swarg Ashram Suspension Bridge", category: "Heritage", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Cross the swaying suspension bridge with majestic river views and spiritual bookstores.", tip: "Do not carry plastic bags openly due to monkeys.", coords: [30.1235, 78.3180] },
          { time: "12:30 PM", name: "Pure Vegetarian Ashram Bistro Lunch", category: "Dining", cost: "₹350", costValue: 350, duration: "1.5h", desc: "Enjoy organic Ayurvedic thali, wood-fired sourdough pizza, and ginger-lemon tea.", tip: "Little Buddha Cafe overlooking the river.", coords: [30.1260, 78.3220] },
          { time: "03:00 PM", name: "The Beatles Ashram (Chaurasi Kutia)", category: "Culture", cost: "₹150", costValue: 150, duration: "2.5h", desc: "Stroll through the forested ruins, Beatles Cathedral gallery, and meditation igloos.", tip: "Very peaceful and photogenic.", coords: [30.1170, 78.3240] },
          { time: "06:00 PM", name: "Triveni Ghat Evening Maha Ganga Aarti", category: "Spiritual", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Participate in the mesmerizing evening prayer ceremony with multi-tiered brass oil lamps.", tip: "Buy a biodegradable leaf lamp with marigolds to float on the river.", coords: [30.1040, 78.2980] }
        ]
      },
      {
        day: 2,
        title: "Day 2: White Water Rafting & Neer Garh Waterfalls",
        overnight: "Overnight in Rishikesh Resort",
        transitSummary: "Shivpuri to Tapovan ~ 28 km",
        stops: [
          { time: "09:00 AM", name: "Shivpuri White Water River Rafting Hub", category: "Adventure", cost: "₹650", costValue: 650, duration: "3.5h", desc: "Conquer rapids including 'Return to Sender' and 'Club House' with cliff jumping.", tip: "Leave phones, wallets, and keys in the transport dry bag.", coords: [30.1370, 78.3880] },
          { time: "01:30 PM", name: "Tapovan Mountain Viewpoint Lunch", category: "Dining", cost: "₹450", costValue: 450, duration: "1.5h", desc: "Relax with hot lemon-honey ginger tea, fresh hummus falafel, and hot thukpa.", tip: "German Bakery or Beatles Cafe.", coords: [30.1300, 78.3250] },
          { time: "03:30 PM", name: "Neer Garh Cascading Waterfall & Nature Trail", category: "Nature", cost: "₹30", costValue: 30, duration: "2.5h", desc: "Hike up the forest trail and dip your feet in the crystal clear turquoise pool.", tip: "Carry drinking water and a small towel.", coords: [30.1420, 78.3360] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Yoga Morning, Haridwar Heritage & Departure",
        overnight: "Departure Transfer to Dehradun / Haridwar",
        transitSummary: "Rishikesh to Haridwar / Dehradun ~ 35 km",
        stops: [
          { time: "07:30 AM", name: "Sunrise Yoga & Meditation Session on Ganga Beach", category: "Spiritual", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Morning pranayama and gentle asanas with clean Himalayan river breeze.", tip: "Wear comfortable stretchable clothing.", coords: [30.1200, 78.3160] },
          { time: "11:00 AM", name: "Har Ki Pauri & Haridwar Heritage Ghats", category: "Heritage", coords: [29.9457, 78.1642], cost: "Free Entry", costValue: 0, duration: "2h", desc: "Sacred footprint ghat of Lord Vishnu where the Ganga enters the Indo-Gangetic plains.", tip: "Taste the hot Mohan Ji Puri Wale kachoris nearby.", coords: [29.9457, 78.1642] },
          { time: "03:00 PM", name: "Dehradun Airport (Jolly Grant) / Haridwar Railway Drop", category: "Transit", cost: "Free Entry", costValue: 0, duration: "1h", desc: "Comfortable departure transfer concluding your rejuvenating spiritual getaway.", tip: "Airport is just 30 mins drive from Rishikesh.", coords: [30.1897, 78.1803] }
        ]
      }
    ],
    budgetBreakdown: { stay: 5200, food: 3200, activities: 2100, transport: 1500, shopping: 500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Water shoes or strap sandals for rafting", "Quick dry towel"],
      clothing: ["Breathable cottons", "Modest yoga attire", "Light sweater for evening river breeze"],
      gear: ["Waterproof phone pouch", "Power bank", "Reusable water bottle"],
      health: ["Mosquito repellant", "Hand sanitizer", "Basic antiseptic cream"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI accepted in all Tapovan cafes and shops.",
      transit: "Auto rickshaws (Vikram) between ghats; private cab for Shivpuri rafting and airport.",
      tipping: "7-10% in cafes; ₹100 for rafting guide.",
      emergency: "Rishikesh Police: 0135-2430012 | Emergency: 112.",
      etiquette: "Rishikesh is an alcohol-free and strictly vegetarian holy town. Dress modestly along ghats.",
      phrases: [{ en: "Greetings", local: "Radhe Radhe" }, { en: "Thank you", local: "Dhanyawaad" }]
    }
  },

  varanasi: {
    destination: "Varanasi (Kashi / Banaras), Uttar Pradesh",
    days: 3,
    title: "Eternal City of Lights: 3 Days in Kashi & Sarnath",
    subtitle: "From sunrise boat rides across 84 historic ghats and Kashi Vishwanath Golden Temple to Dashashwamedh evening aarti and Buddhist stupas in Sarnath.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 13500,
    currency: "INR (₹)",
    coords: [25.3176, 82.9739], // Varanasi Ghats
    nearbyAttractions: [
      { name: "Dashashwamedh Ghat Grand Evening Ganga Aarti", category: "Spiritual", coords: [25.3075, 83.0104], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "World-renowned ritual of choreographed brass oil lamps, conch shells, and incense by seven priests.", tip: "Hire an anchored wooden boat on the river for prime unobstructed viewing." },
      { name: "Kashi Vishwanath Golden Temple", category: "Temple", coords: [25.3109, 83.0107], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "One of the twelve sacred Jyotirlingas of Lord Shiva topped with a 1-ton pure gold dome.", tip: "Early morning 6:00 AM darshan avoids long temple corridor queues." },
      { name: "Sunrise Boat Ride across 84 Historic Ghats", category: "Scenic", coords: [25.2950, 83.0050], ticketCost: "₹250", costValue: 250, budgetTier: "moderate", desc: "Rowing past Assi Ghat, Harishchandra Ghat, and Manikarnika observing sunrise morning rituals.", tip: "Depart at 05:45 AM to witness the sun rise over the eastern sandy riverbank." },
      { name: "Sarnath Deer Park & Dhamek Stupa", category: "Heritage", coords: [25.3811, 83.0214], ticketCost: "₹25", costValue: 25, budgetTier: "budget", desc: "Cradle of Buddhism where Lord Buddha delivered his first sermon after attaining enlightenment.", tip: "Visit the Sarnath Archaeological Museum housing the original Ashoka Lion Capital." },
      { name: "Banarasi Silk Weaving Colony & Looms", category: "Shopping", coords: [25.3250, 83.0020], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Watch master weavers operate handlooms creating intricate gold and silver zari silk sarees.", tip: "Look for certified silk mark hologram labels." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Kashi Vishwanath Darshan & Grand Evening Aarti",
        overnight: "Overnight in Varanasi Heritage Hotel",
        transitSummary: "Ghats corridor ~ 8 km",
        stops: [
          { time: "07:30 AM", name: "Kashi Vishwanath Golden Temple", category: "Temple", cost: "Free Entry", costValue: 0, duration: "2.5h", desc: "Sacred darshan at the magnificent newly renovated Kashi Vishwanath Corridor connecting directly to the Ganga.", tip: "No electronic items, leather belts, or wallets allowed inside sanctum.", coords: [25.3109, 83.0107] },
          { time: "11:30 AM", name: "Banaras Heritage Street Food Brunch", category: "Dining", cost: "₹250", costValue: 250, duration: "1.5h", desc: "Savor steaming hot Kachori-Jalebi at Ram Bhandar and thick Malaiyo foam sweet.", tip: "Malaiyo is a winter saffron dew delicacy.", coords: [25.3100, 83.0080] },
          { time: "02:30 PM", name: "Banarasi Silk Weaving Colony & Looms", category: "Shopping", cost: "Free Entry", costValue: 0, duration: "2.5h", desc: "Witness real gold and silver threads woven on jacquard pit looms.", tip: "Buy directly from master weaver cooperatives.", coords: [25.3250, 83.0020] },
          { time: "06:00 PM", name: "Dashashwamedh Ghat Grand Evening Ganga Aarti", category: "Spiritual", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Witness the magnificent spectacle of synchronized multi-tiered brass oil lamps.", tip: "Take a wooden rowboat on the river for tranquil viewing.", coords: [25.3075, 83.0104] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Sunrise 84-Ghat Boat Cruise & Sarnath Excursion",
        overnight: "Overnight in Varanasi Hotel",
        transitSummary: "Varanasi to Sarnath ~ 22 km",
        stops: [
          { time: "05:45 AM", name: "Sunrise Boat Ride across 84 Historic Ghats", category: "Scenic", cost: "₹250", costValue: 250, duration: "2.5h", desc: "Glide along the sacred river from Assi Ghat to Manikarnika in soft morning dawn.", tip: "Dress warmly for early morning breeze.", coords: [25.2950, 83.0050] },
          { time: "09:30 AM", name: "Subah-e-Banaras Morning Ragas at Assi Ghat", category: "Culture", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Experience live classical morning flute recitals, Vedic chants, and gentle yoga on the ghat.", tip: "Sip hot lemon tea served in terracotta clay kulhads.", coords: [25.2890, 83.0060] },
          { time: "12:30 PM", name: "Sarnath Deer Park & Dhamek Stupa", category: "Heritage", cost: "₹25", costValue: 25, duration: "3h", desc: "Explore the 128-foot cylindrical stone stupa marking the birthplace of the Buddhist Sangha.", tip: "Visit the museum closed on Fridays.", coords: [25.3811, 83.0214] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Sankat Mochan Temple & Departure Transfer",
        overnight: "Departure Transfer",
        transitSummary: "Varanasi to Airport ~ 26 km",
        stops: [
          { time: "08:30 AM", name: "Sankat Mochan Hanuman Ancient Temple", category: "Temple", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Revered temple founded by Saint Tulsidas, author of the Ramcharitmanas.", tip: "Try the famous Besan Ladoo prasad.", coords: [25.2810, 82.9980] },
          { time: "11:00 AM", name: "Banaras Hindu University (BHU) & New Vishwanath Temple", category: "Heritage", coords: [25.2677, 82.9913], cost: "Free Entry", costValue: 0, duration: "2h", desc: "Visit the serene marble Vishwanath temple inside Asia's largest residential university campus.", tip: "Clean, tree-lined quiet campus roads.", coords: [25.2677, 82.9913] },
          { time: "02:30 PM", name: "Lal Bahadur Shastri International Airport Transfer", category: "Transit", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Drop-off for outbound flight concluding your unforgettable spiritual voyage.", tip: "Carry authentic Banarasi paan packed in betel leaf to share.", coords: [25.4520, 82.8590] }
        ]
      }
    ],
    budgetBreakdown: { stay: 5500, food: 3500, activities: 2000, transport: 1800, shopping: 700 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Cash for temple offerings & boats", "Modest Indian ethnic clothing"],
      clothing: ["Cotton kurtas / modest pants", "Slip-on sandals (shoes removed frequently)", "Shawl for morning boat ride"],
      gear: ["Power bank", "Camera", "Small shoulder pouch without leather"],
      health: ["Hand sanitizer", "Basic stomach relief pills", "Mosquito repellent"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI accepted almost everywhere; keep cash for boats and street kulhads.",
      transit: "Cycle e-rickshaws for narrow lanes; pre-booked private cab for airport and Sarnath.",
      tipping: "7-10% in restaurants; ₹100-₹200 for boatman.",
      emergency: "Tourist Police Varanasi: 0542-2508008 | Emergency: 112.",
      etiquette: "Strictly avoid photography at Manikarnika burning ghat out of respect for families.",
      phrases: [{ en: "Greetings", local: "Har Har Mahadev" }, { en: "Thank you", local: "Dhanyawaad" }]
    }
  },

  ladakh: {
    destination: "Leh & Ladakh, Jammu & Kashmir / Ladakh",
    days: 6,
    title: "Land of High Passes: 6 Days in Leh, Nubra & Pangong Tso",
    subtitle: "From ancient Tibetan monasteries and Khardung La pass to double-humped camel rides in Hunder sand dunes and indigo blue Pangong Tso.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 28500,
    currency: "INR (₹)",
    coords: [34.1526, 77.5771], // Leh Center
    nearbyAttractions: [
      { name: "Leh Palace & Shanti Stupa", category: "Heritage", coords: [34.1642, 77.5847], ticketCost: "₹25", costValue: 25, budgetTier: "budget", desc: "9-story royal fortress built in 1600 overlooking the Indus valley, and white Buddhist peace pagoda.", tip: "Visit Shanti Stupa at sunset when prayer bells ring." },
      { name: "Magnetic Hill & Indus-Zanskar Sangam", category: "Scenic", coords: [34.1800, 77.2000], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Gravity hill illusion where vehicles appear to roll uphill, and confluence of Indus and muddy Zanskar.", tip: "Stop on the white box marked on the highway to experience the gravity pull." },
      { name: "Khardung La High Mountain Pass (5,359 m)", category: "Scenic", coords: [34.2790, 77.6040], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "One of the highest motorable roads in the world connecting Leh to Nubra Valley.", tip: "Do not spend more than 15-20 minutes at the pass due to thin oxygen." },
      { name: "Nubra Valley & Hunder Sand Dunes", category: "Adventure", coords: [34.5800, 77.4600], ticketCost: "₹350", costValue: 350, budgetTier: "moderate", desc: "High-altitude cold desert dunes with rare two-humped Bactrian camel safaris.", tip: "Watch sunset over the dunes as the snow peaks turn copper gold." },
      { name: "Pangong Tso Trans-Himalayan Salt Lake", category: "Nature", coords: [33.7595, 78.6674], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Endorheic salt lake at 4,225 m elevation famous for shifting from turquoise to azure blue.", tip: "Temperature drops below freezing at night; dress in heavy down jackets." },
      { name: "Hall of Fame Military Museum", category: "Heritage", coords: [34.1400, 77.5500], ticketCost: "₹100", costValue: 100, budgetTier: "budget", desc: "Indian Army museum honoring brave soldiers of Siachen and Kargil conflicts.", tip: "Watch the poignant 15-minute documentary film inside." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Arrival & Mandatory Acclimatization in Leh",
        overnight: "Overnight in Leh Hotel",
        transitSummary: "Airport to Leh ~ 5 km",
        stops: [
          { time: "10:00 AM", name: "Leh Hotel Check-in & Rest", category: "Relaxation", cost: "Free Entry", costValue: 0, duration: "4h", desc: "Complete physical rest is medically mandatory on Day 1 to adapt to 3,500m elevation.", tip: "Drink 4-5 liters of water; avoid strenuous walking.", coords: [34.1526, 77.5771] },
          { time: "04:30 PM", name: "Leh Palace & Shanti Stupa", category: "Heritage", cost: "₹25", costValue: 25, duration: "2h", desc: "Gentle evening stroll around the peace stupa with bird's-eye views of Leh town.", tip: "Move at a slow, steady pace without rushing.", coords: [34.1642, 77.5847] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Sham Valley, Magnetic Hill & Sangam",
        overnight: "Overnight in Leh Hotel",
        transitSummary: "Leh to Sangam loop ~ 70 km",
        stops: [
          { time: "09:30 AM", name: "Magnetic Hill & Indus-Zanskar Sangam", category: "Scenic", cost: "Free Entry", costValue: 0, duration: "3h", desc: "Observe the two-tone river confluence and test the magnetic phenomenon.", tip: "Great photography spot from the cliff overlook.", coords: [34.1800, 77.2000] },
          { time: "01:30 PM", name: "Alchi Monastery & Apricot Garden Lunch", category: "Dining", cost: "₹450", costValue: 450, duration: "1.5h", desc: "Taste local Tibetan momos, Thukpa, and freshly plucked Ladakhi apricots.", tip: "Try the warm butter tea (Gur Gur chai).", coords: [34.2200, 77.1700] },
          { time: "03:30 PM", name: "Hall of Fame Military Museum", category: "Heritage", cost: "₹100", costValue: 100, duration: "2h", desc: "Learn about the extreme high-altitude warfare operations on the Siachen glacier.", tip: "Laser show in the evening.", coords: [34.1400, 77.5500] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Khardung La Pass (5,359 m) & Nubra Valley",
        overnight: "Overnight in Nubra Valley Camp / Hotel",
        transitSummary: "Leh to Nubra via Khardung La ~ 125 km (5h)",
        stops: [
          { time: "08:30 AM", name: "Khardung La High Mountain Pass (5,359 m)", category: "Scenic", cost: "Free Entry", costValue: 0, duration: "1h", desc: "Reach the world-famous pass surrounded by prayer flags and glacier peaks.", tip: "Keep warm cap and gloves on; oxygen levels are 50% of sea level.", coords: [34.2790, 77.6040] },
          { time: "01:30 PM", name: "Diskit Monastery & Giant Maitreya Buddha", category: "Spiritual", cost: "₹30", costValue: 30, duration: "2h", desc: "32-meter giant golden statue of Buddha facing down the Shyok river valley.", tip: "Panoramic overlook of the desert valley.", coords: [34.5400, 77.5300] },
          { time: "04:30 PM", name: "Nubra Valley & Hunder Sand Dunes", category: "Adventure", cost: "₹350", costValue: 350, duration: "2.5h", desc: "Ride two-humped Bactrian camels amidst silver sand dunes and snow ridges.", tip: "Camel rides last 15-30 minutes.", coords: [34.5800, 77.4600] }
        ]
      },
      {
        day: 4,
        title: "Day 4: Shyok River Route to Pangong Tso Lake",
        overnight: "Overnight in Pangong Tso Cottages / Camp",
        transitSummary: "Nubra to Pangong via Shyok ~ 160 km (6h)",
        stops: [
          { time: "08:30 AM", name: "Shyok River Gorge Scenic Drive", category: "Scenic", cost: "Free Entry", costValue: 0, duration: "4h", desc: "Drive along the wild roaring Shyok river carved through sheer granite cliffs.", tip: "Road conditions vary; experienced 4x4 drivers are vital.", coords: [34.3500, 78.1000] },
          { time: "02:30 PM", name: "Pangong Tso Trans-Himalayan Salt Lake", category: "Nature", cost: "Free Entry", costValue: 0, duration: "3h", desc: "Arrive at the world's most spectacular high-altitude blue lake extending into Tibet.", tip: "Photograph with the iconic 3 Idiots yellow scooter at the shore.", coords: [33.7595, 78.6674] }
        ]
      },
      {
        day: 5,
        title: "Day 5: Pangong Sunrise & Chang La Pass to Leh",
        overnight: "Overnight in Leh Hotel",
        transitSummary: "Pangong to Leh via Chang La ~ 150 km (5h)",
        stops: [
          { time: "06:00 AM", name: "Pangong Tso Sunrise Phenomenon", category: "Nature", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Watch the crystal waters transform from black to jade green to deep violet.", tip: "Extremely cold morning; wear windproof thermal parka.", coords: [33.7595, 78.6674] },
          { time: "11:00 AM", name: "Chang La High Mountain Pass (5,360 m)", category: "Scenic", cost: "Free Entry", costValue: 0, duration: "1h", desc: "Third highest motorable mountain pass guarded by the Indian Army.", tip: "Free hot army tea served at the top temple.", coords: [34.0500, 77.9200] },
          { time: "02:30 PM", name: "Thiksey Monastery (Mini Potala Palace)", category: "Heritage", cost: "₹50", costValue: 50, duration: "2h", desc: "12-story hilltop monastery resembling the Potala Palace of Lhasa with Maitreya shrine.", tip: "Admire the 49-foot two-story Buddha statue.", coords: [34.0580, 77.6660] }
        ]
      },
      {
        day: 6,
        title: "Day 6: Leh Main Bazaar & Kushok Bakula Airport Drop",
        overnight: "Departure Transfer",
        transitSummary: "Leh town to Airport ~ 4 km",
        stops: [
          { time: "09:00 AM", name: "Leh Main Bazaar for Tibetan Silver & Pashmina", category: "Shopping", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Shop for turquoise jewelry, sea buckthorn berry juice, and hand-spun Ladakhi woolens.", tip: "Sea buckthorn juice is packed with natural Vitamin C.", coords: [34.1630, 77.5830] },
          { time: "11:30 AM", name: "Leh Kushok Bakula Rimpochee Airport Drop-off", category: "Transit", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Spectacular flight taking off between snow-capped Himalayan ridges.", tip: "Choose a window seat on the left side of the aircraft for views.", coords: [34.1350, 77.5460] }
        ]
      }
    ],
    budgetBreakdown: { stay: 11500, food: 6500, activities: 4500, transport: 5000, shopping: 1000 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Inner Line Permit (ILP)", "Cash (ATMs often out of cash in Nubra/Pangong)"],
      clothing: ["Down jacket (-5°C rating)", "Thermal innerwear (2 sets)", "Fleece gloves, woolen beanie & neck gaiter"],
      gear: ["UV sunglasses with UV400 rating", "High capacity 20,000mAh power bank", "Lip balm SPF 30 & cold cream"],
      health: ["Diamox (acetazolamide) under doctor advice", "ORS hydration packets", "Pain relievers & throat lozenges"]
    },
    guide: {
      currency: "Indian Rupees (₹). Carry at least ₹8,000-₹10,000 in cash; card terminals do not work in Nubra or Pangong.",
      transit: "Only union taxis from Leh are permitted for internal sightseeing routes.",
      tipping: "₹400-₹500/day for private high-altitude mountain driver.",
      emergency: "SNM Hospital Leh: 01982-252014 | Tourist Police: 01982-252018 | Emergency: 112.",
      etiquette: "Always walk clockwise around Buddhist stupas, gompas, and mani prayer stones.",
      phrases: [{ en: "Greetings / Thank you", local: "Julley" }]
    }
  },

  agra: {
    destination: "Agra, Uttar Pradesh",
    days: 2,
    title: "Mughal Grandeur & Taj Mahal: 2 Days in Agra",
    subtitle: "From sunrise at the iconic Taj Mahal and imperial ramparts of Agra Fort to Mehtab Bagh sunset and ghost city of Fatehpur Sikri.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 9500,
    currency: "INR (₹)",
    coords: [27.1767, 78.0081], // Agra Center
    nearbyAttractions: [
      { name: "Taj Mahal Sunrise Monument of Love", category: "Heritage", coords: [27.1751, 78.0421], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "UNESCO World Heritage white marble mausoleum built by Mughal Emperor Shah Jahan for Mumtaz Mahal.", tip: "Gates open 30 mins before sunrise; closed on Fridays." },
      { name: "Agra Fort & Jahangiri Mahal", category: "Fort", coords: [27.1795, 78.0211], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Massive 16th-century red sandstone fortress with imperial quarters, Sheesh Mahal, and river view of the Taj.", tip: "Visit Musamman Burj where Shah Jahan spent his final years gazing at the Taj." },
      { name: "Mehtab Bagh (Moonlight Sunset Garden)", category: "Scenic", coords: [27.1800, 78.0430], ticketCost: "₹25", costValue: 25, budgetTier: "budget", desc: "Charbagh complex perfectly aligned with the Taj Mahal across the Yamuna river for sunset viewing.", tip: "Best spot for crowd-free sunset photography of the Taj's reflection." },
      { name: "Fatehpur Sikri & Buland Darwaza", category: "Heritage", coords: [27.0945, 77.6679], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Preserved red sandstone royal city founded by Akbar with the 54-meter-high Victory Gateway.", tip: "Hire an approved ASI guide inside the courtyard." },
      { name: "Sadar Bazaar & Authentic Agra Petha Market", category: "Shopping", coords: [27.1600, 78.0100], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Bustling market renowned for authentic Panchhi Petha (Kesar, Angoori, Paan) and leathercraft.", tip: "Look for the original Panchhi Petha store with government registration." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Taj Mahal Sunrise, Agra Fort & Mehtab Bagh",
        overnight: "Overnight in Agra Hotel",
        transitSummary: "Agra central circuit ~ 16 km",
        stops: [
          { time: "05:45 AM", name: "Taj Mahal Sunrise Monument of Love", category: "Heritage", cost: "₹50", costValue: 50, duration: "3.5h", desc: "Marvel at the translucent white marble changing shades as the morning sun rises.", tip: "Buy tickets online via ASI portal to skip the ticket window.", coords: [27.1751, 78.0421] },
          { time: "10:30 AM", name: "Traditional Mughlai Breakfast & Brunch", category: "Dining", cost: "₹350", costValue: 350, duration: "1.5h", desc: "Hot Bedmi Puri with spicy Aloo Sabzi and sweet Jalebi.", tip: "Deviram Sweets in Sadar.", coords: [27.1650, 78.0120] },
          { time: "01:30 PM", name: "Agra Fort & Jahangiri Mahal", category: "Fort", cost: "₹50", costValue: 50, duration: "2.5h", desc: "Explore the Diwan-i-Khas, Khas Mahal, and palatial apartments.", tip: "Composite entrance discounts apply if visiting Taj on same day.", coords: [27.1795, 78.0211] },
          { time: "04:30 PM", name: "Mehtab Bagh (Moonlight Sunset Garden)", category: "Scenic", cost: "₹25", costValue: 25, duration: "2h", desc: "Watch dusk settle on the rear of the Taj Mahal with golden river reflections.", tip: "Photographs from the riverbank are spectacular.", coords: [27.1800, 78.0430] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Fatehpur Sikri Imperial City & Petha Shopping",
        overnight: "Departure Transfer",
        transitSummary: "Agra to Fatehpur Sikri ~ 38 km (1h)",
        stops: [
          { time: "09:00 AM", name: "Fatehpur Sikri & Buland Darwaza", category: "Heritage", cost: "₹50", costValue: 50, duration: "3.5h", desc: "Step through the world's highest gateway into the tomb of Sufi saint Salim Chishti.", tip: "Tie a sacred red thread on the marble jali screens for good fortune.", coords: [27.0945, 77.6679] },
          { time: "01:30 PM", name: "Mughlai Royal Dining Lunch", category: "Dining", cost: "₹500", costValue: 500, duration: "1.5h", desc: "Taste authentic Murgh Mussallam, Dal Makhani, and Garlic Naan.", tip: "Pinch of Spice on Fatehabad Road.", coords: [27.1600, 78.0400] },
          { time: "03:30 PM", name: "Sadar Bazaar & Authentic Agra Petha Market", category: "Shopping", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Sample crystal translucent pumpkin sweets in mango, chocolate, and kesar flavours.", tip: "Petha stays fresh for 10-15 days.", coords: [27.1600, 78.0100] }
        ]
      }
    ],
    budgetBreakdown: { stay: 3800, food: 2500, activities: 1200, transport: 1500, shopping: 500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Printed/Digital ASI ticket barcode", "Sun protection"],
      clothing: ["Modest cotton clothes", "Slip-on walking shoes (shoe covers provided at Taj)", "Sunglasses"],
      gear: ["Power bank", "Camera (tripods strictly banned inside Taj)", "Water bottle"],
      health: ["Hand sanitizer", "Electrolyte powder", "Basic headache tablets"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI accepted everywhere in Agra.",
      transit: "Pre-booked private AC cab from Delhi or Agra Cantt railway station is most convenient.",
      tipping: "7-10% at restaurants; ₹150/day for private driver.",
      emergency: "Agra Tourist Police: 0562-2421204 | Emergency: 112.",
      etiquette: "Taj Mahal is closed on Fridays. No food or smoking items permitted inside security check.",
      phrases: [{ en: "Greetings", local: "Namaste" }, { en: "Thank you", local: "Shukriya" }]
    }
  },

  amritsar: {
    destination: "Amritsar, Punjab",
    days: 2,
    title: "Golden Temple & Patriotism: 2 Days in Amritsar",
    subtitle: "From divine serenity at Sri Harmandir Sahib and Jallianwala Bagh to the high-energy Wagah Border beating retreat and authentic Amritsari kulchas.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 8500,
    currency: "INR (₹)",
    coords: [31.6340, 74.8723], // Amritsar Center
    nearbyAttractions: [
      { name: "Sri Harmandir Sahib (Golden Temple)", category: "Spiritual", coords: [31.6200, 74.8765], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Gilded sanctum of the Sikh faith standing in the center of the holy Amrit Sarovar lake.", tip: "Cover your head with a scarf and wash your feet at the entrance pool." },
      { name: "Langar Hall of Golden Temple", category: "Culture", coords: [31.6190, 74.8770], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "World's largest free mega-kitchen serving hot dal, rotis, and kheer to 100,000 pilgrims daily.", tip: "Volunteering to roll rotis or wash plates is a deeply moving experience." },
      { name: "Jallianwala Bagh National Memorial", category: "Heritage", coords: [31.6210, 74.8800], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Historic memorial park bearing bullet marks from the 1919 massacre and the Martyrs' Well.", tip: "Sound and light show in the evening." },
      { name: "Attari-Wagah Border Beating Retreat Ceremony", category: "Patriotism", coords: [31.6040, 74.5730], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Thrilling military parade and simultaneous flag-lowering by Indian BSF and Pakistan Rangers.", tip: "Arrive by 3:00 PM to secure prime grandstand seating; bags not allowed." },
      { name: "Partition Museum & Heritage Town Hall", category: "Heritage", coords: [31.6250, 74.8780], ticketCost: "₹10", costValue: 10, budgetTier: "budget", desc: "World's first museum chronicling the traumatic 1947 partition of India through letters and audio.", tip: "Allow at least 2 hours to walk through all 14 galleries." },
      { name: "Kesar Da Dhaba for Authentic Kulcha & Dal", category: "Dining", coords: [31.6230, 74.8750], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Centenary dhaba established in 1916 serving slow-cooked Maa Ki Dal and layered butter parathas.", tip: "Wash it down with a giant brass tumbler of thick sweet lassi." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: Divine Golden Temple, Jallianwala Bagh & Langar",
        overnight: "Overnight in Amritsar Hotel",
        transitSummary: "Heritage street circuit ~ 6 km",
        stops: [
          { time: "08:30 AM", name: "Sri Harmandir Sahib (Golden Temple)", category: "Spiritual", cost: "Free Entry", costValue: 0, duration: "3h", desc: "Experience the calming Gurbani hymns and walk the Parikrama around the sacred sarovar.", tip: "Early morning or night illumination are both breathtaking.", coords: [31.6200, 74.8765] },
          { time: "11:30 AM", name: "Langar Hall of Golden Temple", category: "Culture", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Partake in the sacred community meal served with unconditional equality and love.", tip: "Sit on the floor mats in straight rows." },
          { time: "01:30 PM", name: "Jallianwala Bagh National Memorial", category: "Heritage", cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Pay homage at the eternal flame and inspect bullet marks preserved in the brick walls.", tip: "Located directly next to the Golden Temple plaza.", coords: [31.6210, 74.8800] },
          { time: "03:30 PM", name: "Partition Museum & Heritage Town Hall", category: "Heritage", cost: "₹10", costValue: 10, duration: "2h", desc: "Explore newspaper clippings, voice recordings, and migrant refugee trunks.", tip: "Audioguides available.", coords: [31.6250, 74.8780] },
          { time: "06:30 PM", name: "Kesar Da Dhaba for Authentic Kulcha & Dal", category: "Dining", cost: "₹350", costValue: 350, duration: "2h", desc: "Feast on slow-simmered 12-hour black dal and freshly roasted tandoori kulcha.", tip: "Order the Firni served in earthen pots for dessert.", coords: [31.6230, 74.8750] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Gobindgarh Fort & Wagah Border Ceremony",
        overnight: "Departure Transfer",
        transitSummary: "Amritsar to Wagah Border ~ 32 km (1h)",
        stops: [
          { time: "10:00 AM", name: "Gobindgarh Fort & Maharaja Ranjit Singh Museum", category: "Fort", coords: [31.6270, 74.8620], cost: "₹150", costValue: 150, duration: "2.5h", desc: "18th-century fortress guarding the Koh-i-Noor diamond with 7D show and martial arts.", tip: "Watch the Gatka Sikh martial arts performance.", coords: [31.6270, 74.8620] },
          { time: "01:00 PM", name: "Amritsari Stuffed Kulcha & Chole Lunch", category: "Dining", cost: "₹250", costValue: 250, duration: "1.5h", desc: "Crispy flaky potato-onion stuffed bread crushed by hand with melting white butter.", tip: "Bhai Kulwant Singh Kulchian Wale.", coords: [31.6240, 74.8790] },
          { time: "03:00 PM", name: "Attari-Wagah Border Beating Retreat Ceremony", category: "Patriotism", cost: "Free Entry", costValue: 0, duration: "3.5h", desc: "Experience the goose-stepping parade and thunderous cheers of Jai Hind.", tip: "Only carry your phone, wallet, and water bottle; handbags prohibited.", coords: [31.6040, 74.5730] }
        ]
      }
    ],
    budgetBreakdown: { stay: 3500, food: 2200, activities: 800, transport: 1500, shopping: 500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Cotton head scarf (mandatory at Golden Temple)", "Cash"],
      clothing: ["Modest ethnic Indian wear", "Slip-on walking shoes", "Sunhat for Wagah border"],
      gear: ["Power bank", "Camera", "Hand fan for Wagah ceremony"],
      health: ["Hand sanitizer", "Indigestion antacid tablets", "Wet wipes"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI accepted everywhere in Amritsar.",
      transit: "Auto rickshaws for old town; dedicated AC cab for Wagah border.",
      tipping: "7-10% in restaurants; ₹150 for cab driver.",
      emergency: "Amritsar Tourist Police: 0183-2541314 | Emergency: 112.",
      etiquette: "Cover your head completely before stepping into the Golden Temple perimeter. Tobacco is strictly banned.",
      phrases: [{ en: "Greetings", local: "Sat Sri Akal" }, { en: "Thank you", local: "Dhanvaad" }]
    }
  },

  shimla: {
    destination: "Shimla, Himachal Pradesh",
    days: 3,
    title: "Colonial Charm & Pine Ridges: 3 Days in Shimla",
    subtitle: "From the pedestrianized Ridge and historic Christ Church to Jakhoo Temple ropeway, Kufri alpine peaks, and Viceregal Lodge.",
    party: "Couple",
    budgetTier: "Moderate",
    costPerPerson: 13500,
    currency: "INR (₹)",
    coords: [31.1048, 77.1734], // Shimla Ridge
    nearbyAttractions: [
      { name: "The Ridge & Neo-Gothic Christ Church", category: "Heritage", coords: [31.1048, 77.1750], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Spacious open pedestrian promenade built in 1857 overlooking snow-capped Shivalik mountain peaks.", tip: "Best evening walking spot in Himachal." },
      { name: "Mall Road & Gaiety Heritage Theater", category: "Heritage", coords: [31.1030, 77.1720], ticketCost: "₹20", costValue: 20, budgetTier: "budget", desc: "Vehicle-free colonial avenue lined with Victorian lampposts, bookshops, and Himachali woolens.", tip: "Try the hot steamed momos at Tibetan Market." },
      { name: "Jakhoo Hill & 108ft Giant Hanuman Statue", category: "Temple", coords: [31.1010, 77.1850], ticketCost: "₹500", costValue: 500, budgetTier: "premium", desc: "Shimla's highest peak (2,455 m) reachable by modern aerial ropeway featuring the towering orange statue.", tip: "Keep spectacles and bags secure as Jakhoo monkeys are very quick." },
      { name: "Kufri Mahasu Peak & Himalayan Nature Park", category: "Nature", coords: [31.0980, 77.2680], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Alpine ski resort destination with yak rides, deodar pine forests, and monal pheasant bird sanctuary.", tip: "Pony ride takes you to Mahasu peak." },
      { name: "Indian Institute of Advanced Study (Viceregal Lodge)", category: "Heritage", coords: [31.1020, 77.1400], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Scottish baronial summer residence of British Viceroys where historic Partition roundtables were held.", tip: "Guided interior tour runs every 45 minutes." }
    ],
    daysPlan: [
      {
        day: 1,
        title: "Day 1: The Ridge, Mall Road & Jakhoo Ropeway",
        overnight: "Overnight in Shimla Hotel",
        transitSummary: "Shimla pedestrian town ~ 8 km",
        stops: [
          { time: "09:30 AM", name: "The Ridge & Neo-Gothic Christ Church", category: "Heritage", cost: "Free Entry", costValue: 0, duration: "2h", desc: "Admire the yellow neo-Gothic facade and stained-glass windows representing faith and hope.", tip: "Photograph the snow peak panorama from the Ridge railing.", coords: [31.1048, 77.1750] },
          { time: "12:00 PM", name: "Jakhoo Hill & 108ft Giant Hanuman Statue", category: "Temple", cost: "₹500", costValue: 500, duration: "2.5h", desc: "Board the aerial ropeway from Ridge to the summit of Jakhoo in 6 scenic minutes.", tip: "Return ropeway ticket is ₹500/person.", coords: [31.1010, 77.1850] },
          { time: "02:30 PM", name: "Mall Road Himachali Lunch & Stroll", category: "Dining", cost: "₹450", costValue: 450, duration: "2h", desc: "Savor Himachali Siddu with ghee, hot mutton thali, or wood-fired pizza at Cafe Sol.", tip: "Try the bakery pastries at Wake & Bake Cafe.", coords: [31.1030, 77.1720] },
          { time: "05:00 PM", name: "Mall Road & Gaiety Heritage Theater", category: "Shopping", cost: "₹20", costValue: 20, duration: "2.5h", desc: "Browse Lakkar Bazaar for wooden toys, walking sticks, and Kullu wool shawls.", tip: "Look for certified Himachal handloom seals.", coords: [31.1030, 77.1720] }
        ]
      },
      {
        day: 2,
        title: "Day 2: Kufri Alpine Snow Peaks & Nature Excursion",
        overnight: "Overnight in Shimla Hotel",
        transitSummary: "Shimla to Kufri ~ 16 km (45 mins)",
        stops: [
          { time: "09:30 AM", name: "Kufri Mahasu Peak & Himalayan Nature Park", category: "Nature", cost: "₹50", costValue: 50, duration: "3.5h", desc: "Ride ponies through pine forests and spot Himalayan monals, snow leopards, and brown bears.", tip: "Wear shoes with firm rubber grip.", coords: [31.0980, 77.2680] },
          { time: "01:30 PM", name: "Pine Wood Valley Dhaba Lunch", category: "Dining", cost: "₹400", costValue: 400, duration: "1.5h", desc: "Hot Rajma Chawal, Kadhi Pakoda, and fresh butter parathas with mountain valley views.", tip: "Sip hot ginger tea.", coords: [31.1000, 77.2500] },
          { time: "03:30 PM", name: "Green Valley Forest Overlook", category: "Scenic", coords: [31.1050, 77.2200], cost: "Free Entry", costValue: 0, duration: "1.5h", desc: "Dense deodar forest canopy stretching infinitely across the Himalayan folds.", tip: "Filming location for many classic Bollywood movies.", coords: [31.1050, 77.2200] }
        ]
      },
      {
        day: 3,
        title: "Day 3: Viceregal Lodge, Toy Train & Departure",
        overnight: "Departure Transfer to Kalka / Chandigarh",
        transitSummary: "Shimla to Kalka / Chandigarh ~ 90 km (3h)",
        stops: [
          { time: "09:30 AM", name: "Indian Institute of Advanced Study (Viceregal Lodge)", category: "Heritage", cost: "₹50", costValue: 50, duration: "2.5h", desc: "Marvel at Burma teak wood ceilings, ballroom chandeliers, and manicured English lawns.", tip: "Walk around the botanical garden grounds.", coords: [31.1020, 77.1400] },
          { time: "01:00 PM", name: "Kalka-Shimla Toy Train Joyride / Departure", category: "Heritage", coords: [31.1035, 77.1610], cost: "₹150", costValue: 150, duration: "2h", desc: "UNESCO mountain railway ride through 103 tunnels down to Kalka or transfer by road.", tip: "Drive back via the scenic 4-lane Himalayan expressway.", coords: [31.1035, 77.1610] }
        ]
      }
    ],
    budgetBreakdown: { stay: 5500, food: 3500, activities: 2000, transport: 2000, shopping: 500 },
    packingList: {
      essentials: ["Govt ID / Aadhaar card", "Cash for pony union", "Thermal layers / sweater"],
      clothing: ["Fleece jacket", "Comfortable walking shoes (steep pedestrian inclines)", "Warm woolen cap"],
      gear: ["Power bank", "Camera", "Compact umbrella for sudden mountain showers"],
      health: ["Motion sickness tablets for mountain highway", "Moisturizer", "Throat lozenges"]
    },
    guide: {
      currency: "Indian Rupees (₹). UPI works seamlessly across Shimla and Kufri.",
      transit: "Mall Road is pedestrian-only; private cabs drop you at the lift or tourism parking.",
      tipping: "7-10% at cafes; ₹200/day for private driver.",
      emergency: "Shimla Tourist Police: 0177-2812344 | Emergency: 112.",
      etiquette: "No vehicles allowed on Mall Road or the Ridge. Never feed monkeys on Jakhoo hill.",
      phrases: [{ en: "Greetings", local: "Namaste" }, { en: "Thank you", local: "Dhanyawaad" }]
    }
  },

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
if (typeof window !== 'undefined') {
  window.INDIAN_COORDS_LOOKUP = INDIAN_COORDS_LOOKUP;
}

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

// =====================================================================
// PHASE 2 & 4: GROUP SIZING, ROOMS & VEHICLE ALLOCATION HELPERS
// =====================================================================

function adjustCount(id, delta) {
  var input = document.getElementById(id);
  if (!input) return;
  var val = (parseInt(input.value) || 0) + delta;
  var min = parseInt(input.min) || 0;
  var max = parseInt(input.max) || 25;
  if (val >= min && val <= max) {
    input.value = val;
    updateVehicleAndRoomAllocation();
  }
}

function updateVehicleAndRoomAllocation() {
  var adults = parseInt(document.getElementById('adultsCountInput')?.value) || 2;
  var children = parseInt(document.getElementById('childrenCountInput')?.value) || 0;
  var roomPref = document.getElementById('roomSharingSelect')?.value || 'auto';

  // Calculate rooms
  if (window.TripMozyEngine) {
    var roomAlloc = window.TripMozyEngine.calculateRooms(adults, children, roomPref);
    var roomTextEl = document.getElementById('roomCountText');
    if (roomTextEl) roomTextEl.textContent = roomAlloc.description + ' required';

    var vehicleAlloc = window.TripMozyEngine.determineVehicleType(adults, children);
    var vehicleBadge = document.getElementById('vehicleBadgeDisplay');
    if (vehicleBadge) {
      var icon = vehicleAlloc.type === 'tempo' ? '🚐 ' : (vehicleAlloc.type === 'suv' ? '🚙 ' : '🚗 ');
      vehicleBadge.textContent = icon + vehicleAlloc.label;
    }
  }
}

async function handleFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const destination = document.getElementById('destinationInput').value.trim();
  if (!destination) {
    alert("Please enter a destination in India.");
    return;
  }

  const days = parseInt(document.getElementById('durationRange').value) || 4;
  const originCity = document.getElementById('originCityInput')?.value.trim() || "At Destination (Local Sightseeing)";
  const startDate = document.getElementById('startDateInput')?.value || "";
  const endDate = document.getElementById('endDateInput')?.value || "";
  const comp = document.querySelector('input[name="companion"]:checked')?.value || "Couple";
  let adults = 2;
  let children = 0;
  const adultsInput = document.getElementById('adultsCountInput');
  if (adultsInput) {
    adults = parseInt(adultsInput.value) || 2;
    children = parseInt(document.getElementById('childrenCountInput')?.value) || 0;
  } else {
    if (comp === 'Solo') { adults = 1; children = 0; }
    else if (comp === 'Couple') { adults = 2; children = 0; }
    else if (comp === 'Family') { adults = 2; children = 2; }
    else if (comp === 'Friends') { adults = 4; children = 0; }
  }
  const roomSharingPref = document.getElementById('roomSharingSelect')?.value || "auto";
  const transportPref = document.getElementById('transportPrefSelect')?.value || "private_cab";
  const travelStyle = document.querySelector('input[name="travelStyle"]:checked')?.value || "Standard Sightseeing";
  const companion = comp;
  const budgetTier = document.querySelector('input[name="budget"]:checked')?.value || "Moderate";
  const dietary = document.getElementById('dietaryPref')?.value || "Pure Vegetarian";
  const manualBudgetInput = Number(document.getElementById('manualTargetBudgetInput')?.value) || 0;
  const mapRadius = parseInt(document.getElementById('mapRadiusSelect')?.value) || 35;
  const mustVisit = document.getElementById('mustVisitInput')?.value.trim() || "";
  const placesAvoid = document.getElementById('placesAvoidInput')?.value.trim() || "";
  const seniorFriendly = document.getElementById('seniorFriendlyCb')?.checked || false;
  const childFriendly = document.getElementById('childFriendlyCb')?.checked || false;
  const mountainPacing = document.getElementById('mountainPacingCb')?.checked || false;

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

  // Generate Itinerary safely with try...catch...finally to GUARANTEE loading never freezes at 100%
  try {
    const tripPlan = generateIndianTripPlan({
      destination,
      originCity,
      startDate,
      endDate,
      baseCoords,
      days,
      adults,
      children,
      roomSharingPref,
      transportPref,
      travelStyle,
      companion,
      budgetTier,
      dietary,
      manualBudget: manualBudgetInput,
      interests: selectedInterests,
      radius: mapRadius,
      mustVisit,
      placesAvoid,
      seniorFriendly,
      childFriendly,
      mountainPacing
    });
    currentTrip = tripPlan;

    initManualBudgetState(tripPlan, manualBudgetInput);
    renderDashboard(tripPlan);
    populateCustomPlaceDayOptions();
  } catch (err) {
    console.error("Critical error during dashboard generation:", err);
  } finally {
    // ALWAYS remove loading section and reveal dashboard!
    const loadEl = document.getElementById('loadingSection');
    const dashEl = document.getElementById('itineraryDashboard');
    if (loadEl) loadEl.classList.add('hidden');
    if (dashEl) dashEl.classList.remove('hidden');
  }

  // Post-render enhancements
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
    switchTab('itinerary'); // Switch directly to itinerary so user immediately sees their real locations & custom spot tool!
    const dashEl = document.getElementById('itineraryDashboard');
    if (dashEl) dashEl.scrollIntoView({ behavior: 'smooth' });
  } catch (enhancementErr) {
    console.warn("Post-render enhancement warning:", enhancementErr);
  }
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

  // Run structured budget engine
  const accurateBudget = (window.TripMozyEngine && window.TripMozyEngine.calculateAccurateTripBudget)
    ? window.TripMozyEngine.calculateAccurateTripBudget({
        destination: params.destination,
        days: params.days,
        adults: params.adults || 2,
        children: params.children || 0,
        roomSharingPref: params.roomSharingPref || 'auto',
        transportPref: params.transportPref || 'private_cab',
        budgetTier: params.budgetTier || 'Moderate',
        dietaryPref: params.dietary || 'Pure Vegetarian',
        targetBudget: params.manualBudget || 0
      })
    : null;

  // Check preset first
  for (const key in INDIA_DESTINATIONS) {
    if (clean.includes(key)) {
      const preset = JSON.parse(JSON.stringify(INDIA_DESTINATIONS[key]));
      preset.originCity = params.originCity;
      preset.startDate = params.startDate;
      preset.endDate = params.endDate;
      preset.party = params.companion;
      preset.budgetTier = params.budgetTier;
      preset.radius = params.radius;
      preset.adults = params.adults || 2;
      preset.children = params.children || 0;
      preset.accurateBudget = accurateBudget;
      if (accurateBudget) {
        preset.costPerPerson = accurateBudget.costPerPerson;
        preset.grandTotalTrip = accurateBudget.grandTotalTrip;
        preset.roomAllocation = accurateBudget.roomAllocation;
        preset.vehicleAllocation = accurateBudget.vehicleAllocation;
      }

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

      // Attach date strings if startDate provided
      if (params.startDate) {
        var dObj = new Date(params.startDate);
        preset.daysPlan.forEach(function(d) {
          if (!isNaN(dObj.getTime())) {
            d.dateStr = dObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
            dObj.setDate(dObj.getDate() + 1);
          }
        });
      }

      // Ensure overnight stays are populated
      preset.daysPlan.forEach(function(d) {
        if (!d.overnight) d.overnight = "Overnight in " + preset.destination;
      });

      if (typeof validateTripPlanSchema === 'function') {
        validateTripPlanSchema(preset);
      }

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

  // Verified Real Landmarks & Attractions Registry across India
  const INDIAN_CITY_REAL_ATTRACTIONS = {
    delhi: [
      { name: "Red Fort (Lal Qila) & Diwan-i-Khas", category: "Heritage", coords: [28.6562, 77.2410], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "17th-century Mughal red sandstone imperial palace citadel.", tip: "Sound and light show in the evening." },
      { name: "Qutub Minar & Iron Pillar", category: "Heritage", coords: [28.5244, 77.1855], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "73-meter victory tower and ancient rust-resistant metallurgical marvel.", tip: "Arrive at sunrise for soft golden lighting on carvings." },
      { name: "India Gate & Kartavya Path Promenade", category: "Patriotism", coords: [28.6129, 77.2295], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Iconic war memorial archway surrounded by sprawling lawns and evening fountains.", tip: "Try the street ice creams and bhelpuri." },
      { name: "Lotus Temple (Bahá'í House of Worship)", category: "Spiritual", coords: [28.5535, 77.2588], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Pristine white Greek marble lotus petals open to all faiths for silent meditation.", tip: "Shoes removed at the manicured garden gate." },
      { name: "Humayun's Tomb Garden Complex", category: "Heritage", coords: [28.5933, 77.2507], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "UNESCO World Heritage garden tomb that inspired the Taj Mahal.", tip: "Beautiful geometric water channels." },
      { name: "Chandni Chowk & Paranthe Wali Gali", category: "Shopping", coords: [28.6505, 77.2303], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Centuries-old market lanes with deep-fried stuffed parathas and spice bazaar.", tip: "Take an e-rickshaw through the narrow alleys." },
      { name: "Akshardham Grand Temple & Musical Fountain", category: "Spiritual", coords: [28.6127, 77.2773], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Ornate pink stone temple complex with robotic cultural exhibits and water show.", tip: "Mobile phones deposited securely at outer locker." },
      { name: "Gurudwara Bangla Sahib & Pavitra Sarovar", category: "Spiritual", coords: [28.6263, 77.2090], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Prominent Sikh house of worship with golden dome, holy water pool, and 24/7 langar.", tip: "Head coverings available at entrance." }
    ],
    mumbai: [
      { name: "Gateway of India & Mumbai Harbour", category: "Heritage", coords: [18.9220, 72.8347], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Iconic 1911 basalt arch monument facing the Arabian Sea and historic Taj Mahal Palace hotel.", tip: "Take a harbor ferry for sea breezes." },
      { name: "Marine Drive Queen's Necklace Promenade", category: "Scenic", coords: [18.9430, 72.8230], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "3.6 km C-shaped coastal boulevard glistening with curved yellow streetlights at night.", tip: "Sit on the tetrapods and feel the Arabian sea spray." },
      { name: "Elephanta Caves UNESCO Rock-cut Temples", category: "Heritage", coords: [18.9633, 72.9315], ticketCost: "₹40", costValue: 40, budgetTier: "budget", desc: "6th-century rock-cut cave temples dedicated to Shiva including the famous Trimurti sculpture.", tip: "Ferry leaves from Gateway of India every 30 mins." },
      { name: "Chhatrapati Shivaji Maharaj Terminus (CSMT)", category: "Heritage", coords: [18.9398, 72.8355], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Victorian Gothic UNESCO railway headquarters illuminated in multi-colored LEDs at dusk.", tip: "Photograph from the heritage pedestrian viewing gallery." },
      { name: "Bandra-Worli Sea Link & Bandstand", category: "Scenic", coords: [19.0300, 72.8200], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "8-lane cable-stayed bridge spanning the open sea with views of celebrity bungalows.", tip: "Walk along Bandstand rocks for sunset." },
      { name: "Juhu Beach & Street Food Pav Bhaji", category: "Dining", coords: [19.0988, 72.8264], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Famous seaside sand stretch for buttery Mumbai Pav Bhaji, Sev Puri, and Kala Khatta gola.", tip: "Visit in the evening when stalls are bustling." },
      { name: "Siddhivinayak Ganpati Temple", category: "Temple", coords: [19.0168, 72.8303], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Venerated 1801 Ganesha temple with gold-plated sanctum dome.", tip: "Tuesdays are especially auspicious; book online darshan." }
    ],
    kolkata: [
      { name: "Victoria Memorial & Maidan Gardens", category: "Heritage", coords: [22.5448, 88.3426], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: "Magnificent white Makrana marble monument to Queen Victoria housing 25 art galleries.", tip: "Stroll the lush 64-acre landscaped gardens." },
      { name: "Howrah Bridge & Hooghly Flower Market", category: "Heritage", coords: [22.5851, 88.3468], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Iconic cantilever steel bridge over the sacred Hooghly river and vibrant marigold flower bazaar.", tip: "Early morning flower auction is a photographer's dream." },
      { name: "Dakshineswar Kali Temple & Belur Math", category: "Spiritual", coords: [22.6550, 88.3576], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "19th-century nine-spire Kali temple where mystic Ramakrishna Paramahamsa meditated.", tip: "Take a cross-river ferry to Belur Math." },
      { name: "Park Street & Historic Flurys Tea Room", category: "Dining", coords: [22.5535, 88.3524], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Cosmopolitan avenue lined with heritage English tearooms, jazz cafes, and colonial bakeries.", tip: "Try the rum balls and Darjeeling first-flush tea at Flurys." },
      { name: "Princep Ghat Riverfront Promenade", category: "Scenic", coords: [22.5560, 88.3320], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Colonial Greek-inlaid pavilion on the riverbank offering traditional wooden boat rides.", tip: "Enjoy hot tea and evening breeze under Vidyasagar Setu." }
    ],
    bengaluru: [
      { name: "Bangalore Palace & Royal Courtyard", category: "Heritage", coords: [12.9988, 77.5921], ticketCost: "₹250", costValue: 250, budgetTier: "moderate", desc: "Tudor-style wooden palace inspired by Windsor Castle with turreted battlements.", tip: "Audioguide included with entry." },
      { name: "Lalbagh Botanical Garden & Glass House", category: "Nature", coords: [12.9507, 77.5848], ticketCost: "₹25", costValue: 25, budgetTier: "budget", desc: "240-acre botanical haven founded by Hyder Ali with century-old trees and lotus pond.", tip: "Modeled after London's Crystal Palace." },
      { name: "Cubbon Park & Vidhana Soudha", category: "Heritage", coords: [12.9797, 77.5908], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Lush green lung of Bangalore adjacent to the grand Neo-Dravidian granite legislative assembly.", tip: "Sunday mornings are vehicle-free for cycling." },
      { name: "Tipu Sultan's Summer Palace", category: "Heritage", coords: [12.9593, 77.5737], ticketCost: "₹20", costValue: 20, budgetTier: "budget", desc: "1791 ornate teakwood palace with carved pillars, balconies, and floral frescoes.", tip: "Small archaeological museum inside." },
      { name: "Commercial Street & MTR Traditional Dosa", category: "Shopping", coords: [12.9822, 77.6083], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: "Vibrant shopping arcade for silks and Mysore sandalwood followed by crispy Benne Masala Dosa.", tip: "Try Mavalli Tiffin Room (MTR) filter coffee." }
    ]
  };

  // Check if destination matches any known city
  let matchedCityPois = null;
  const cleanDest = dest.toLowerCase();
  for (const cName in INDIAN_CITY_REAL_ATTRACTIONS) {
    if (cleanDest.includes(cName)) {
      matchedCityPois = INDIAN_CITY_REAL_ATTRACTIONS[cName];
      break;
    }
  }

  // Generate realistic nearby tourist attractions with real computed distances
  const nearbyAttractions = matchedCityPois ? JSON.parse(JSON.stringify(matchedCityPois)) : [
    { name: `${dest} Historic Fort & Heritage Ramparts`, category: "Fort", coords: [coords[0] + 0.018, coords[1] + 0.012], ticketCost: "₹50", costValue: 50, budgetTier: "budget", desc: `Historic ramparts guarding the heritage center of ${dest}.`, tip: "Arrive in the morning to beat the queues." },
    { name: `${dest} Sacred Ancient Temple & Teerth Kund`, category: "Temple", coords: [coords[0] - 0.014, coords[1] + 0.018], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: `Century-old stone temple revered by pilgrims across ${dest}.`, tip: "Dress modestly covering shoulders and knees." },
    { name: `${dest} Valley Viewpoint & Sunset Ridge`, category: "Scenic", coords: [coords[0] + 0.038, coords[1] - 0.025], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: `Elevated panoramic ridge looking over surrounding hills and valleys of ${dest}.`, tip: "Best photography light starts 45 mins before sunset." },
    { name: `${dest} Cascading Forest Waterfall & Nature Trail`, category: "Nature", coords: [coords[0] - 0.045, coords[1] - 0.035], ticketCost: "₹30", costValue: 30, budgetTier: "budget", desc: `Natural mountain stream cascading into rock pools amidst dense greenery.`, tip: "Wear trekking shoes with good grip." },
    { name: `${dest} Central Heritage Bazaar & Clock Tower`, category: "Shopping", coords: [coords[0] + 0.003, coords[1] + 0.004], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: `Bustling market arcades with regional spices, handicrafts, and sweet shops.`, tip: "Try hot local snacks and traditional sweets." },
    { name: `${dest} Botanical Lake Promenade & Boating Club`, category: "Nature", coords: [coords[0] + 0.022, coords[1] - 0.012], ticketCost: "₹100", costValue: 100, budgetTier: "budget", desc: `Lush manicured gardens with paddle boats and walking trails.`, tip: "Ideal for a relaxing afternoon stroll." },
    { name: `${dest} Royal Palace & Archaeological Museum`, category: "Heritage", coords: [coords[0] - 0.025, coords[1] + 0.030], ticketCost: "₹75", costValue: 75, budgetTier: "budget", desc: `Palace architecture showcasing royal palanquins, armor, and miniature art.`, tip: "Audio guide is recommended." },
    { name: `${dest} Riverfront Ghat & Evening Aarti Spot`, category: "Culture", coords: [coords[0] + 0.012, coords[1] + 0.024], ticketCost: "Free Entry", costValue: 0, budgetTier: "free", desc: `Stone steps leading to the sacred river where evening lamps are floated.`, tip: "Experience the mesmerizing brass lamp aarti ceremony." }
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

    var overnightPlace = "Overnight in " + dest;
    var transitDist = Math.round(15 + Math.random() * 20);
    var transitEst = (window.TripMozyEngine && window.TripMozyEngine.estimateTransferDuration)
      ? window.TripMozyEngine.estimateTransferDuration(transitDist, true)
      : transitDist + " km ~ 50 mins";

    daysPlan.push({
      day: d,
      title: `Day ${d}: ${theme} (${dest})`,
      overnight: overnightPlace,
      transitSummary: transitEst,
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
  
  var durText = trip.days + " Days";
  if (trip.startDate && trip.endDate) {
    durText += " (" + trip.startDate + " to " + trip.endDate + ")";
  }
  document.getElementById('dashDaysBadge').textContent = durText;

  var roomText = trip.roomAllocation ? trip.roomAllocation.description : "Double Rooms";
  document.getElementById('dashStyleBadge').textContent = trip.budgetTier + " Tier &middot; " + roomText;

  var paxText = (trip.adults || 2) + " Adults" + (trip.children ? ", " + trip.children + " Kids" : "");
  if (trip.vehicleAllocation) {
    paxText += " &middot; " + trip.vehicleAllocation.label;
  }
  document.getElementById('dashPartyBadge').textContent = paxText;

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

  // Render Dual-Plan Comparison (TripMozy Recommendation vs User Target Budget)
  renderDualPlanComparison(trip);

  // Render Packing & Guide
  renderPacking(trip);
  renderGuide(trip);
}

// DUAL-PLAN COMPARISON ENGINE
function renderDualPlanComparison(trip) {
  var banner = document.getElementById('dualPlanComparisonBanner');
  if (!banner) return;

  var analysis = trip.accurateBudget?.budgetAnalysis;
  if (analysis && analysis.hasTarget && analysis.optimizedPlan) {
    banner.classList.remove('hidden');

    var rec = analysis.recommendedPlan;
    var opt = analysis.optimizedPlan;

    var costRecEl = document.getElementById('dualCostRecommended');
    var costOptEl = document.getElementById('dualCostTarget');
    var titleOptEl = document.getElementById('dualTitleTarget');
    var descOptEl = document.getElementById('dualDescTarget');

    if (costRecEl) costRecEl.textContent = formatINR(rec.costPerPerson);
    if (costOptEl) costOptEl.textContent = formatINR(opt.costPerPerson);
    if (titleOptEl) titleOptEl.textContent = "Custom Plan (Under ₹" + Number(analysis.targetPerPerson).toLocaleString('en-IN') + " Limit)";
    if (descOptEl) {
      descOptEl.textContent = "Analyzed strictly under your ₹" + Number(analysis.targetPerPerson).toLocaleString('en-IN') + "/person limit: verified clean homestays, smart transfers, and regional dhabas.";
    }

    // Default to the optimized plan so the customer immediately sees their trip under their limit
    selectActiveBudgetPlan('target');
  } else {
    banner.classList.add('hidden');
  }
}

function selectActiveBudgetPlan(planType) {
  if (!currentTrip || !currentTrip.accurateBudget || !currentTrip.accurateBudget.budgetAnalysis) return;
  var analysis = currentTrip.accurateBudget.budgetAnalysis;
  var rec = analysis.recommendedPlan;
  var opt = analysis.optimizedPlan;
  if (!rec || !opt) return;

  var cardRec = document.getElementById('planCardRecommended');
  var cardOpt = document.getElementById('planCardTarget');
  var badgeRec = document.getElementById('badgePlanRecommended');
  var badgeOpt = document.getElementById('badgePlanTarget');
  var totalBudgetEl = document.getElementById('dashTotalBudget');

  if (planType === 'target') {
    // Select Target Plan (Under Budget)
    currentTrip.activePlanType = 'target';
    currentTrip.costPerPerson = opt.costPerPerson;
    currentTrip.grandTotalTrip = opt.grandTotalTrip;
    currentTrip.selectedPlanTitle = opt.title;

    manualBudgetState = {
      stay: opt.breakdownPerPerson.stay,
      transport: opt.breakdownPerPerson.transport,
      food: opt.breakdownPerPerson.food,
      activities: opt.breakdownPerPerson.activities,
      shopping: opt.breakdownPerPerson.shopping
    };

    if (cardOpt) {
      cardOpt.className = 'p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 cursor-pointer shadow-md relative';
    }
    if (badgeOpt) badgeOpt.classList.remove('hidden');

    if (cardRec) {
      cardRec.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white cursor-pointer hover:border-blue-400 hover:shadow-xs relative';
    }
    if (badgeRec) badgeRec.classList.add('hidden');

    if (totalBudgetEl) {
      totalBudgetEl.textContent = formatINR(opt.costPerPerson);
      totalBudgetEl.className = 'text-2xl font-black text-emerald-700 font-heading';
    }
  } else {
    // Select Recommended Plan (TripMozy Preference)
    currentTrip.activePlanType = 'recommended';
    currentTrip.costPerPerson = rec.costPerPerson;
    currentTrip.grandTotalTrip = rec.grandTotalTrip;
    currentTrip.selectedPlanTitle = rec.title;

    manualBudgetState = {
      stay: rec.breakdownPerPerson.stay,
      transport: rec.breakdownPerPerson.transport,
      food: rec.breakdownPerPerson.food,
      activities: rec.breakdownPerPerson.activities,
      shopping: rec.breakdownPerPerson.shopping
    };

    if (cardRec) {
      cardRec.className = 'p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/50 cursor-pointer shadow-md relative';
    }
    if (badgeRec) badgeRec.classList.remove('hidden');

    if (cardOpt) {
      cardOpt.className = 'p-4 rounded-2xl border-2 border-slate-200 bg-white cursor-pointer hover:border-emerald-400 hover:shadow-xs relative';
    }
    if (badgeOpt) badgeOpt.classList.add('hidden');

    if (totalBudgetEl) {
      totalBudgetEl.textContent = formatINR(rec.costPerPerson);
      totalBudgetEl.className = 'text-2xl font-black text-blue-700 font-heading';
    }
  }

  // Update budget tab inputs and variance
  const categories = ['stay', 'transport', 'food', 'activities', 'shopping'];
  categories.forEach(k => {
    var inputEl = document.querySelector(`input[oninput*="'${k}'"]`);
    if (inputEl) inputEl.value = manualBudgetState[k];
  });

  updateBudgetTotalsAndChart();
  lucide.createIcons();
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

  // Safely check if Leaflet (L) library is available
  if (typeof L === 'undefined') return;

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
let currentAttractionBudgetFilter = 'all';

function filterAttractionsByBudget(filterType) {
  currentAttractionBudgetFilter = filterType;

  // Update button active state
  document.querySelectorAll('.budget-filter-pill').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'font-bold', 'shadow-xs');
    btn.classList.add('bg-white');
  });

  const activeBtn = document.getElementById('budgetFilterBtn-' + filterType);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'font-bold', 'shadow-xs');
  }

  if (currentTrip) {
    renderNearbyAttractionsList(currentTrip);
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}

function renderNearbyAttractionsList(trip) {
  const container = document.getElementById('nearbyAttractionsList');
  if (!container) return;
  container.innerHTML = '';

  let places = (trip.nearbyAttractions || []).map(p => {
    // Normalise ticket cost & budget tier if missing
    let costVal = p.costValue !== undefined ? p.costValue : 0;
    if (costVal === 0 && p.ticketCost && p.ticketCost !== 'Free Entry' && p.ticketCost !== '₹0') {
      costVal = parseInt(String(p.ticketCost).replace(/[^0-9]/g, '')) || 0;
    }
    let costText = p.ticketCost || (costVal > 0 ? formatINR(costVal) : 'Free Entry');
    let tier = p.budgetTier;
    if (!tier) {
      if (costVal === 0 || costText === 'Free Entry') tier = 'free';
      else if (costVal <= 100) tier = 'budget';
      else if (costVal <= 500) tier = 'moderate';
      else tier = 'premium';
    }
    return { ...p, costValue: costVal, ticketCost: costText, budgetTier: tier };
  });

  // Apply Budget Filter
  if (currentAttractionBudgetFilter === 'free') {
    places = places.filter(p => p.costValue === 0 || p.ticketCost === 'Free Entry');
  } else if (currentAttractionBudgetFilter === 'budget') {
    places = places.filter(p => p.costValue > 0 && p.costValue <= 100);
  } else if (currentAttractionBudgetFilter === 'moderate') {
    places = places.filter(p => p.costValue > 100 && p.costValue <= 500);
  } else if (currentAttractionBudgetFilter === 'premium') {
    places = places.filter(p => p.costValue > 500);
  } else if (currentAttractionBudgetFilter === 'sort_cost') {
    places.sort((a, b) => a.costValue - b.costValue);
  }

  const countPill = document.getElementById('nearbyCountPill');
  if (countPill) countPill.textContent = `${places.length} Spots`;

  if (places.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
        <i data-lucide="info" class="w-5 h-5 mx-auto text-slate-400 mb-1"></i>
        <span>No tourist places in this budget filter category. Select 'All Spots' to see all ${trip.nearbyAttractions?.length || 0} locations.</span>
      </div>
    `;
    return;
  }

  places.forEach((poi, index) => {
    let budgetBadge = '';
    if (poi.costValue === 0 || poi.ticketCost === 'Free Entry') {
      budgetBadge = '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Free Entry</span>';
    } else if (poi.costValue <= 100) {
      budgetBadge = `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">🟡 ${poi.ticketCost}</span>`;
    } else if (poi.costValue <= 500) {
      budgetBadge = `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">🔵 ${poi.ticketCost}</span>`;
    } else {
      budgetBadge = `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">🟣 ${poi.ticketCost}</span>`;
    }

    container.innerHTML += `
      <div class="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition text-left group">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-grow">
            <h5 class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug cursor-pointer" onclick="focusMapLocation(${poi.coords[0]}, ${poi.coords[1]}, '${poi.name.replace(/'/g, "\\'")}')">
              ${poi.name}
            </h5>
            <div class="flex items-center gap-1.5 mt-1 flex-wrap">
              <span class="text-[10px] text-slate-500 font-medium">${poi.category || 'Sightseeing'}</span>
              <span class="text-slate-300">&bull;</span>
              ${budgetBadge}
            </div>
          </div>
          <span class="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
            ${poi.distKm || 0} km
          </span>
        </div>
        <p class="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
          ${poi.desc || ''}
        </p>
        <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <button type="button" onclick="focusMapLocation(${poi.coords[0]}, ${poi.coords[1]}, '${poi.name.replace(/'/g, "\\'")}')" class="text-blue-600 hover:underline font-bold flex items-center gap-1">
            <i data-lucide="crosshair" class="w-3 h-3"></i> View on Map
          </button>
          <button type="button" onclick="promptAddAttractionToDay('${poi.name.replace(/'/g, "\\'")}', '${poi.category || 'Sightseeing'}', '${poi.ticketCost}', ${poi.coords[0]}, ${poi.coords[1]})" class="btn-white px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center gap-1">
            <i data-lucide="plus" class="w-3 h-3"></i> Add to Day
          </button>
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

  daysPlan.forEach((day, dayIndex) => {
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

            <h4 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-2 flex-wrap">
              <span>${stop.name}</span>
              ${stop.isCustom ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">✨ Custom Spot</span>` : ''}
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
              ${stop.isCustom ? `<button onclick="removeCustomTouristPlace(${dayIndex}, ${index})" class="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold transition text-xs ml-3"><i data-lucide="trash-2" class="w-3 h-3"></i> Remove</button>` : ''}
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
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
              D${day.day}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-bold text-slate-900 font-heading">${day.title}</h3>
                ${day.dateStr ? `<span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">${day.dateStr}</span>` : ''}
              </div>
              <div class="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span>${day.stops.length} curated stops</span>
                ${day.overnight ? `<span class="text-blue-700 font-semibold flex items-center gap-1">🌙 ${day.overnight}</span>` : ''}
                ${day.transitSummary ? `<span class="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">🚗 ${day.transitSummary}</span>` : ''}
              </div>
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

  var stayLabel = (trip.accurateBudget && trip.accurateBudget.itemizedBreakdown)
    ? trip.accurateBudget.itemizedBreakdown.accommodation.label
    : "Hotels & Stays";

  var cabLabel = (trip.accurateBudget && trip.accurateBudget.itemizedBreakdown)
    ? trip.accurateBudget.itemizedBreakdown.transport.label
    : "Dedicated Cab & Fuel";

  const categories = [
    { key: "stay", name: stayLabel, aiVal: b.stay, icon: "bed", color: "bg-blue-500" },
    { key: "transport", name: cabLabel, aiVal: b.transport, icon: "car", color: "bg-emerald-500" },
    { key: "food", name: "Meals & Dining (" + (trip.dietary || 'Standard') + ")", aiVal: b.food, icon: "utensils", color: "bg-amber-500" },
    { key: "activities", name: "Sightseeing, Monuments & Activities", aiVal: b.activities, icon: "ticket", color: "bg-purple-500" },
    { key: "shopping", name: "Contingency Buffer & Misc", aiVal: b.shopping, icon: "shield-alert", color: "bg-rose-500" }
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

  // Render Budget Shortfall / Recommendation Banner
  const varianceBanner = document.getElementById('budgetVarianceBanner');
  if (varianceBanner && trip.accurateBudget && trip.accurateBudget.budgetAnalysis && trip.accurateBudget.budgetAnalysis.recommendation) {
    const analysis = trip.accurateBudget.budgetAnalysis;
    var bgClass = analysis.status === 'shortfall' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900';
    varianceBanner.className = 'mt-4 p-3.5 rounded-xl border text-xs w-full text-left leading-relaxed ' + bgClass;

    var bannerContent = '<strong>Budget Intelligence:</strong> ' + analysis.recommendation;
    if (analysis.hasTarget && analysis.optimizedPlan) {
      bannerContent += '<div class="mt-2.5 pt-2 border-t border-amber-200/90 flex flex-wrap items-center gap-3 font-semibold text-xs">' +
        '<span class="text-blue-900 flex items-center gap-1"><i data-lucide="sparkles" class="w-3.5 h-3.5 text-blue-600"></i> TripMozy Recommended: <strong>' + formatINR(analysis.recommendedPlan.costPerPerson) + '/person</strong></span>' +
        '<span class="text-slate-400">•</span>' +
        '<span class="text-emerald-900 flex items-center gap-1"><i data-lucide="target" class="w-3.5 h-3.5 text-emerald-600"></i> Custom Plan (Under ₹' + Number(analysis.targetPerPerson).toLocaleString('en-IN') + '): <strong>' + formatINR(analysis.optimizedPlan.costPerPerson) + '/person</strong></span>' +
      '</div>';
    }
    varianceBanner.innerHTML = bannerContent;
  }

  // Render Included vs Excluded Expenses List if container exists or append
  let inclusionsEl = document.getElementById('budgetInclusionsBox');
  if (!inclusionsEl) {
    inclusionsEl = document.createElement('div');
    inclusionsEl.id = 'budgetInclusionsBox';
    inclusionsEl.className = 'mt-5 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs';
    inclusionsEl.innerHTML = `
      <div class="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
        <h5 class="font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
          <span>Included in Calculation</span>
        </h5>
        <ul class="space-y-1.5 text-emerald-950 font-medium list-disc pl-4">
          <li>Hotel stay in verified partner properties with morning breakfast</li>
          <li>Dedicated private vehicle with fuel, parking, tolls &amp; driver allowance</li>
          <li>All scheduled sightseeing transfers &amp; pickup/drop</li>
          <li>State tourist entry taxes and inner permits where specified</li>
          <li>TripMozy 24x7 on-trip phone &amp; WhatsApp coordination</li>
        </ul>
      </div>
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <h5 class="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
          <i data-lucide="x-circle" class="w-4 h-4 text-slate-400"></i>
          <span>Excluded / Optional Extras</span>
        </h5>
        <ul class="space-y-1.5 text-slate-600 list-disc pl-4">
          <li>Personal shopping, souvenirs &amp; personal expenses</li>
          <li>Optional adventure activities (paragliding, scuba, snow quad)</li>
          <li>Lunch, alcoholic beverages &amp; room service</li>
          <li>Applicable GST on final hotel invoices</li>
        </ul>
      </div>
    `;
    listContainer.parentElement.appendChild(inclusionsEl);
  }

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
  if (typeof Chart === 'undefined') return;

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
  if (existing && existing.remove) existing.remove(); else if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

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


// =====================================================================
// PHASE 7: STRUCTURED SCHEMA VALIDATION & INTEGRITY CHECKER
// =====================================================================
function validateTripPlanSchema(plan) {
  if (!plan || typeof plan !== 'object') {
    throw new Error("Invalid itinerary object generated.");
  }
  if (!plan.destination || typeof plan.destination !== 'string') {
    throw new Error("Missing destination name.");
  }
  if (!plan.days || plan.days < 1 || plan.days > 30) {
    throw new Error("Invalid trip duration: " + plan.days);
  }
  if (!Array.isArray(plan.daysPlan) || plan.daysPlan.length !== plan.days) {
    console.warn("Day plan length mismatch. Auto-correcting to exact duration of " + plan.days + " days.");
    if (Array.isArray(plan.daysPlan) && plan.daysPlan.length > plan.days) {
      plan.daysPlan = plan.daysPlan.slice(0, plan.days);
    }
  }

  // Ensure each day has valid stops, overnight and transit details
  plan.daysPlan.forEach(function(day, idx) {
    day.day = idx + 1;
    if (!day.title) day.title = "Day " + (idx + 1) + ": Exploring " + plan.destination;
    if (!day.overnight) day.overnight = "Overnight in " + plan.destination;
    if (!Array.isArray(day.stops) || day.stops.length === 0) {
      day.stops = [
        { time: "09:30 AM", name: plan.destination + " Cultural & Heritage Stroll", category: "Culture", cost: "₹0", duration: "2.5h", desc: "Leisure morning walk through historic quarters.", tip: "Comfortable shoes recommended." },
        { time: "01:00 PM", name: "Regional Lunch Break", category: "Dining", cost: "₹450", duration: "1.5h", desc: "Enjoy hot local specialties.", tip: "Ask for freshly cooked seasonal specials." },
        { time: "04:30 PM", name: plan.destination + " Panoramic Sunset View", category: "Scenic", cost: "₹0", duration: "2h", desc: "Watch twilight over the hills.", tip: "Great photography spot." }
      ];
    }
  });

  // Ensure cost per person is non-negative and finite
  if (!plan.costPerPerson || plan.costPerPerson <= 0 || !isFinite(plan.costPerPerson)) {
    plan.costPerPerson = Math.round(plan.days * 4500);
  }

  return true;
}


// =====================================================================
// PHASE 9: TRIPMOZY OFFICIAL QUOTE MODAL & WHATSAPP INTEGRATION
// =====================================================================

function openTripmozyWhatsApp() {
  if (!currentTrip) {
    window.open('https://wa.me/919641866181?text=' + encodeURIComponent('Hello TripMozy! I would like to inquire about holiday packages.'), '_blank');
    return;
  }
  var budgetInfo = currentTrip.accurateBudget || {
    adults: currentTrip.adults || 2,
    children: currentTrip.children || 0,
    costPerPerson: currentTrip.costPerPerson,
    grandTotalTrip: currentTrip.grandTotalTrip || (currentTrip.costPerPerson * (currentTrip.adults || 2)),
    roomAllocation: currentTrip.roomAllocation || { description: "Double Rooms" },
    vehicleAllocation: currentTrip.vehicleAllocation || { label: "Private Dedicated Cab" }
  };

  var waUrl = (window.TripMozyEngine && window.TripMozyEngine.buildTripmozyWhatsAppUrl)
    ? window.TripMozyEngine.buildTripmozyWhatsAppUrl(currentTrip, budgetInfo)
    : 'https://wa.me/919641866181?text=' + encodeURIComponent('Hello TripMozy! I want to book a trip to ' + currentTrip.destination);

  window.open(waUrl, '_blank');
}

function openQuoteModal() {
  var modal = document.getElementById('quoteModal');
  if (modal) {
    modal.classList.remove('hidden');
    // Pre-fill trip details
    var destInput = document.getElementById('quoteDest');
    var durInput = document.getElementById('quoteDuration');
    var paxInput = document.getElementById('quotePax');
    var budgetInput = document.getElementById('quoteBudget');

    if (currentTrip) {
      if (destInput) destInput.value = currentTrip.destination;
      if (durInput) durInput.value = currentTrip.days + ' Days (' + (currentTrip.days - 1) + ' Nights)';
      if (paxInput) {
        var adults = currentTrip.adults || 2;
        var children = currentTrip.children || 0;
        var party = currentTrip.party || 'Couple';
        paxInput.value = adults + ' Adults' + (children ? ', ' + children + ' Children' : '') + ' (' + party + ')';
      }
      if (budgetInput) {
        var cost = currentTrip.costPerPerson ? '₹' + currentTrip.costPerPerson.toLocaleString('en-IN') + ' / person' : 'Custom Quote';
        if (currentTrip.selectedPlanTitle) {
          cost += ' [' + currentTrip.selectedPlanTitle + ']';
        } else if (currentTrip.grandTotalTrip) {
          cost += ' (Total: ₹' + currentTrip.grandTotalTrip.toLocaleString('en-IN') + ')';
        }
        budgetInput.value = cost;
      }
    } else {
      var destVal = document.getElementById('destinationInput')?.value.trim() || 'Custom Indian Holiday';
      var durVal = document.getElementById('durationRange')?.value || 4;
      var compVal = document.querySelector('input[name="companion"]:checked')?.value || 'Couple';
      if (destInput) destInput.value = destVal;
      if (durInput) durInput.value = durVal + ' Days (' + (durVal - 1) + ' Nights)';
      if (paxInput) paxInput.value = compVal;
      if (budgetInput) budgetInput.value = 'Quote on Request';
    }
  }
}

function closeQuoteModal() {
  var modal = document.getElementById('quoteModal');
  if (modal) modal.classList.add('hidden');
}

function viewSavedQuoteLeads() {
  var box = document.getElementById('savedLeadsBox');
  var list = document.getElementById('savedLeadsList');
  if (!box || !list) return;

  if (!box.classList.contains('hidden')) {
    box.classList.add('hidden');
    return;
  }

  box.classList.remove('hidden');
  var leads = [];
  try {
    leads = JSON.parse(localStorage.getItem('tripmozy_quotation_leads') || '[]');
  } catch (e) {
    leads = [];
  }

  if (leads.length === 0) {
    list.innerHTML = '<div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">No saved quotations yet. Submit a quote request above to view it here.</div>';
    return;
  }

  list.innerHTML = leads.map(function(lead) {
    return '<div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">' +
      '<div class="flex items-center justify-between font-bold text-slate-800">' +
        '<span>' + lead.customerName + ' · ' + lead.phone + '</span>' +
        '<span class="text-[10px] text-blue-600 font-semibold">' + (new Date(lead.timestamp).toLocaleDateString('en-IN')) + '</span>' +
      '</div>' +
      '<div class="text-[11px] text-slate-600">' + lead.destination + ' · ' + lead.duration + ' · ' + lead.budget + '</div>' +
      (lead.notes && lead.notes !== 'None' ? ('<div class="text-[10px] text-slate-500 italic">"' + lead.notes + '"</div>') : '') +
    '</div>';
  }).join('');
}

function clearSavedQuoteLeads() {
  if (confirm("Clear all locally stored quotation leads?")) {
    localStorage.removeItem('tripmozy_quotation_leads');
    viewSavedQuoteLeads();
  }
}

function submitTripmozyQuote(e) {
  if (e && e.preventDefault) e.preventDefault();

  var name = document.getElementById('quoteName')?.value.trim();
  var phone = document.getElementById('quotePhone')?.value.trim();
  var email = document.getElementById('quoteEmail')?.value.trim();
  var notes = document.getElementById('quoteNotes')?.value.trim();
  var consent = document.getElementById('quoteConsent')?.checked;

  if (!name || !phone) {
    alert("Please provide your name and contact phone number.");
    return;
  }

  // Validate Indian 10-digit phone
  var cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10) {
    alert("Please enter a valid 10-digit Indian phone/WhatsApp number.");
    return;
  }

  if (!consent) {
    alert("Please check the consent box allowing TripMozy Private Limited to share your quotation.");
    return;
  }

  // 1. Save quotation lead into persistent storage (localStorage)
  var quoteData = {
    id: 'TM-' + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toISOString(),
    customerName: name,
    phone: '+91 ' + cleanPhone.slice(-10),
    email: email || 'N/A',
    destination: currentTrip ? currentTrip.destination : (document.getElementById('quoteDest')?.value || 'India'),
    duration: currentTrip ? (currentTrip.days + ' Days / ' + (currentTrip.days - 1) + ' Nights') : (document.getElementById('quoteDuration')?.value || '4 Days'),
    travelers: currentTrip ? ((currentTrip.adults || 2) + ' Adults' + (currentTrip.children ? ', ' + currentTrip.children + ' Children' : '') + ' (' + (currentTrip.party || 'Couple') + ')') : (document.getElementById('quotePax')?.value || '2 Adults'),
    budget: currentTrip && currentTrip.costPerPerson ? ('₹' + currentTrip.costPerPerson.toLocaleString('en-IN') + '/person') : (document.getElementById('quoteBudget')?.value || 'Standard Quote'),
    totalEstimated: currentTrip && currentTrip.grandTotalTrip ? ('₹' + currentTrip.grandTotalTrip.toLocaleString('en-IN')) : 'On Request',
    notes: notes || 'None'
  };

  try {
    var storedLeads = JSON.parse(localStorage.getItem('tripmozy_quotation_leads') || '[]');
    storedLeads.unshift(quoteData);
    localStorage.setItem('tripmozy_quotation_leads', JSON.stringify(storedLeads));
  } catch (err) {
    console.warn("Storage warning:", err);
  }

  // 2. Dispatch quotation lead directly to company email: tripmozy@gmail.com
  try {
    fetch('https://formsubmit.co/ajax/tripmozy@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: '🔔 New TripMozy Quote: ' + quoteData.destination + ' (' + quoteData.customerName + ')',
        _template: 'table',
        _captcha: 'false',
        'Customer Name': quoteData.customerName,
        'Mobile Number': quoteData.phone,
        'Email Address': quoteData.email,
        'Destination': quoteData.destination,
        'Duration': quoteData.duration,
        'Travelers': quoteData.travelers,
        'Estimated Budget': quoteData.budget,
        'Total Trip Cost': quoteData.totalEstimated,
        'Special Requirements': quoteData.notes,
        'Lead ID': quoteData.id,
        'Submitted At': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      console.log('Quotation lead successfully sent to tripmozy@gmail.com:', data);
    }).catch(function(err) {
      console.warn('Email dispatch warning:', err);
    });
  } catch (emailErr) {
    console.warn('Email service dispatch exception:', emailErr);
  }

  closeQuoteModal();

  // 3. Format detailed quotation message and deliver directly to TripMozy WhatsApp desk (+91 9641866181)
  var waMessage = "📋 *NEW TRIPMOZY OFFICIAL QUOTATION REQUEST*\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "👤 *Customer Name:* " + quoteData.customerName + "\n" +
    "📞 *Mobile/WhatsApp:* " + quoteData.phone + "\n" +
    (email ? ("📧 *Email:* " + email + "\n") : "") +
    "📍 *Destination:* " + quoteData.destination + "\n" +
    "⏱️ *Duration:* " + quoteData.duration + "\n" +
    "👥 *Travelers:* " + quoteData.travelers + "\n" +
    "💰 *Budget Estimate:* " + quoteData.budget + " (Total: " + quoteData.totalEstimated + ")\n" +
    (notes ? ("📝 *Special Requirements:* " + notes + "\n") : "") +
    "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "Please send me the confirmed itinerary quotation with live hotel availability. Thank you!";

  var waUrl = "https://wa.me/919641866181?text=" + encodeURIComponent(waMessage);

  // Auto-launch WhatsApp directly to send details to TripMozy
  window.open(waUrl, '_blank');

  // 4. Show celebratory confirmation toast with direct link
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;min-width:320px;max-width:92vw;background:linear-gradient(135deg,#16a34a,#15803d);color:white;border-radius:16px;padding:18px 24px;box-shadow:0 12px 40px rgba(0,0,0,0.3);text-align:center;font-family:inherit;animation:slideUpToast 0.4s ease;';
  toast.innerHTML = '<div style="font-size:28px;margin-bottom:6px;">🎉</div>' +
    '<div style="font-weight:800;font-size:16px;margin-bottom:4px;">Quote Details Sent to TripMozy!</div>' +
    '<div style="font-size:12px;opacity:0.95;margin-bottom:12px;">Thank you, ' + name + '! Your quote request has been emailed directly to <strong>tripmozy@gmail.com</strong> and sent to TripMozy WhatsApp (+91 9641866181). Our team will call you at +91 ' + cleanPhone.slice(-10) + ' within 30 minutes.</div>' +
    '<div style="display:flex;gap:8px;justify-content:center;">' +
      '<a href="' + waUrl + '" target="_blank" style="background:#25d366;color:#ffffff;font-weight:bold;font-size:12px;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;">💬 Open WhatsApp Enquiry</a>' +
      '<button onclick="this.parentElement.parentElement.remove();" style="background:rgba(255,255,255,0.2);color:white;font-weight:bold;font-size:12px;padding:8px 14px;border:none;border-radius:8px;cursor:pointer;">Close</button>' +
    '</div>';
  document.body.appendChild(toast);

  setTimeout(function() { if (toast.parentNode) toast.remove(); }, 12000);
}

// Conflict detector for dates vs duration slider
function checkDateConflict() {
  var startVal = document.getElementById('startDateInput')?.value;
  var endVal = document.getElementById('endDateInput')?.value;
  var conflictBanner = document.getElementById('dateConflictBanner');

  if (!startVal || !endVal) {
    if (conflictBanner) conflictBanner.classList.add('hidden');
    return;
  }

  var start = new Date(startVal);
  var end = new Date(endVal);
  var diffTime = end.getTime() - start.getTime();
  var calcDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;

  if (calcDays < 1) {
    if (conflictBanner) {
      conflictBanner.classList.remove('hidden');
      conflictBanner.innerHTML = '⚠️ Return date cannot be earlier than departure date.';
    }
    return;
  }

  var currentSliderDays = parseInt(document.getElementById('durationRange')?.value) || 4;
  if (calcDays !== currentSliderDays) {
    if (conflictBanner) {
      conflictBanner.classList.remove('hidden');
      conflictBanner.innerHTML = '<div class="flex items-center justify-between gap-3 text-xs">' +
        '<span>⚠️ Selected dates correspond to <strong>' + calcDays + ' Days</strong>, but slider is set to <strong>' + currentSliderDays + ' Days</strong>.</span>' +
        '<button type="button" onclick="setTripDays(' + calcDays + '); checkDateConflict();" class="px-2.5 py-1 bg-blue-600 text-white rounded font-bold whitespace-nowrap hover:bg-blue-700">Sync to ' + calcDays + ' Days</button>' +
      '</div>';
    }
  } else {
    if (conflictBanner) conflictBanner.classList.add('hidden');
  }
}

// Quick 1-Tap Refinement Handler (Phase 8)
function handleQuickRefine(type) {
  if (!currentTrip) return;

  if (type === 'reduce_budget') {
    if (currentTrip.budgetTier === 'Luxury') {
      currentTrip.budgetTier = 'Moderate';
    } else if (currentTrip.budgetTier === 'Moderate') {
      currentTrip.budgetTier = 'Economy';
    }
    // Recompute accurate budget
    if (window.TripMozyEngine) {
      currentTrip.accurateBudget = window.TripMozyEngine.calculateAccurateTripBudget({
        destination: currentTrip.destination,
        days: currentTrip.days,
        adults: currentTrip.adults || 2,
        children: currentTrip.children || 0,
        budgetTier: currentTrip.budgetTier,
        transportPref: currentTrip.transportPref || 'private_cab'
      });
      currentTrip.costPerPerson = currentTrip.accurateBudget.costPerPerson;
      currentTrip.grandTotalTrip = currentTrip.accurateBudget.grandTotalTrip;
    }
    renderDashboard(currentTrip);
    alert("💰 Adjusted itinerary to " + currentTrip.budgetTier + " tier with lower accommodation and transit costs!");
  } else if (type === 'relaxed') {
    // Relax pacing: ensure max 3 stops per day and insert afternoon leisure
    currentTrip.daysPlan.forEach(function(day) {
      if (day.stops.length > 3) {
        day.stops = day.stops.slice(0, 3);
      }
      day.stops.push({
        time: "04:30 PM",
        name: "Leisurely Afternoon Tea & Mountain Rest",
        category: "Relaxation",
        cost: "₹150",
        duration: "2h",
        desc: "Relax on scenic resort terrace with hot tea, snacks, and valley views.",
        tip: "Ideal for senior citizens and unwinding."
      });
    });
    renderDashboard(currentTrip);
    alert("🧘 Itinerary relaxed! Shortened daily travel and added leisure rest windows.");
  } else if (type === 'luxury') {
    currentTrip.budgetTier = 'Luxury';
    if (window.TripMozyEngine) {
      currentTrip.accurateBudget = window.TripMozyEngine.calculateAccurateTripBudget({
        destination: currentTrip.destination,
        days: currentTrip.days,
        adults: currentTrip.adults || 2,
        children: currentTrip.children || 0,
        budgetTier: 'Luxury',
        transportPref: 'private_cab'
      });
      currentTrip.costPerPerson = currentTrip.accurateBudget.costPerPerson;
      currentTrip.grandTotalTrip = currentTrip.accurateBudget.grandTotalTrip;
    }
    renderDashboard(currentTrip);
    alert("✨ Upgraded to 5★ Heritage Luxury Tier with private SUV allocation!");
  } else if (type === 'child_friendly') {
    currentTrip.daysPlan.forEach(function(day) {
      day.stops.push({
        time: "03:30 PM",
        name: "Family Boating & Children Park Play",
        category: "Nature",
        cost: "₹200",
        duration: "1.5h",
        desc: "Safe manicured garden park with paddle boats and swings for kids.",
        tip: "Child-friendly activity."
      });
    });
    renderDashboard(currentTrip);
    alert("👨‍👩‍👧‍👦 Enhanced for kids! Added family park and boating activities.");
  } else if (type === 'add_nature') {
    currentTrip.daysPlan.forEach(function(day) {
      day.stops.push({
        time: "02:30 PM",
        name: "Hidden Pine Forest Trail & Waterfall Cascade",
        category: "Nature",
        cost: "₹50",
        duration: "2h",
        desc: "Untouched mountain stream cascading through pine forest.",
        tip: "Wear walking shoes."
      });
    });
    renderDashboard(currentTrip);
    alert("🌲 Added serene forest trail and waterfall spots to your days!");
  }
}


// ==========================================
// CUSTOM TOURIST PLACE MANAGEMENT FUNCTIONS
// ==========================================

function toggleCustomPlaceForm(forceOpen) {
  const card = document.getElementById('customPlaceFormCard');
  if (!card) return;
  const isCurrentlyOpen = !card.classList.contains('hidden');
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;

  if (shouldOpen) {
    card.classList.remove('hidden');
    populateCustomPlaceDayOptions();
    const nameInput = document.getElementById('customPlaceName');
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  } else {
    card.classList.add('hidden');
  }
}

function populateCustomPlaceDayOptions() {
  const daySelect = document.getElementById('customPlaceDay');
  if (!daySelect || !currentTrip || !currentTrip.daysPlan) return;

  daySelect.innerHTML = '';
  currentTrip.daysPlan.forEach((d, idx) => {
    const opt = document.createElement('option');
    opt.value = d.day || (idx + 1);
    opt.textContent = `Day ${d.day || (idx + 1)}: ${d.title ? d.title.split(':')[1] || d.title : 'Exploring ' + currentTrip.destination}`;
    daySelect.appendChild(opt);
  });
}

function handleCustomPlaceSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!currentTrip || !currentTrip.daysPlan) {
    alert("Please generate an itinerary first.");
    return;
  }

  const nameInput = document.getElementById('customPlaceName');
  const daySelect = document.getElementById('customPlaceDay');
  const timeSelect = document.getElementById('customPlaceTime');
  const catSelect = document.getElementById('customPlaceCategory');
  const costInput = document.getElementById('customPlaceCost');
  const tipInput = document.getElementById('customPlaceTip');

  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert("Please enter a tourist place name.");
    return;
  }

  const dayNum = parseInt(daySelect ? daySelect.value : 1) || 1;
  const dayIndex = Math.max(0, Math.min(currentTrip.daysPlan.length - 1, dayNum - 1));
  const timeVal = timeSelect ? timeSelect.value : "03:30 PM";
  const catVal = catSelect ? catSelect.value : "Sightseeing";
  const costNum = parseInt(costInput ? costInput.value : 0) || 0;
  const costFormatted = costNum > 0 ? formatINR(costNum) : "Free Entry";
  const tipVal = tipInput && tipInput.value.trim() ? tipInput.value.trim() : "Custom tourist spot added by you.";

  // Determine Coordinates: check lookup table or place near the day's existing spots
  let resolvedCoords = null;
  const cleanName = name.toLowerCase();
  for (const k in INDIAN_COORDS_LOOKUP) {
    if (cleanName.includes(k)) {
      resolvedCoords = INDIAN_COORDS_LOOKUP[k];
      break;
    }
  }

  if (!resolvedCoords) {
    const dayStops = currentTrip.daysPlan[dayIndex]?.stops;
    if (dayStops && dayStops.length > 0 && dayStops[0].coords) {
      const baseLat = dayStops[0].coords[0];
      const baseLng = dayStops[0].coords[1];
      const offsetLat = (Math.random() - 0.5) * 0.02;
      const offsetLng = (Math.random() - 0.5) * 0.02;
      resolvedCoords = [baseLat + offsetLat, baseLng + offsetLng];
    } else {
      resolvedCoords = [currentTrip.coords[0] + 0.01, currentTrip.coords[1] + 0.01];
    }
  }

  const newStop = {
    time: timeVal,
    name: name,
    category: catVal,
    cost: costFormatted,
    costValue: costNum,
    duration: "2h",
    desc: `Custom-added tourist place in ${currentTrip.destination} added by traveler.`,
    tip: tipVal,
    coords: resolvedCoords,
    isCustom: true
  };

  // Add to Day's stops
  if (!currentTrip.daysPlan[dayIndex].stops) currentTrip.daysPlan[dayIndex].stops = [];
  currentTrip.daysPlan[dayIndex].stops.push(newStop);

  // Also add to nearbyAttractions so it appears on the Map and Tourist Places list
  if (!currentTrip.nearbyAttractions) currentTrip.nearbyAttractions = [];
  const dist = getDistanceKm(currentTrip.coords[0], currentTrip.coords[1], resolvedCoords[0], resolvedCoords[1]);
  currentTrip.nearbyAttractions.unshift({
    name: name,
    category: catVal,
    coords: resolvedCoords,
    distKm: dist,
    ticketCost: costFormatted,
    costValue: costNum,
    budgetTier: costNum === 0 ? 'free' : (costNum <= 100 ? 'budget' : (costNum <= 500 ? 'moderate' : 'premium')),
    desc: `Custom-added tourist spot: ${tipVal}`,
    tip: tipVal,
    isCustom: true
  });

  // Re-render Timeline and Map
  renderItineraryTimeline(currentTrip.daysPlan);
  renderMapAndNearbyAttractions(currentTrip);

  // Reset & close form
  if (nameInput) nameInput.value = '';
  if (costInput) costInput.value = '';
  if (tipInput) tipInput.value = '';
  toggleCustomPlaceForm(false);

  // Show Toast
  showCustomSpotToast(`Added "${name}" to Day ${dayNum} itinerary!`);

  // Switch to that day's filter so user sees the newly added stop right away
  filterDay(dayNum);
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function removeCustomTouristPlace(dayIndex, stopIndex) {
  if (!currentTrip || !currentTrip.daysPlan || !currentTrip.daysPlan[dayIndex]) return;
  const removed = currentTrip.daysPlan[dayIndex].stops.splice(stopIndex, 1);
  renderItineraryTimeline(currentTrip.daysPlan);
  renderMapAndNearbyAttractions(currentTrip);
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  showCustomSpotToast(`Removed "${removed[0]?.name || 'place'}" from Day ${dayIndex + 1}.`);
}

function promptAddAttractionToDay(poiName, category, ticketCost, lat, lng) {
  if (!currentTrip || !currentTrip.daysPlan) return;
  const totalDays = currentTrip.daysPlan.length;
  const chosenDayStr = prompt(`Add "${poiName}" to which day? (Enter 1 to ${totalDays}):`, "1");
  if (!chosenDayStr) return;
  const dayNum = parseInt(chosenDayStr);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > totalDays) {
    alert(`Please enter a valid day between 1 and ${totalDays}.`);
    return;
  }

  const dayIndex = dayNum - 1;
  const costNum = parseInt(String(ticketCost).replace(/[^0-9]/g, '')) || 0;
  const newStop = {
    time: "03:30 PM",
    name: poiName,
    category: category || "Sightseeing",
    cost: ticketCost || "Free Entry",
    costValue: costNum,
    duration: "2h",
    desc: `Tourist place added from nearby attractions list.`,
    tip: "Added from recommended places list.",
    coords: [lat, lng],
    isCustom: true
  };

  currentTrip.daysPlan[dayIndex].stops.push(newStop);
  renderItineraryTimeline(currentTrip.daysPlan);
  renderMapAndNearbyAttractions(currentTrip);
  switchTab('itinerary');
  filterDay(dayNum);
  showCustomSpotToast(`Added "${poiName}" to Day ${dayNum} itinerary!`);
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function showCustomSpotToast(msg) {
  const existing = document.getElementById('customSpotToast');
  if (existing && typeof existing.remove === 'function') {
    existing.remove();
  } else if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const toast = document.createElement('div');
  toast.id = 'customSpotToast';
  toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all transform duration-300';
  toast.innerHTML = `<span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">✓</span> <span>${msg}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => { if (toast && toast.remove) toast.remove(); else if (toast && toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
  }, 3200);
}
