from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="INSpace Insurance Risk Analytics API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== Models ==============

class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    assetId: str
    latitude: float
    longitude: float
    giv: float
    pnl: float
    assetType: str
    constructionType: str
    yearBuilt: int
    coverageType: str
    riskScore: int
    address: str
    inFloodZone: bool = False
    floodDepth: float = 0
    floodCategory: Optional[str] = None

class FloodZone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    flood_id: str
    flood_category: str
    flood_depth_m: float
    return_period_yr: int
    probability_pct: float
    data_source: str
    timestamp: str
    coordinates: List[List[float]]

class KPIResponse(BaseModel):
    totalGIV: float
    totalPnL: float
    impactedGIV: float
    impactedPnL: float
    assetCount: int

class FloodKPIResponse(BaseModel):
    floodedGIV: float
    estimatedFloodLoss: float
    exposedAssetCount: int
    medianFloodDepth: float
    totalAssets: int

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ============== Mock Data Generation ==============

SF_CENTER = {"lat": 37.7749, "lng": -122.4194}

ASSET_TYPES = ["factories", "retail", "warehouses", "residential", "commercial", "industrial"]
CONSTRUCTION_TYPES = ["Wood Frame", "Steel Frame", "Concrete", "Masonry", "Mixed"]
COVERAGE_TYPES = ["Full Coverage", "Basic", "Premium", "Standard"]

STREET_NAMES = [
    "Market St", "Mission St", "Howard St", "Folsom St", "Harrison St",
    "Bryant St", "Brannan St", "Townsend St", "King St", "Berry St",
    "Van Ness Ave", "Geary Blvd", "Post St", "Sutter St", "Bush St"
]

def generate_address():
    number = random.randint(100, 9000)
    street = random.choice(STREET_NAMES)
    return f"{number} {street}, San Francisco, CA"

def generate_mock_assets(count: int = 85) -> List[dict]:
    assets = []
    for i in range(count):
        asset_type = random.choice(ASSET_TYPES)
        lat = SF_CENTER["lat"] + (random.random() - 0.5) * 0.15
        lng = SF_CENTER["lng"] + (random.random() - 0.5) * 0.25
        
        in_flood_zone = random.random() < 0.4
        flood_depth = round(random.random() * 8, 1) if in_flood_zone else 0
        
        assets.append({
            "assetId": f"{asset_type.upper()[:4]}-{str(i + 1).zfill(5)}",
            "latitude": lat,
            "longitude": lng,
            "giv": round(random.random() * 50000000 + 1000000),
            "pnl": round((random.random() - 0.3) * 2000000),
            "assetType": asset_type,
            "constructionType": random.choice(CONSTRUCTION_TYPES),
            "yearBuilt": random.randint(1960, 2020),
            "coverageType": random.choice(COVERAGE_TYPES),
            "riskScore": random.randint(0, 100),
            "address": generate_address(),
            "inFloodZone": in_flood_zone,
            "floodDepth": flood_depth,
            "floodCategory": random.choice(["primary", "secondary", "fringe"]) if in_flood_zone else None,
        })
    
    return assets

def generate_flood_zones() -> List[dict]:
    return [
        {
            "flood_id": "FZ-001",
            "flood_category": "primary",
            "flood_depth_m": 2.5,
            "return_period_yr": 100,
            "probability_pct": 1,
            "data_source": "FEMA NFHL",
            "timestamp": "2024-01-15T00:00:00Z",
            "coordinates": [
                [37.7850, -122.3900],
                [37.7900, -122.3800],
                [37.7950, -122.3850],
                [37.7920, -122.4000],
                [37.7850, -122.3950],
            ],
        },
        {
            "flood_id": "FZ-002",
            "flood_category": "secondary",
            "flood_depth_m": 1.2,
            "return_period_yr": 50,
            "probability_pct": 2,
            "data_source": "FEMA NFHL",
            "timestamp": "2024-01-15T00:00:00Z",
            "coordinates": [
                [37.7700, -122.4100],
                [37.7750, -122.4000],
                [37.7800, -122.4050],
                [37.7780, -122.4200],
                [37.7720, -122.4180],
            ],
        },
        {
            "flood_id": "FZ-003",
            "flood_category": "fringe",
            "flood_depth_m": 0.5,
            "return_period_yr": 25,
            "probability_pct": 4,
            "data_source": "FEMA NFHL",
            "timestamp": "2024-01-15T00:00:00Z",
            "coordinates": [
                [37.7600, -122.4300],
                [37.7650, -122.4200],
                [37.7700, -122.4250],
                [37.7680, -122.4400],
                [37.7620, -122.4380],
            ],
        },
        {
            "flood_id": "FZ-004",
            "flood_category": "primary",
            "flood_depth_m": 3.1,
            "return_period_yr": 100,
            "probability_pct": 1,
            "data_source": "FEMA NFHL",
            "timestamp": "2024-01-15T00:00:00Z",
            "coordinates": [
                [37.7820, -122.4500],
                [37.7870, -122.4400],
                [37.7920, -122.4450],
                [37.7900, -122.4600],
                [37.7840, -122.4580],
            ],
        },
    ]

# Generate mock data on startup
MOCK_ASSETS = generate_mock_assets(85)
FLOOD_ZONES = generate_flood_zones()

# ============== API Routes ==============

@api_router.get("/")
async def root():
    return {"message": "INSpace Insurance Risk Analytics API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Asset routes
@api_router.get("/assets", response_model=List[Asset])
async def get_assets():
    """Get all assets"""
    return MOCK_ASSETS

@api_router.get("/assets/{asset_id}", response_model=Asset)
async def get_asset(asset_id: str):
    """Get a specific asset by ID"""
    for asset in MOCK_ASSETS:
        if asset["assetId"] == asset_id:
            return asset
    raise HTTPException(status_code=404, detail="Asset not found")

@api_router.get("/assets/search/{query}")
async def search_assets(query: str):
    """Search assets by ID or address"""
    query_lower = query.lower()
    results = [
        asset for asset in MOCK_ASSETS
        if query_lower in asset["assetId"].lower() or query_lower in asset["address"].lower()
    ]
    return results

# Flood zone routes
@api_router.get("/flood-zones", response_model=List[FloodZone])
async def get_flood_zones():
    """Get all flood zones"""
    return FLOOD_ZONES

@api_router.get("/flood-zones/{zone_id}", response_model=FloodZone)
async def get_flood_zone(zone_id: str):
    """Get a specific flood zone by ID"""
    for zone in FLOOD_ZONES:
        if zone["flood_id"] == zone_id:
            return zone
    raise HTTPException(status_code=404, detail="Flood zone not found")

# KPI routes
@api_router.get("/kpis/portfolio", response_model=KPIResponse)
async def get_portfolio_kpis():
    """Get portfolio-wide KPIs"""
    total_giv = sum(a["giv"] for a in MOCK_ASSETS)
    total_pnl = sum(a["pnl"] for a in MOCK_ASSETS)
    impacted_assets = [a for a in MOCK_ASSETS if a["inFloodZone"]]
    impacted_giv = sum(a["giv"] for a in impacted_assets)
    impacted_pnl = sum(a["pnl"] for a in impacted_assets)
    
    return {
        "totalGIV": total_giv,
        "totalPnL": total_pnl,
        "impactedGIV": impacted_giv,
        "impactedPnL": impacted_pnl,
        "assetCount": len(MOCK_ASSETS),
    }

@api_router.get("/kpis/flood", response_model=FloodKPIResponse)
async def get_flood_kpis():
    """Get flood-specific KPIs"""
    flooded_assets = [a for a in MOCK_ASSETS if a["inFloodZone"]]
    flooded_giv = sum(a["giv"] for a in flooded_assets)
    
    # Calculate estimated loss based on depth and construction
    def get_exposure_factor(depth, construction):
        base_factors = {
            "Wood Frame": 0.15,
            "Steel Frame": 0.08,
            "Concrete": 0.06,
            "Masonry": 0.10,
            "Mixed": 0.12,
        }
        base = base_factors.get(construction, 0.10)
        if depth < 1:
            return base * 0.5
        elif depth < 2:
            return base * 1.0
        elif depth < 3:
            return base * 1.5
        return base * 2.0
    
    estimated_loss = sum(
        a["giv"] * get_exposure_factor(a["floodDepth"], a["constructionType"])
        for a in flooded_assets
    )
    
    depths = [a["floodDepth"] for a in flooded_assets if a["floodDepth"] > 0]
    median_depth = sorted(depths)[len(depths) // 2] if depths else 0
    
    return {
        "floodedGIV": flooded_giv,
        "estimatedFloodLoss": estimated_loss,
        "exposedAssetCount": len(flooded_assets),
        "medianFloodDepth": median_depth,
        "totalAssets": len(MOCK_ASSETS),
    }

# Status check routes (existing)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
