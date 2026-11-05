/**
 * TripMozy India Travel Engine & Intelligence Core
 * Accurate geographical clustering, transit calculations, seasonal advisories, 
 * permit rules, vehicle/room sizing, and structured budget formulas.
 * Dedicated to TripMozy Private Limited (https://www.tripmozy.com)
 * Official WhatsApp Support: +91 9641866181
 */

(function(root) {
  'use strict';

  const TRIPMOZY_WHATSAPP = '+919641866181';
  const TRIPMOZY_PHONE_DISPLAY = '+91 9641866181';

  // 1. VEHICLE SIZING & DAILY PRICING (in INR, includes vehicle, fuel, driver allowance, state taxes)
  const VEHICLE_CATALOG = {
    sedan: {
      name: "Sedan (Dzire / Etios)",
      capacity: 4,
      luggage: "2-3 Medium Bags",
      dailyRatePlain: 2800,
      dailyRateHill: 3400,
      recommendedFor: "Solo, Couple, Small Family (up to 3-4 pax)"
    },
    suv: {
      name: "SUV (Innova Crysta / Ertiga)",
      capacity: 6,
      luggage: "4-5 Medium Bags",
      dailyRatePlain: 3800,
      dailyRateHill: 4600,
      recommendedFor: "Family, Group of Friends (4 to 6 pax)"
    },
    tempo: {
      name: "Tempo Traveller (12-16 Seater)",
      capacity: 14,
      luggage: "10-12 Bags",
      dailyRatePlain: 5800,
      dailyRateHill: 7200,
      recommendedFor: "Large Family, Group (7 to 14 pax)"
    }
  };

  // 2. ROOM OCCUPANCY & TIER RATES (in INR per night per double room)
  const HOTEL_TIER_RATES = {
    Economy: {
      name: "Budget / Homestay / 2★",
      baseRatePerRoom: 1600,
      extraBedChild: 500,
      extraBedAdult: 700,
      typicalMealDayPerPerson: 450,
      desc: "Clean verified homestays, guest houses, and budget hotels with Wi-Fi and hot water."
    },
    Moderate: {
      name: "Standard 3★ / Boutique Resort",
      baseRatePerRoom: 3200,
      extraBedChild: 800,
      extraBedAdult: 1100,
      typicalMealDayPerPerson: 750,
      desc: "Reputed 3-star leisure hotels and heritage resorts with restaurant, breakfast, and mountain/valley views."
    },
    Premium: {
      name: "Premium 4★ / Luxury Heritage",
      baseRatePerRoom: 5500,
      extraBedChild: 1400,
      extraBedAdult: 1800,
      typicalMealDayPerPerson: 1200,
      desc: "Premium 4-star resorts, colonial tea estate bungalows, and riverfront properties with premium amenities."
    },
    Luxury: {
      name: "5★ Heritage / Palace / 5-Star Deluxe",
      baseRatePerRoom: 9500,
      extraBedChild: 2200,
      extraBedAdult: 2800,
      typicalMealDayPerPerson: 1900,
      desc: "Signature luxury palaces, 5-star properties, and luxury private pool villas with world-class hospitality."
    }
  };

  // 3. REGIONAL TRANSIT & GEOGRAPHY INTELLIGENCE (Hill vs Plain speeds, permits, closed days, seasonal warnings)
  const REGION_INTELLIGENCE = {
    darjeeling_sikkim: {
      regionName: "Darjeeling, Sikkim & Dooars",
      terrain: "Himalayan Hill Terrain",
      avgSpeedKmH: 24, // High elevation winding mountain ghats
      monsoonMonths: [6, 7, 8, 9], // June to Sept heavy rainfall & landslide alert
      permitRequired: true,
      permitDetails: "Sikkim requires Restricted Area Permit (RAP). Tsomgo Lake, Baba Mandir, and Nathula Pass require PAP with 2 passport photos & Govt ID. Nathula is strictly closed for tourists on Mondays & Tuesdays.",
      importantRules: [
        "Nathula Pass is closed on Mondays and Tuesdays.",
        "North Sikkim (Lachung/Lachen) requires permit processed at Gangtok 1 day prior; only Indian nationals allowed to Gurudongmar.",
        "Darjeeling Toy Train (DHR) steam joyride should be booked 30-60 days in advance on IRCTC."
      ]
    },
    meghalaya_assam: {
      regionName: "Meghalaya & Assam (Northeast India)",
      terrain: "Hills, Plateaus & Valleys",
      avgSpeedKmH: 32,
      monsoonMonths: [5, 6, 7, 8, 9], // Very heavy rainfall in Cherrapunji / Mawsynram
      permitRequired: false,
      permitDetails: "Assam & Meghalaya do not require ILP for Indian nationals. Valid Govt ID is sufficient. Kaziranga safari requires slot advance booking.",
      importantRules: [
        "Kaziranga National Park safari is open October to April; closed during monsoon.",
        "Double Decker Living Root Bridge trek requires 3,500 stone steps; not recommended for severe knee issues.",
        "Kamakhya Temple in Guwahati has heavy pilgrim queues; VIP darshan ticket recommended on weekends."
      ]
    },
    himachal: {
      regionName: "Himachal Pradesh",
      terrain: "Himalayan Alpine Terrain",
      avgSpeedKmH: 28,
      monsoonMonths: [7, 8],
      permitRequired: false,
      permitDetails: "Green Tax payable at Manali/Shimla entry. Atal Tunnel is open year-round subject to snow clearance; Rohtang Pass requires NGT permit (closed on Tuesdays).",
      importantRules: [
        "Rohtang Pass is closed for maintenance on Tuesdays.",
        "Heavy winter snowfall (Jan-Feb) may restrict vehicles beyond Solang Valley; 4x4 snow chains required.",
        "Shimla Mall Road is a strictly pedestrianized vehicle-free zone."
      ]
    },
    kashmir_ladakh: {
      regionName: "Jammu & Kashmir and Ladakh",
      terrain: "High Altitude Alpine & Cold Desert",
      avgSpeedKmH: 30,
      monsoonMonths: [], // Ladakh is a rain-shadow zone
      permitRequired: true,
      permitDetails: "Ladakh requires Inner Line Permit (ILP / Protected Area Permit) for Khardung La, Nubra Valley, and Pangong Tso. Srinagar requires standard Govt ID.",
      importantRules: [
        "Acclimatization day in Leh (Day 1) with complete rest is medically mandatory (3,500m elevation).",
        "Gulmarg Gondola Phase 2 ropeway tickets must be booked online 3-4 weeks ahead on official portal.",
        "Only local union taxis from Gulmarg/Pahalgam allowed for internal sight points (Baisaran, Aru, Chandanwari)."
      ]
    },
    uttarakhand: {
      regionName: "Uttarakhand",
      terrain: "Foothills & Garhwal/Kumaon Ghats",
      avgSpeedKmH: 32,
      monsoonMonths: [7, 8],
      permitRequired: false,
      permitDetails: "Char Dham Yatra requires mandatory free biometric registration. Corbett National Park safari requires online permit.",
      importantRules: [
        "Jim Corbett Dhikala zone is open 15 Nov to 15 June; closed during monsoon.",
        "Rishikesh river rafting is closed during peak monsoon (July-August).",
        "Mussoorie Mall Road vehicle entry restricted during evening peak hours."
      ]
    },
    rajasthan: {
      regionName: "Rajasthan Heritage",
      terrain: "Plains & Desert Expressways",
      avgSpeedKmH: 55, // Excellent four-lane highways
      monsoonMonths: [7, 8],
      permitRequired: false,
      permitDetails: "No permits required. Composite monument tickets available at Amber Fort, Jantar Mantar, Hawa Mahal.",
      importantRules: [
        "Best visited from October to March; summer temperatures (April-June) exceed 42°C.",
        "Amber Fort elephant rides run only 8:30 AM to 11:30 AM (limited slots); Jeep ride available all day.",
        "Sam Sand Dunes desert safari in Jaisalmer is best scheduled for sunset (4:30 PM - 7:00 PM)."
      ]
    },
    kerala: {
      regionName: "Kerala Backwaters & Western Ghats",
      terrain: "Coastal Plains & Ghat Plantations",
      avgSpeedKmH: 35, // Dense traffic on NH66 and winding Munnar ghats
      monsoonMonths: [6, 7],
      permitRequired: false,
      permitDetails: "No special permits. Eravikulam National Park requires forest entry ticket (closed Feb-March for calving).",
      importantRules: [
        "Eravikulam National Park (Munnar) is closed for Nilgiri Tahr calving from February to March.",
        "Alleppey houseboats check-in at 12:00 PM and anchor by 5:30 PM due to government inland fisheries law.",
        "Padmanabhaswamy Temple in Thiruvananthapuram follows strict traditional dress code (Dhoti for men, Saree for women)."
      ]
    },
    goa: {
      regionName: "Goa Coastal",
      terrain: "Coastal Plains",
      avgSpeedKmH: 42,
      monsoonMonths: [6, 7, 8],
      permitRequired: false,
      permitDetails: "No permits required.",
      importantRules: [
        "Water sports and beach shacks operate from October to May; closed during monsoon.",
        "Dudhsagar waterfall jeep safari is closed during active monsoon months.",
        "Modest dress covering shoulders and knees is strictly enforced at Basilica of Bom Jesus."
      ]
    },
    general_india: {
      regionName: "Rest of India",
      terrain: "Standard Indian Highways & Plains",
      avgSpeedKmH: 45,
      monsoonMonths: [7, 8],
      permitRequired: false,
      permitDetails: "Standard Govt photo ID (Aadhaar, Voter ID, Passport) required for all hotel check-ins.",
      importantRules: [
        "Taj Mahal in Agra is strictly closed on Fridays.",
        "Many major Delhi monuments (Red Fort, Akshardham) are closed on Mondays.",
        "UPI (Google Pay, PhonePe, Paytm) works in 95% of places, but carry ₹2,000-₹3,000 cash for toll booths and hill fruit stalls."
      ]
    }
  };

  // Helper: Detect region from destination name
  function detectRegionKey(destName) {
    var q = (destName || '').toLowerCase();
    if (q.indexOf('darjeeling') !== -1 || q.indexOf('sikkim') !== -1 || q.indexOf('gangtok') !== -1 || 
        q.indexOf('pelling') !== -1 || q.indexOf('kalimpong') !== -1 || q.indexOf('dooars') !== -1 ||
        q.indexOf('mirik') !== -1 || q.indexOf('kurseong') !== -1 || q.indexOf('siliguri') !== -1 || q.indexOf('purulia') !== -1) {
      return 'darjeeling_sikkim';
    }
    if (q.indexOf('shillong') !== -1 || q.indexOf('meghalaya') !== -1 || q.indexOf('cherrapunji') !== -1 ||
        q.indexOf('assam') !== -1 || q.indexOf('kaziranga') !== -1 || q.indexOf('guwahati') !== -1 || q.indexOf('northeast') !== -1) {
      return 'meghalaya_assam';
    }
    if (q.indexOf('manali') !== -1 || q.indexOf('shimla') !== -1 || q.indexOf('dharamshala') !== -1 || 
        q.indexOf('mcleod') !== -1 || q.indexOf('kasol') !== -1 || q.indexOf('kullu') !== -1 || q.indexOf('spiti') !== -1 || q.indexOf('himachal') !== -1) {
      return 'himachal';
    }
    if (q.indexOf('kashmir') !== -1 || q.indexOf('srinagar') !== -1 || q.indexOf('gulmarg') !== -1 || 
        q.indexOf('pahalgam') !== -1 || q.indexOf('ladakh') !== -1 || q.indexOf('leh') !== -1 || q.indexOf('nubra') !== -1 || q.indexOf('pangong') !== -1) {
      return 'kashmir_ladakh';
    }
    if (q.indexOf('rishikesh') !== -1 || q.indexOf('haridwar') !== -1 || q.indexOf('mussoorie') !== -1 || 
        q.indexOf('nainital') !== -1 || q.indexOf('corbett') !== -1 || q.indexOf('uttarakhand') !== -1 || q.indexOf('chardham') !== -1) {
      return 'uttarakhand';
    }
    if (q.indexOf('jaipur') !== -1 || q.indexOf('udaipur') !== -1 || q.indexOf('jodhpur') !== -1 || 
        q.indexOf('jaisalmer') !== -1 || q.indexOf('rajasthan') !== -1 || q.indexOf('pushkar') !== -1) {
      return 'rajasthan';
    }
    if (q.indexOf('kerala') !== -1 || q.indexOf('munnar') !== -1 || q.indexOf('alleppey') !== -1 || 
        q.indexOf('kochi') !== -1 || q.indexOf('thekkady') !== -1 || q.indexOf('kovalam') !== -1 || q.indexOf('wayanad') !== -1) {
      return 'kerala';
    }
    if (q.indexOf('goa') !== -1) {
      return 'goa';
    }
    return 'general_india';
  }

  // 4. VEHICLE CAPACITY SELECTOR
  function determineVehicleType(adults, children) {
    var totalPax = (Number(adults) || 1) + (Number(children) || 0);
    if (totalPax <= 4) {
      return { type: 'sedan', details: VEHICLE_CATALOG.sedan, count: 1, label: "1x Sedan (Dzire / Etios)" };
    } else if (totalPax <= 7) {
      return { type: 'suv', details: VEHICLE_CATALOG.suv, count: 1, label: "1x SUV (Innova Crysta / Ertiga)" };
    } else if (totalPax <= 14) {
      return { type: 'tempo', details: VEHICLE_CATALOG.tempo, count: 1, label: "1x Luxury Tempo Traveller (12-16 Seater)" };
    } else {
      var suvsNeeded = Math.ceil(totalPax / 6);
      return { type: 'suv', details: VEHICLE_CATALOG.suv, count: suvsNeeded, label: suvsNeeded + "x SUVs (Innova Crysta)" };
    }
  }

  // 5. ROOM ALLOCATION
  function calculateRooms(adults, children, roomSharingPref) {
    var numAdults = Number(adults) || 1;
    var numKids = Number(children) || 0;
    
    // Default sharing: 2 adults per double room
    var rooms = Math.ceil(numAdults / 2);
    if (roomSharingPref === 'single') {
      rooms = numAdults; // Private room for each adult
    } else if (roomSharingPref === 'triple') {
      rooms = Math.ceil(numAdults / 3);
    }
    if (rooms < 1) rooms = 1;

    // Children extra beds: kids over 5 generally require an extra rollaway bed
    var extraBedsKids = numKids > 0 ? numKids : 0;
    // Solo adult remaining in an odd group
    var extraBedsAdults = (numAdults % 2 !== 0 && roomSharingPref === 'triple') ? 1 : 0;

    return {
      roomsCount: rooms,
      extraBedsKids: extraBedsKids,
      extraBedsAdults: extraBedsAdults,
      description: rooms + (rooms === 1 ? ' Double Room' : ' Double Rooms') + (extraBedsKids > 0 ? ' (' + extraBedsKids + ' Extra Bed for Child)' : '')
    };
  }

  // 6. ACCURATE REALISTIC BUDGET CALCULATOR
  function calculateAccurateTripBudget(params) {
    var days = Number(params.days) || 3;
    var nights = Math.max(1, days - 1);
    var adults = Number(params.adults) || 2;
    var children = Number(params.children) || 0;
    var totalPax = adults + children;
    var tier = params.budgetTier || 'Moderate';
    var tierInfo = HOTEL_TIER_RATES[tier] || HOTEL_TIER_RATES.Moderate;
    var regionKey = detectRegionKey(params.destination);
    var regionInfo = REGION_INTELLIGENCE[regionKey] || REGION_INTELLIGENCE.general_india;
    var isHilly = regionInfo.terrain.toLowerCase().indexOf('hill') !== -1 || regionInfo.terrain.toLowerCase().indexOf('alpine') !== -1;

    // Room cost
    var roomAlloc = calculateRooms(adults, children, params.roomSharingPref);
    var roomRate = tierInfo.baseRatePerRoom;
    var totalRoomCost = (roomAlloc.roomsCount * roomRate * nights) + 
                        (roomAlloc.extraBedsKids * tierInfo.extraBedChild * nights) +
                        (roomAlloc.extraBedsAdults * tierInfo.extraBedAdult * nights);

    // Vehicle & Transport cost
    var transportPref = params.transportPref || 'private_cab';
    var vehicleAlloc = determineVehicleType(adults, children);
    var dailyVehicleRate = isHilly ? vehicleAlloc.details.dailyRateHill : vehicleAlloc.details.dailyRatePlain;
    var totalVehicleCost = 0;
    var intercityEstimate = 0;

    if (transportPref === 'private_cab') {
      totalVehicleCost = dailyVehicleRate * days * vehicleAlloc.count;
      // Driver allowance, tolls, hill state taxes, parking
      var tollsAndTaxes = (isHilly ? 600 : 450) * days;
      totalVehicleCost += tollsAndTaxes;
    } else if (transportPref === 'self_drive') {
      totalVehicleCost = Math.round(dailyVehicleRate * 0.75 * days); // Fuel + car rental without driver
    } else if (transportPref === 'public_train') {
      // Local autos + shared cabs
      totalVehicleCost = Math.round(900 * days * Math.ceil(totalPax / 3));
      intercityEstimate = 1200 * totalPax; // Train tickets
    } else if (transportPref === 'flight_cab') {
      totalVehicleCost = dailyVehicleRate * days * vehicleAlloc.count;
      intercityEstimate = 4500 * totalPax; // Indicative domestic flight
    }

    // Food & Dining cost
    var dailyMealCostPerPerson = tierInfo.typicalMealDayPerPerson;
    if (params.dietaryPref === 'Local Regional Thali' || params.dietaryPref === 'Pure Vegetarian') {
      dailyMealCostPerPerson = Math.round(dailyMealCostPerPerson * 0.9);
    }
    var totalFoodCost = dailyMealCostPerPerson * totalPax * days;

    // Activities & Entry tickets (based on region & tier)
    var baseActivityPerDay = tier === 'Luxury' ? 900 : (tier === 'Budget' ? 250 : 500);
    var totalActivitiesCost = baseActivityPerDay * totalPax * days;

    // Special permits, state entrance taxes & monument charges
    var permitsAndFees = 0;
    if (regionInfo.permitRequired) {
      permitsAndFees = 450 * totalPax; // e.g. Sikkim PAP or Ladakh ILP fees
    }

    // Contingency Fund (Planning cushion for mountain delays, minor taxi detours, tips)
    var subtotal = totalRoomCost + totalVehicleCost + intercityEstimate + totalFoodCost + totalActivitiesCost + permitsAndFees;
    var contingency = Math.round(subtotal * 0.06); // 6% contingency cushion

    var grandTotalTrip = subtotal + contingency;
    var costPerPerson = Math.round(grandTotalTrip / (totalPax || 1));
    var costPerDay = Math.round(grandTotalTrip / (days || 1));

    // Calculate the absolute minimum realistic amount needed per person by examining the tour pack in India
    var econRoomRate = HOTEL_TIER_RATES.Economy.baseRatePerRoom; // ₹1,600/room/night
    var minStayTotal = (roomAlloc.roomsCount * econRoomRate * nights) + 
                       (roomAlloc.extraBedsKids * HOTEL_TIER_RATES.Economy.extraBedChild * nights) +
                       (roomAlloc.extraBedsAdults * HOTEL_TIER_RATES.Economy.extraBedAdult * nights);
    
    // Transit: examine the vehicle required for this tour pack
    var baseVehRate = isHilly ? vehicleAlloc.details.dailyRateHill : vehicleAlloc.details.dailyRatePlain;
    var minDailyTransit = Math.round(baseVehRate * 0.85); // Economy negotiated cab rate
    var minTollsAndTaxes = (isHilly ? 500 : 400) * days;
    var minTransitTotal = (minDailyTransit * days * vehicleAlloc.count) + minTollsAndTaxes;

    var minDailyMeal = 400; // Clean authentic regional dhabas
    var minFoodTotal = minDailyMeal * totalPax * days;
    var minActivitiesTotal = 200 * totalPax * days;
    var minSubtotal = minStayTotal + minTransitTotal + minFoodTotal + minActivitiesTotal + permitsAndFees;
    var minContingency = Math.max(300, Math.round(minSubtotal * 0.05));
    var minFeasibleTotalTrip = minSubtotal + minContingency;
    var minRequiredPerPerson = Math.round(minFeasibleTotalTrip / (totalPax || 1));

    // Target Budget Analysis (Shortfall or Surplus detection)
    var targetBudgetPerPerson = Number(params.targetBudget) || 0;
    var budgetStatus = 'unspecified';
    var varianceAmount = 0;
    var budgetRecommendation = '';
    var optimizedPlan = null;
    var isInsufficient = false;
    var minimumAmountNeeded = costPerPerson;
    var insufficientNote = '';
    var insufficientReason = '';

    if (targetBudgetPerPerson > 0) {
      var targetTotalTrip = targetBudgetPerPerson * totalPax;
      varianceAmount = targetTotalTrip - grandTotalTrip;

      if (targetBudgetPerPerson < minRequiredPerPerson) {
        // User budget is below absolute minimum feasible cost for this tour pack
        budgetStatus = 'shortfall';
        isInsufficient = true;
        minimumAmountNeeded = minRequiredPerPerson;
        insufficientReason = "For a " + days + "-day trip to " + (params.destination || "your destination") + " for " + totalPax + " traveler" + (totalPax > 1 ? "s" : "") + ", essential baseline expenses (examining the tour pack: " + roomAlloc.description + ", dedicated " + vehicleAlloc.label + ", 3 daily meals, and monument tickets) require at least ₹" + minRequiredPerPerson.toLocaleString('en-IN') + " per person. Your entered amount of ₹" + targetBudgetPerPerson.toLocaleString('en-IN') + " is insufficient to cover basic accommodation and travel safely.";
        insufficientNote = "The amount you entered (₹" + targetBudgetPerPerson.toLocaleString('en-IN') + ") isn't sufficient for this " + days + "-day tour pack, so please increase it to ₹" + minRequiredPerPerson.toLocaleString('en-IN') + " per person (the minimum amount needed). Here is your complete itinerary planned with the realistic minimum amount needed.";
        budgetRecommendation = "Your target budget of ₹" + targetBudgetPerPerson.toLocaleString('en-IN') + "/person is lower than the realistic minimum cost (₹" + minRequiredPerPerson.toLocaleString('en-IN') + "/person). The amount you entered isn't sufficient for the tour pack, so please increase it to ₹" + minRequiredPerPerson.toLocaleString('en-IN') + " per person.";

        optimizedPlan = {
          title: "Minimum Feasible Plan (₹" + minRequiredPerPerson.toLocaleString('en-IN') + " Needed)",
          targetBudgetPerPerson: targetBudgetPerPerson,
          costPerPerson: minRequiredPerPerson,
          grandTotalTrip: minFeasibleTotalTrip,
          tierName: "Verified Budget Homestay / Smart Value",
          isInsufficient: true,
          stay: {
            label: "Verified Budget Homestay (" + nights + " Nights, " + roomAlloc.description + ")",
            dailyRate: econRoomRate,
            amount: minStayTotal
          },
          transport: {
            label: "Dedicated Cab (" + days + " Days, " + vehicleAlloc.label + ")",
            dailyRate: minDailyTransit,
            amount: minTransitTotal
          },
          food: {
            label: "Regional Thalis & Authentic Dhabas (₹" + minDailyMeal + "/person/day)",
            amount: minFoodTotal
          },
          activities: {
            label: "Core Viewpoints, Temples & Nature Trails",
            amount: minActivitiesTotal
          },
          contingency: {
            label: "Emergency Buffer & Reserves",
            amount: minContingency
          },
          breakdownPerPerson: {
            stay: Math.round(minStayTotal / totalPax),
            transport: Math.round(minTransitTotal / totalPax),
            food: Math.round(minFoodTotal / totalPax),
            activities: Math.round(minActivitiesTotal / totalPax),
            shopping: Math.round(minContingency / totalPax)
          }
        };
      } else if (targetBudgetPerPerson < costPerPerson) {
        // User budget covers the tour pack using budget homestays, but is below requested Moderate/Luxury tier
        budgetStatus = 'shortfall_tier';
        isInsufficient = false;
        minimumAmountNeeded = costPerPerson;
        insufficientReason = "You selected " + tier + " tier comfort which costs ₹" + costPerPerson.toLocaleString('en-IN') + " per person for this " + days + "-day trip. Your entered budget of ₹" + targetBudgetPerPerson.toLocaleString('en-IN') + " covers the tour pack using budget homestays and smart transit, but cannot cover " + tier + " hotels. The minimum amount needed for " + tier + " tier is ₹" + costPerPerson.toLocaleString('en-IN') + " per person.";
        insufficientNote = "Your entered budget of ₹" + targetBudgetPerPerson.toLocaleString('en-IN') + " covers the tour pack using verified budget homestays and smart cab options.";
        var deficitPerPax = Math.round(Math.abs(varianceAmount) / totalPax);
        budgetRecommendation = "Your target budget of ₹" + targetBudgetPerPerson.toLocaleString('en-IN') + "/person covers the tour pack under budget homestays. To upgrade to " + tier + " tier, please increase by ₹" + deficitPerPax.toLocaleString('en-IN') + " per person.";

        var optTotalTrip = targetTotalTrip;
        var optStayAmount = Math.round(optTotalTrip * 0.38);
        var optRoomRate = Math.max(1200, Math.round(optStayAmount / (roomAlloc.roomsCount * nights)));
        var totalOptStay = optRoomRate * roomAlloc.roomsCount * nights;

        var optTransitAmount = Math.round(optTotalTrip * 0.28);
        var optDailyTransit = Math.max(900, Math.round(optTransitAmount / days));
        var totalOptTransit = optDailyTransit * days;

        var optMealAmount = Math.round(optTotalTrip * 0.18);
        var optDailyMeal = Math.max(350, Math.round(optMealAmount / (totalPax * days)));
        var totalOptFood = optDailyMeal * totalPax * days;

        var totalOptActivities = Math.round(optTotalTrip * 0.10);
        var optSubtotal = totalOptStay + totalOptTransit + totalOptFood + totalOptActivities;
        var totalOptBuffer = Math.max(250, optTotalTrip - optSubtotal);
        var optFinalGrandTotal = optSubtotal + totalOptBuffer;
        var optFinalPerPerson = Math.round(optFinalGrandTotal / totalPax);

        optimizedPlan = {
          title: "Custom Plan (₹" + optFinalPerPerson.toLocaleString('en-IN') + " per person)",
          targetBudgetPerPerson: targetBudgetPerPerson,
          costPerPerson: optFinalPerPerson,
          grandTotalTrip: optFinalGrandTotal,
          tierName: "Budget Homestay / Value Standard",
          isInsufficient: false,
          stay: {
            label: "Verified Budget Homestay / Clean Hotel (" + nights + " Nights, " + roomAlloc.description + ")",
            dailyRate: optRoomRate,
            amount: totalOptStay
          },
          transport: {
            label: "Smart Cab / Shared Transfers (" + days + " Days)",
            dailyRate: optDailyTransit,
            amount: totalOptTransit
          },
          food: {
            label: "Regional Thalis & Authentic Dhabas (₹" + optDailyMeal + "/person/day)",
            amount: totalOptFood
          },
          activities: {
            label: "Core Viewpoints, Temples & Nature Trails",
            amount: totalOptActivities
          },
          contingency: {
            label: "Emergency Buffer & Reserves",
            amount: totalOptBuffer
          },
          breakdownPerPerson: {
            stay: Math.round(totalOptStay / totalPax),
            transport: Math.round(totalOptTransit / totalPax),
            food: Math.round(totalOptFood / totalPax),
            activities: Math.round(totalOptActivities / totalPax),
            shopping: Math.round(totalOptBuffer / totalPax)
          }
        };
      } else {
        budgetStatus = 'surplus';
        isInsufficient = false;
        minimumAmountNeeded = costPerPerson;
        budgetRecommendation = "Your target budget of ₹" + targetBudgetPerPerson.toLocaleString('en-IN') + "/person comfortably covers this " + tier + " tier itinerary with a planning buffer of ₹" + Math.round(varianceAmount / totalPax).toLocaleString('en-IN') + "/person.";
      }
    }

    return {
      grandTotalTrip: grandTotalTrip,
      costPerPerson: costPerPerson,
      costPerDay: costPerDay,
      days: days,
      nights: nights,
      adults: adults,
      children: children,
      totalPax: totalPax,
      roomAllocation: roomAlloc,
      vehicleAllocation: vehicleAlloc,
      itemizedBreakdown: {
        accommodation: {
          label: "Hotels & Stays (" + nights + " Nights, " + roomAlloc.description + ")",
          amount: totalRoomCost,
          percentage: Math.round((totalRoomCost / grandTotalTrip) * 100),
          tier: tierInfo.name,
          verified: "TripMozy Partner Rates"
        },
        transport: {
          label: "Cab / Transit (" + vehicleAlloc.label + ", " + days + " Days)",
          amount: totalVehicleCost,
          percentage: Math.round((totalVehicleCost / grandTotalTrip) * 100),
          includes: "Vehicle, Fuel, State Taxes, Tolls & Driver Night Allowance"
        },
        intercity: {
          label: "Intercity Flight/Train Allowance",
          amount: intercityEstimate,
          percentage: Math.round((intercityEstimate / grandTotalTrip) * 100),
          status: intercityEstimate > 0 ? "Indicative Estimate" : "Included in road cab"
        },
        food: {
          label: "Meals & Dining (" + days + " Days, " + (params.dietaryPref || 'Standard') + ")",
          amount: totalFoodCost,
          percentage: Math.round((totalFoodCost / grandTotalTrip) * 100),
          dailyPerPerson: dailyMealCostPerPerson
        },
        activities: {
          label: "Attraction Entry Tickets & Experiences",
          amount: totalActivitiesCost,
          percentage: Math.round((totalActivitiesCost / grandTotalTrip) * 100),
          note: "Standard ticket estimates"
        },
        permitsAndTaxes: {
          label: "State Permits & Green Taxes",
          amount: permitsAndFees,
          percentage: Math.round((permitsAndFees / grandTotalTrip) * 100),
          details: regionInfo.permitDetails || "Standard state entry taxes"
        },
        contingency: {
          label: "Contingency & Emergency Buffer (6%)",
          amount: contingency,
          percentage: Math.round((contingency / grandTotalTrip) * 100),
          note: "Clearly separated planning cushion for unexpected mountain delays or tips"
        }
      },
      budgetAnalysis: {
        status: budgetStatus,
        hasTarget: targetBudgetPerPerson > 0,
        isInsufficient: isInsufficient,
        minimumAmountNeeded: minimumAmountNeeded,
        minRequiredPerPerson: minRequiredPerPerson,
        insufficientNote: insufficientNote,
        insufficientReason: insufficientReason,
        targetPerPerson: targetBudgetPerPerson,
        calculatedPerPerson: costPerPerson,
        variancePerPerson: Math.round(varianceAmount / totalPax),
        recommendation: budgetRecommendation,
        optimizedPlan: optimizedPlan,
        recommendedPlan: {
          title: "TripMozy Recommended (" + tierInfo.name + " Comfort)",
          costPerPerson: costPerPerson,
          grandTotalTrip: grandTotalTrip,
          tierName: tierInfo.name,
          stay: { label: "Hotels & Stays (" + nights + " Nights, " + roomAlloc.description + ")", amount: totalRoomCost },
          transport: { label: "Cab / Transit (" + vehicleAlloc.label + ", " + days + " Days)", amount: totalVehicleCost },
          food: { label: "Meals & Dining (" + days + " Days)", amount: totalFoodCost },
          activities: { label: "Attraction Entry Tickets & Experiences", amount: totalActivitiesCost },
          contingency: { label: "Contingency & Emergency Buffer (6%)", amount: contingency },
          breakdownPerPerson: {
            stay: Math.round(totalRoomCost / totalPax),
            transport: Math.round(totalVehicleCost / totalPax),
            food: Math.round(totalFoodCost / totalPax),
            activities: Math.round(totalActivitiesCost / totalPax),
            shopping: Math.round(contingency / totalPax)
          }
        }
      },
      disclaimer: "All budget figures are realistic verified estimates for Indian tourism conditions. Final room and cab rates are confirmed at time of booking with TripMozy Private Limited (+91 9641866181)."
    };
  }

  // 7. REALISTIC TRANSFER TIME ESTIMATOR (Hill vs Plains)
  function estimateTransferDuration(distanceKm, isHillTerrain) {
    if (distanceKm <= 0) return "0 mins";
    // Hill roads: 22-26 km/h; Plains: 50-60 km/h
    var speedKmH = isHillTerrain ? 24 : 52;
    var hours = distanceKm / speedKmH;
    var totalMinutes = Math.round(hours * 60);

    if (totalMinutes < 60) {
      return totalMinutes + " mins (" + distanceKm + " km)";
    }
    var h = Math.floor(totalMinutes / 60);
    var m = totalMinutes % 60;
    return h + "h " + (m > 0 ? m + "m" : "") + " (" + distanceKm + " km)";
  }

  // 8. WHATSAPP ENQUIRY URL GENERATOR FOR TRIPMOZY (+91 9641866181)
  function buildTripmozyWhatsAppUrl(trip, budgetInfo) {
    var dest = trip.destination || 'India';
    var days = trip.days || 3;
    var pax = (budgetInfo.adults || 2) + " Adults" + (budgetInfo.children ? ", " + budgetInfo.children + " Child" : "");
    var rooms = budgetInfo.roomAllocation ? budgetInfo.roomAllocation.description : "1 Room";
    var vehicle = budgetInfo.vehicleAllocation ? budgetInfo.vehicleAllocation.label : "Sedan";
    var tier = trip.budgetTier || 'Standard';
    var estCost = budgetInfo.costPerPerson ? "₹" + budgetInfo.costPerPerson.toLocaleString('en-IN') + "/person (Trip Total: ₹" + budgetInfo.grandTotalTrip.toLocaleString('en-IN') + ")" : "Available on request";
    var dates = (trip.startDate && trip.endDate) ? trip.startDate + " to " + trip.endDate : "Flexible Dates";

    var text = "Hello TripMozy Team! ✈️\n\n" +
      "I planned a customized holiday on your AI Trip Planner and would like to get a verified official quote & check live room availability:\n\n" +
      "📍 *Destination:* " + dest + "\n" +
      "📅 *Duration & Dates:* " + days + " Days (" + dates + ")\n" +
      "👥 *Travelers:* " + pax + "\n" +
      "🏨 *Stay Category:* " + tier + " (" + rooms + ")\n" +
      "🚗 *Transport:* " + vehicle + "\n" +
      "💰 *AI Budget Estimate:* " + estCost + "\n\n" +
      "Please share package availability, hotel choices, and your best quotation. Thank you!";

    return "https://wa.me/" + TRIPMOZY_WHATSAPP + "?text=" + encodeURIComponent(text);
  }

  // Export module to browser window or Node.js environment
  var api = {
    TRIPMOZY_WHATSAPP: TRIPMOZY_WHATSAPP,
    TRIPMOZY_PHONE_DISPLAY: TRIPMOZY_PHONE_DISPLAY,
    VEHICLE_CATALOG: VEHICLE_CATALOG,
    HOTEL_TIER_RATES: HOTEL_TIER_RATES,
    REGION_INTELLIGENCE: REGION_INTELLIGENCE,
    detectRegionKey: detectRegionKey,
    determineVehicleType: determineVehicleType,
    calculateRooms: calculateRooms,
    calculateAccurateTripBudget: calculateAccurateTripBudget,
    estimateTransferDuration: estimateTransferDuration,
    buildTripmozyWhatsAppUrl: buildTripmozyWhatsAppUrl
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.TripMozyEngine = api;
  }

})(typeof window !== 'undefined' ? window : global);
