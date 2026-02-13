# INSpace - Insurance Risk Analytics Platform

A modern enterprise web application for insurance risk analytics, featuring portfolio management, flood risk simulation, and asset visualization on interactive maps.

## Features

- **Portfolio View**: Visualize all insurance assets on an interactive map
- **Event Simulation**: Simulate flood events and analyze exposed assets
- **Dynamic KPIs**: Real-time metrics that update based on selections and filters
- **Flood Layer**: FEMA-style flood zone visualization with opacity controls
- **Asset Filtering**: Filter by asset types (Factories, Retail, Warehouses, Residential, Commercial, Industrial)
- **Property Details**: Detailed asset information including GIV, PnL, risk scores, and flood exposure

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, React-Leaflet
- **Backend**: FastAPI, Motor (MongoDB async driver)
- **Database**: MongoDB
- **Maps**: Leaflet with CARTO/OpenStreetMap tiles

## Project Structure

```
/app
├── backend/
│   ├── server.py          # FastAPI application with mock data
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Header.jsx
│   │   │   ├── KPIBar.jsx
│   │   │   ├── LeftPanel.jsx
│   │   │   ├── RightPanel.jsx
│   │   │   └── MapView.jsx
│   │   ├── data/
│   │   │   └── mockData.js  # Mock asset and flood data
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── .env
└── .github/
    └── workflows/
        └── ci.yml        # GitHub Actions CI pipeline
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/inspace.git
   cd inspace
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   ```

4. **Environment Variables**
   
   Backend (`backend/.env`):
   ```
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="inspace_db"
   CORS_ORIGINS="*"
   ```
   
   Frontend (`frontend/.env`):
   ```
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend**
   ```bash
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   yarn start
   ```

4. Open http://localhost:3000 in your browser

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | API info |
| GET | `/api/health` | Health check |
| GET | `/api/assets` | Get all assets |
| GET | `/api/assets/{id}` | Get asset by ID |
| GET | `/api/assets/search/{query}` | Search assets |
| GET | `/api/flood-zones` | Get flood zones |
| GET | `/api/kpis/portfolio` | Portfolio KPIs |
| GET | `/api/kpis/flood` | Flood-specific KPIs |

## Connecting to GitHub

1. **Initialize Git** (if not already):
   ```bash
   git init
   ```

2. **Add remote**:
   ```bash
   git remote add origin https://github.com/your-org/inspace.git
   ```

3. **Push code**:
   ```bash
   git add .
   git commit -m "Initial commit: INSpace Insurance Risk Analytics Platform"
   git push -u origin main
   ```

## ArcGIS Integration Notes

For production ArcGIS integration, replace the Leaflet map with:

```javascript
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

// Example FeatureLayer configuration
const assetLayer = new FeatureLayer({
  url: "https://your-arcgis-server/arcgis/rest/services/Assets/FeatureServer/0",
  outFields: ["*"],
  popupTemplate: {
    title: "{assetId}",
    content: [
      { type: "fields", fieldInfos: [
        { fieldName: "giv", label: "GIV", format: { digitSeparator: true } },
        { fieldName: "riskScore", label: "Risk Score" }
      ]}
    ]
  },
  renderer: {
    type: "unique-value",
    field: "assetType",
    uniqueValueInfos: [
      { value: "residential", symbol: { type: "simple-marker", color: "#3b82f6" } },
      // ... other types
    ]
  }
});
```

## License

Proprietary - All Rights Reserved
