import os
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Path, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
# from supabase_py_async import create_client, AsyncClient
from supabase import create_client, Client
from datetime import datetime
from uuid import UUID, uuid4

# --- 1. SETUP & CONFIGURATION ---

# Load environment variables from .env file
load_dotenv()

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Check if credentials are provided
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in the .env file")

# Initialize Supabase async client
# supabase: AsyncClient = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Initialize FastAPI app
app = FastAPI(
    title="Simhastha 2028 Smart Mobility & Safety API",
    description="A comprehensive backend for the Smart Mobility & Safety App for Simhastha 2028.",
    version="1.0.0"
)

# --- 2. GENERIC RESPONSE MODEL ---

class ApiResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None

# --- 3. PYDANTIC MODELS (Data Schemas) ---

# User Models
class UserBase(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None
    role: str = Field(..., pattern="^(pilgrim|volunteer|police|fire|doctor|admin)$")
    language_preference: Optional[str] = 'hi'
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    device_id: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(pilgrim|volunteer|police|fire|doctor|admin)$")
    language_preference: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    device_id: Optional[str] = None

class User(UserBase):
    user_id: UUID
    created_at: datetime
    updated_at: datetime

# Facility Models
class FacilityBase(BaseModel):
    type: str = Field(..., pattern="^(washroom|rest|mandir|akhada|food|parking|ghat|medical|police_station)$")
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    lat: float
    lng: float
    open_hours: Optional[str] = '24/7'
    rating: Optional[float] = 0.0

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    open_hours: Optional[str] = None
    rating: Optional[float] = None

class Facility(FacilityBase):
    facility_id: UUID
    created_at: datetime

# Shuttle Models
class ShuttleBase(BaseModel):
    route_name: str
    current_lat: float
    current_lng: float
    capacity: int = 50
    occupancy: int = 0
    next_stop: Optional[str] = None
    status: str = Field('active', pattern="^(active|inactive|maintenance)$")

class ShuttleCreate(ShuttleBase):
    pass

class ShuttleUpdate(BaseModel):
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    occupancy: Optional[int] = None
    next_stop: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|maintenance)$")

class Shuttle(ShuttleBase):
    shuttle_id: UUID
    updated_at: datetime

# Parking Slot Models
class ParkingSlotBase(BaseModel):
    parking_area_name: str
    lat: float
    lng: float
    total_capacity: int
    available_capacity: int
    price_per_hour: Optional[float] = 0.0

class ParkingSlotCreate(ParkingSlotBase):
    pass

class ParkingSlotUpdate(BaseModel):
    available_capacity: Optional[int] = None
    price_per_hour: Optional[float] = None

class ParkingSlot(ParkingSlotBase):
    slot_id: UUID
    last_updated: datetime

# Crowd Density Models
class CrowdDensityBase(BaseModel):
    location_id: UUID
    people_count: int = 0
    density_level: str = Field(..., pattern="^(low|medium|high|critical)$")

class CrowdDensityCreate(CrowdDensityBase):
    pass

class CrowdDensityUpdate(BaseModel):
    people_count: Optional[int] = None
    density_level: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")

class CrowdDensity(CrowdDensityBase):
    density_id: UUID
    updated_at: datetime

# Emergency Report Models
class EmergencyReportBase(BaseModel):
    user_id: Optional[UUID] = None
    lat: float
    lng: float
    type: str = Field(..., pattern="^(medical|police|fire|other|accident|lost_child)$")
    description: Optional[str] = None
    priority: str = Field('medium', pattern="^(low|medium|high|critical)$")

class EmergencyReportCreate(EmergencyReportBase):
    pass

class EmergencyReportUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(open|in-progress|resolved|cancelled)$")
    assigned_to: Optional[UUID] = None
    description: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")

class EmergencyReport(EmergencyReportBase):
    report_id: UUID
    status: str
    assigned_to: Optional[UUID] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

# Missing Person Models
class MissingPersonBase(BaseModel):
    reported_by: Optional[UUID] = None
    name: str
    age: Optional[int] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    photo_url: Optional[str] = None
    last_seen_lat: float
    last_seen_lng: float
    description: Optional[str] = None
    contact_info: Optional[str] = None

class MissingPersonCreate(MissingPersonBase):
    pass

class MissingPersonUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(open|found|closed)$")
    assigned_volunteer: Optional[UUID] = None
    photo_url: Optional[str] = None
    description: Optional[str] = None

class MissingPerson(MissingPersonBase):
    missing_id: UUID
    status: str
    assigned_volunteer: Optional[UUID] = None
    created_at: datetime
    found_at: Optional[datetime] = None

# Route Models
class RouteBase(BaseModel):
    route_name: Optional[str] = None
    start_point_lat: float
    start_point_lng: float
    end_point_lat: float
    end_point_lng: float
    route_points: Optional[List[Dict[str, Any]]] = None
    distance: Optional[float] = None
    estimated_time: Optional[int] = None
    crowd_avoidance_score: Optional[int] = 0
    route_type: str = Field('walking', pattern="^(walking|shuttle|vehicle)$")

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    route_name: Optional[str] = None
    route_points: Optional[List[Dict[str, Any]]] = None
    crowd_avoidance_score: Optional[int] = None

class Route(RouteBase):
    route_id: UUID
    created_at: datetime

# Smart Band Models
class SmartBandBase(BaseModel):
    band_code: str
    assigned_user: Optional[UUID] = None
    status: str = Field('inactive', pattern="^(active|inactive|lost|damaged)$")
    last_lat: Optional[float] = None
    last_lng: Optional[float] = None
    battery_level: Optional[int] = Field(100, ge=0, le=100)

class SmartBandCreate(SmartBandBase):
    pass

class SmartBandUpdate(BaseModel):
    assigned_user: Optional[UUID] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|lost|damaged)$")
    last_lat: Optional[float] = None
    last_lng: Optional[float] = None
    battery_level: Optional[int] = Field(None, ge=0, le=100)

class SmartBand(SmartBandBase):
    band_id: UUID
    updated_at: datetime


# --- 4. API ROUTERS ---

# Helper function to handle Supabase errors
def handle_supabase_error(e):
    # In a real app, you'd log the error `e`
    print(f"Supabase Error: {e}")
    raise HTTPException(status_code=500, detail="Error interacting with the database.")

# Router for Users
router_users = APIRouter(prefix="/users", tags=["Users"])

@router_users.post("/", response_model=ApiResponse)
def create_user(user: UserCreate):
    try:
        response = supabase.table("users").insert(user.dict()).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Could not create user.")
        return ApiResponse(message="User created successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_users.get("/", response_model=ApiResponse)
def get_all_users():
    try:
        response = supabase.table("users").select("*").execute()
        return ApiResponse(message="Users retrieved successfully.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_users.get("/{user_id}", response_model=ApiResponse)
def get_user_by_id(user_id: UUID):
    try:
        response = supabase.table("users").select("*").eq("user_id", str(user_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found.")
        return ApiResponse(message="User retrieved successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_users.put("/{user_id}", response_model=ApiResponse)
def update_user(user_id: UUID, user_update: UserUpdate):
    try:
        update_data = user_update.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        
        response = supabase.table("users").update(update_data).eq("user_id", str(user_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found or no changes made.")
        return ApiResponse(message="User updated successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)


# Router for Facilities
router_facilities = APIRouter(prefix="/facilities", tags=["Facilities"])

@router_facilities.post("/", response_model=ApiResponse)
def create_facility(facility: FacilityCreate):
    try:
        response = supabase.table("facilities").insert(facility.dict()).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Could not create facility.")
        return ApiResponse(message="Facility created successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_facilities.get("/", response_model=ApiResponse)
def get_facilities(
    type: Optional[str] = Query(None, description="Filter by facility type"),
    lat: Optional[float] = Query(None, description="User's latitude for nearby search"),
    lng: Optional[float] = Query(None, description="User's longitude for nearby search"),
    radius: int = Query(1000, description="Radius in meters for nearby search")
):
    try:
        if lat is not None and lng is not None:
            # RPC call for nearby facilities (you need to create this function in Supabase)
            # For now, we filter in Python which is inefficient. A DB function is preferred.
            response = supabase.table("facilities").select("*").execute()
            # This is a placeholder for a proper geospatial query.
            # In a real-world scenario, use a PostGIS function via RPC.
        else:
            query = supabase.table("facilities").select("*")
            if type:
                query = query.eq("type", type)
            response = query.execute()
        return ApiResponse(message="Facilities retrieved successfully.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_facilities.get("/{facility_id}", response_model=ApiResponse)
def get_facility_by_id(facility_id: UUID):
    try:
        response = supabase.table("facilities").select("*").eq("facility_id", str(facility_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Facility not found.")
        return ApiResponse(message="Facility retrieved successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_facilities.put("/{facility_id}", response_model=ApiResponse)
def update_facility(facility_id: UUID, facility_update: FacilityUpdate):
    try:
        update_data = facility_update.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        response = supabase.table("facilities").update(update_data).eq("facility_id", str(facility_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Facility not found.")
        return ApiResponse(message="Facility updated successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)


# ... (Routers for other modules will follow the same pattern)
# To keep the output concise, I will implement the rest of the routers with the same structure.

# Router for Shuttles
router_shuttles = APIRouter(prefix="/shuttles", tags=["Shuttles"])

@router_shuttles.post("/", response_model=ApiResponse)
def create_shuttle(shuttle: ShuttleCreate):
    try:
        response = supabase.table("shuttles").insert(shuttle.dict()).execute()
        return ApiResponse(message="Shuttle created successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_shuttles.get("/", response_model=ApiResponse)
def get_all_shuttles():
    try:
        response = supabase.table("shuttles").select("*").execute()
        return ApiResponse(message="Shuttles retrieved successfully.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_shuttles.get("/{shuttle_id}", response_model=ApiResponse)
def get_shuttle_by_id(shuttle_id: UUID):
    try:
        response = supabase.table("shuttles").select("*").eq("shuttle_id", str(shuttle_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Shuttle not found.")
        return ApiResponse(message="Shuttle retrieved successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_shuttles.put("/{shuttle_id}", response_model=ApiResponse)
def update_shuttle(shuttle_id: UUID, shuttle_update: ShuttleUpdate):
    try:
        update_data = shuttle_update.dict(exclude_unset=True)
        response = supabase.table("shuttles").update(update_data).eq("shuttle_id", str(shuttle_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Shuttle not found.")
        return ApiResponse(message="Shuttle updated successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

# Router for Parking
router_parking = APIRouter(prefix="/parking", tags=["Parking"])

@router_parking.post("/", response_model=ApiResponse)
def create_parking_slot(slot: ParkingSlotCreate):
    try:
        response = supabase.table("parking_slots").insert(slot.dict()).execute()
        return ApiResponse(message="Parking slot created successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_parking.get("/", response_model=ApiResponse)
def get_parking_availability():
    try:
        response = supabase.table("parking_slots").select("parking_area_name, lat, lng, total_capacity, available_capacity").execute()
        return ApiResponse(message="Parking availability retrieved successfully.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_parking.put("/{slot_id}", response_model=ApiResponse)
def update_parking_slot(slot_id: UUID, slot_update: ParkingSlotUpdate):
    try:
        update_data = slot_update.dict(exclude_unset=True)
        response = supabase.table("parking_slots").update(update_data).eq("slot_id", str(slot_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Parking slot not found.")
        return ApiResponse(message="Parking slot updated successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

# Router for Crowd Density
router_crowd = APIRouter(prefix="/crowd", tags=["Crowd Density"])

@router_crowd.post("/", response_model=ApiResponse)
def create_crowd_density_report(report: CrowdDensityCreate):
    try:
        # response = supabase.table("crowd_density").insert(report.dict()).execute()
        response = supabase.table("crowd_density").insert({
    "location_id": str(report.location_id),   # UUID ko string me convert karo
    "people_count": report.people_count,
    "density_level": report.density_level
}).execute()
        return ApiResponse(message="Crowd density report created.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_crowd.get("/", response_model=ApiResponse)
def get_all_crowd_density():
    try:
        # Join with facilities to get location name
        response = supabase.table("crowd_density").select("*, facilities(name, type)").execute()
        return ApiResponse(message="Crowd density data retrieved.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_crowd.put("/{density_id}", response_model=ApiResponse)
def update_crowd_density(density_id: UUID, report_update: CrowdDensityUpdate):
    try:
        update_data = report_update.dict(exclude_unset=True)
        response = supabase.table("crowd_density").update(update_data).eq("density_id", str(density_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Density report not found.")
        return ApiResponse(message="Crowd density updated.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

# Router for Emergency Reports
router_emergency = APIRouter(prefix="/emergency", tags=["Emergency"])

@router_emergency.post("/", response_model=ApiResponse)
def report_emergency(report: EmergencyReportCreate):
    try:
        response = supabase.table("emergency_reports").insert(report.dict()).execute()
        return ApiResponse(message="Emergency reported successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_emergency.get("/", response_model=ApiResponse)
def get_all_emergency_reports(status: Optional[str] = Query(None, pattern="^(open|in-progress|resolved|cancelled)$")):
    try:
        query = supabase.table("emergency_reports").select("*")
        if status:
            query = query.eq("status", status)
        response = query.order("created_at", desc=True).execute()
        return ApiResponse(message="Emergency reports retrieved.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_emergency.put("/{report_id}", response_model=ApiResponse)
def update_emergency_status(report_id: UUID, report_update: EmergencyReportUpdate):
    try:
        update_data = report_update.dict(exclude_unset=True)
        if "status" in update_data and update_data["status"] == "resolved":
            update_data["resolved_at"] = datetime.utcnow().isoformat()
            
        response = supabase.table("emergency_reports").update(update_data).eq("report_id", str(report_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Emergency report not found.")
        return ApiResponse(message="Emergency report updated.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

# Router for Missing Persons
router_missing = APIRouter(prefix="/missing", tags=["Missing Persons"])

@router_missing.post("/", response_model=ApiResponse)
def report_missing_person(report: MissingPersonCreate):
    try:
        response = supabase.table("missing_persons").insert(report.dict()).execute()
        return ApiResponse(message="Missing person reported successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_missing.get("/", response_model=ApiResponse)
def get_all_missing_person_reports(status: Optional[str] = Query(None, pattern="^(open|found|closed)$")):
    try:
        query = supabase.table("missing_persons").select("*")
        if status:
            query = query.eq("status", status)
        response = query.order("created_at", desc=True).execute()
        return ApiResponse(message="Missing person reports retrieved.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_missing.put("/{missing_id}", response_model=ApiResponse)
def update_missing_person_status(missing_id: UUID, report_update: MissingPersonUpdate):
    try:
        update_data = report_update.dict(exclude_unset=True)
        if "status" in update_data and update_data["status"] == "found":
            update_data["found_at"] = datetime.utcnow().isoformat()

        response = supabase.table("missing_persons").update(update_data).eq("missing_id", str(missing_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Missing person report not found.")
        return ApiResponse(message="Missing person report updated.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

# Router for Routes
router_routes = APIRouter(prefix="/routes", tags=["Routes"])

@router_routes.post("/", response_model=ApiResponse)
def create_route(route: RouteCreate):
    try:
        response = supabase.table("routes").insert(route.dict()).execute()
        return ApiResponse(message="Route created successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_routes.get("/", response_model=ApiResponse)
def get_all_routes():
    try:
        response = supabase.table("routes").select("*").execute()
        return ApiResponse(message="Routes retrieved successfully.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_routes.get("/{route_id}", response_model=ApiResponse)
def get_route_by_id(route_id: UUID):
    try:
        response = supabase.table("routes").select("*").eq("route_id", str(route_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Route not found.")
        return ApiResponse(message="Route retrieved successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_routes.put("/{route_id}", response_model=ApiResponse)
def update_route(route_id: UUID, route_update: RouteUpdate):
    try:
        update_data = route_update.dict(exclude_unset=True)
        response = supabase.table("routes").update(update_data).eq("route_id", str(route_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Route not found.")
        return ApiResponse(message="Route updated successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

# Router for Smart Bands
router_smartbands = APIRouter(prefix="/smartbands", tags=["Smart Bands"])

@router_smartbands.post("/", response_model=ApiResponse)
def create_smart_band(band: SmartBandCreate):
    try:
        response = supabase.table("smart_bands").insert(band.dict()).execute()
        return ApiResponse(message="Smart band created successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)

@router_smartbands.get("/", response_model=ApiResponse)
def get_all_smart_bands():
    try:
        response = supabase.table("smart_bands").select("*, users(name, phone_number)").execute()
        return ApiResponse(message="Smart bands retrieved successfully.", data=response.data)
    except Exception as e:
        handle_supabase_error(e)

@router_smartbands.put("/{band_id}", response_model=ApiResponse)
def update_smart_band(band_id: UUID, band_update: SmartBandUpdate):
    try:
        update_data = band_update.dict(exclude_unset=True)
        response = supabase.table("smart_bands").update(update_data).eq("band_id", str(band_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Smart band not found.")
        return ApiResponse(message="Smart band updated successfully.", data=response.data[0])
    except Exception as e:
        handle_supabase_error(e)


# --- 5. MAIN APP ROUTER INCLUSION ---

app.include_router(router_users)
app.include_router(router_facilities)
app.include_router(router_shuttles)
app.include_router(router_parking)
app.include_router(router_crowd)
app.include_router(router_emergency)
app.include_router(router_missing)
app.include_router(router_routes)
app.include_router(router_smartbands)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Simhastha 2028 Smart Mobility & Safety API"}

# To run this app:
# 1. Make sure you have a .env file with SUPABASE_URL and SUPABASE_KEY.
# 2. Install dependencies: pip install fastapi uvicorn python-dotenv supabase-py-async
# 3. Run with uvicorn: uvicorn app1:app --reload

# --- 6. EXAMPLE cURL REQUESTS ---
"""
# NOTE: Replace http://127.0.0.1:8000 with your actual server address.
# NOTE: Replace UUIDs like '...-...' with actual IDs from your database.

# --- Users ---
# Create User
curl -X POST "http://127.0.0.1:8000/users/" -H "Content-Type: application/json" -d '{
  "name": "Ramesh Kumar",
  "phone_number": "9876543210",
  "email": "ramesh@example.com",
  "role": "pilgrim",
  "location_lat": 23.182,
  "location_lng": 75.777
}'

# Get All Users
curl -X GET "http://127.0.0.1:8000/users/"

# Get User by ID
curl -X GET "http://127.0.0.1:8000/users/your-user-uuid-here"

# Update User
curl -X PUT "http://127.0.0.1:8000/users/your-user-uuid-here" -H "Content-Type: application/json" -d '{
  "location_lat": 23.183,
  "location_lng": 75.778
}'

# --- Facilities ---
# Create Facility
curl -X POST "http://127.0.0.1:8000/facilities/" -H "Content-Type: application/json" -d '{
  "type": "ghat",
  "name": "Ram Ghat",
  "lat": 23.1815,
  "lng": 75.7681,
  "description": "Main bathing ghat on the Kshipra River."
}'

# Get All Facilities
curl -X GET "http://127.0.0.1:8000/facilities/"

# Get Nearby Facilities
curl -X GET "http://127.0.0.1:8000/facilities/?lat=23.18&lng=75.77"

# --- Shuttles ---
# Create Shuttle
curl -X POST "http://127.0.0.1:8000/shuttles/" -H "Content-Type: application/json" -d '{
  "route_name": "Ring Road Express",
  "current_lat": 23.19,
  "current_lng": 75.78,
  "capacity": 50,
  "occupancy": 15
}'

# Update Shuttle Location
curl -X PUT "http://127.0.0.1:8000/shuttles/your-shuttle-uuid-here" -H "Content-Type: application/json" -d '{
  "current_lat": 23.191,
  "current_lng": 75.781,
  "occupancy": 20
}'

# --- Parking ---
# Create Parking Area
curl -X POST "http://127.0.0.1:8000/parking/" -H "Content-Type: application/json" -d '{
  "parking_area_name": "Nanakheda Bus Stand Parking",
  "lat": 23.176,
  "lng": 75.76,
  "total_capacity": 500,
  "available_capacity": 350
}'

# Get Parking Availability
curl -X GET "http://127.0.0.1:8000/parking/"

# --- Crowd Density ---
# Post Crowd Data
curl -X POST "http://127.0.0.1:8000/crowd/" -H "Content-Type: application/json" -d '{
  "location_id": "your-facility-uuid-for-ram-ghat",
  "people_count": 5000,
  "density_level": "high"
}'

# Get All Crowd Data
curl -X GET "http://127.0.0.1:8000/crowd/"

# --- Emergency ---
# Report Emergency
curl -X POST "http://127.0.0.1:8000/emergency/" -H "Content-Type: application/json" -d '{
  "user_id": "your-user-uuid-here",
  "lat": 23.181,
  "lng": 75.768,
  "type": "medical",
  "description": "Elderly person fainted."
}'

# Update Emergency Status
curl -X PUT "http://127.0.0.1:8000/emergency/your-report-uuid-here" -H "Content-Type: application/json" -d '{
  "status": "in-progress",
  "assigned_to": "doctor-or-volunteer-user-uuid"
}'

# --- Missing Persons ---
# Report Missing Person
curl -X POST "http://127.0.0.1:8000/missing/" -H "Content-Type: application/json" -d '{
  "reported_by": "your-user-uuid-here",
  "name": "Suresh",
  "age": 7,
  "gender": "male",
  "last_seen_lat": 23.182,
  "last_seen_lng": 75.769,
  "description": "Wearing a red t-shirt and blue shorts."
}'

# Update Missing Person Status
curl -X PUT "http://127.0.0.1:8000/missing/your-missing-person-uuid-here" -H "Content-Type: application/json" -d '{
  "status": "found"
}'

# --- Smart Bands ---
# Create (Register) a Smart Band
curl -X POST "http://127.0.0.1:8000/smartbands/" -H "Content-Type: application/json" -d '{
  "band_code": "SB-12345",
  "assigned_user": "your-user-uuid-here",
  "status": "active"
}'

# Update Smart Band Location
curl -X PUT "http://127.0.0.1:8000/smartbands/your-band-uuid-here" -H "Content-Type: application/json" -d '{
  "last_lat": 23.18,
  "last_lng": 75.77,
  "battery_level": 85
}'

"""
