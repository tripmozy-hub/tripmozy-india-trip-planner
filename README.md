# Tripmozy.com — Incredible India AI Travel Planner & GPS Nearby Tourist Attractions

**Tripmozy.com** is an AI-powered travel architect built exclusively for **Indian Tourist Destinations** across all 28 States and 8 Union Territories. It features live geographic location mapping, automated detection of nearby tourist attractions with exact driving distances, geographically clustered day-by-day itineraries, and an interactive **Manual Budget Column** in Indian Rupees (₹).

---

## 🇮🇳 Incredible India Features

1. **Exclusively Dedicated to Tourism in India**:
   - Covers premier tourist circuits:
     - **Himachal Pradesh**: Manali, Solang Valley, Rohtang Pass, Atal Tunnel, Shimla, Kasol, Dharamshala, Spiti.
     - **Goa**: North Goa beaches, Portuguese Latin Quarter (Fontainhas), Aguada Fort, Old Goa churches, Palolem, Dudhsagar.
     - **Kerala**: Munnar tea plantations, Eravikulam National Park, Alleppey backwater houseboats, Fort Kochi.
     - **Jammu & Kashmir**: Srinagar Dal Lake shikaras, Gulmarg gondolas, Pahalgam Betaab Valley.
     - **Ladakh**: Leh Palace, Magnetic Hill, Khardung La Pass, Pangong Tso Lake.
     - **Rajasthan**: Jaipur pink city forts, Udaipur lake palaces, Jodhpur blue city, Jaisalmer dunes.
     - **Uttarakhand**: Rishikesh river rafting, Ganga aartis, Haridwar, Mussoorie, Nainital lakes.
     - **Tamil Nadu & Karnataka**: Ooty, Coonoor, Kodaikanal, Coorg, Hampi ruins, Gokarna beaches.
     - **East & Northeast**: Darjeeling tea estates, Gangtok, Shillong, Cherrapunji living root bridges.
     - **Heritage & Spiritual**: Varanasi ghats, Ayodhya, Amritsar Golden Temple, Agra Taj Mahal.

2. **Map-First Nearby Tourist Attractions Explorer**:
   - **Base Center Pinpoint**: When a user enters any Indian destination, the map pins the exact location center with an animated radar marker.
   - **Nearby Tourist Spot Radar**: Calculates real Haversine road distances in kilometers (e.g. `📍 2.4 km from center`, `📍 14.8 km from center`).
   - **Side-by-Side Map Explorer**: Browse nearby temples, forts, waterfalls, viewpoints, and bazaars right next to the map. Clicking any spot pans and zooms to the pin with insider tips and driving direction links.
   - **Logically Clustered Daily Loops**: Grouped geographically by road proximity so travelers don't zigzag back and forth across mountain roads or crowded cities.
   - **Daily Route Polyline Connectors**: Color-coded daily routes connecting stops with total transit distance calculated in kilometers.

3. **Interactive Manual Budget Column (₹ INR)**:
   - Form search with quick INR chips (`₹12k`, `₹20k`, `₹35k`, `₹60k`).
   - Dedicated **Manual Budget Column** alongside the AI Recommended estimate with live savings/variance tracking and an automated Chart.js doughnut chart.

4. **Clean, Standard Light UI**:
   - White card background, royal blue buttons (`#2563eb`), clear typography, and responsive mobile-first layout.

---

## 🚀 Live Access & Running Locally

The local server is running at:
> **http://localhost:8080**

To restart anytime via PowerShell:
```powershell
cd C:\Users\user\.gemini\antigravity\scratch\ai-trip-planner
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Or open [`index.html`](file:///C:/Users/user/.gemini/antigravity/scratch/ai-trip-planner/index.html) directly in any browser.

---

## 🌐 Embed Tripmozy on Any Website

```html
<iframe 
  src="https://tripmozy.vercel.app" 
  width="100%" 
  height="800px" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
  allow="geolocation"
></iframe>
```

---

## ⚡ Deploying to Vercel

The application is pre-configured with [`vercel.json`](file:///C:/Users/user/.gemini/antigravity/scratch/ai-trip-planner/vercel.json) and packaged ready for instant static deployment.

### Option 1: Instant Drag & Drop Upload (Fastest — 60 seconds)
1. Go to [vercel.com/new](https://vercel.com/new) and log in.
2. Under **Import Project**, drag and drop the prepared zip file:
   `C:\Users\user\.gemini\antigravity\scratch\tripmozy-india-trip-planner.zip`
   *(or drag the entire `ai-trip-planner` directory)*.
3. Click **Deploy**. Vercel will build and assign you a free live URL (e.g., `https://tripmozy-india-trip-planner.vercel.app`).

### Option 2: Deploy via GitHub (Continuous Deployment)
1. Create a repository on GitHub (e.g. `tripmozy-india-planner`).
2. Push or upload the files from `C:\Users\user\.gemini\antigravity\scratch\ai-trip-planner`.
3. In [vercel.com](https://vercel.com), click **Add New...** -> **Project** -> **Import** your repository.
4. Framework Preset: **Other** / None (zero build step needed).
5. Click **Deploy**!

### Option 3: Automated Script using Vercel Token
Create a Vercel Personal Access Token with deployment access from [vercel.com/account/tokens](https://vercel.com/account/tokens). The script prompts for the token without echoing it. For an existing project, pass its Project ID and, for a team project, the Team ID:
```powershell
cd C:\Users\user\.gemini\antigravity\scratch\ai-trip-planner
powershell -ExecutionPolicy Bypass -File .\deploy-vercel.ps1 -ProjectId "prj_..." -TeamId "team_..."
```
Omit either ID for a personal deployment or when it is not applicable. The script targets production and prints the deployment URL when Vercel accepts the request. This does not require git or Node.js.

# AI-TRIP-PLANNER

