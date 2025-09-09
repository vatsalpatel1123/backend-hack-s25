# Smart Mobility & Safety App for Simhastha 2028 - Complete FastAPI Backend

import os
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
import json

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
import asyncpg
from contextlib import asynccontextmanager

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wkkejurxdvvjwtjaquab.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2VqdXJ4ZHZ2and0amFxdWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTk0NzAsImV4cCI6MjA3Mjk3NTQ3MH0.RY1MdV7my_88JH9xOcz4yjRSJ_sZ9pNIJZt3R7ql-xY")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Admin@123@db.wkkejurxdvvjwtjaquab.supabase.co:5432/postgres")

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Database connection pool
db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    yield
    await db_pool.close()

# FastAPI app
app = FastAPI(
    title="Simhastha 2028 Smart Mobility & Safety API",
    description="Complete backend for Smart Mobility & Safety App",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database connection
async def get_db():
    async with db_pool.acquire() as connection:
        yield connection

# Standard API Response Model
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

# =======================
# PYDANTIC MODELS
# =======================

class UserCreate(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None
    role: str = Field(..., pattern="^(pilgrim|volunteer|police|fire|doctor|admin)$")
    language_preference: str = "hi"
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    device_id: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    language_preference: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    device_id: Optional[str] = None

class FacilityCreate(BaseModel):
    type: str = Field(..., pattern="^(washroom|rest|mandir|akhada|food|parking|ghat|medical|police_station)$")
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    lat: float
    lng: float
    open_hours: str = "24/7"
    rating: float = Field(0.0, ge=0.0, le=5.0)

class ShuttleCreate(BaseModel):
    route_name: str
    current_lat: float
    current_lng: float
    capacity: int = 50
    occupancy: int = 0
    next_stop: Optional[str] = None
    status: str = Field("active", regex="^(active|inactive|maintenance)$")

class ShuttleUpdate(BaseModel):
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    occupancy: Optional[int] = None
    next_stop: Optional[str] = None
    status: Optional[str] = None

class ParkingCreate(BaseModel):
    parking_area_name: str
    lat: float
    lng: float
    total_capacity: int
    available_capacity: int
    price_per_hour: float = 0.0

class ParkingUpdate(BaseModel):
    available_capacity: Optional[int] = None
    price_per_hour: Optional[float] = None

class CrowdCreate(BaseModel):
    location_id: UUID
    people_count: int
    density_level: str = Field(..., regex="^(low|medium|high|critical)$")

class EmergencyCreate(BaseModel):
    user_id: Optional[UUID] = None
    lat: float
    lng: float
    type: str = Field(..., regex="^(medical|police|fire|other|accident|lost_child)$")
    description: Optional[str] = None
    priority: str = Field("medium", regex="^(low|medium|high|critical)$")

class EmergencyUpdate(BaseModel):
    status: Optional[str] = Field(None, regex="^(open|in-progress|resolved|cancelled)$")
    assigned_to: Optional[UUID] = None

class MissingPersonCreate(BaseModel):
    reported_by: Optional[UUID] = None
    name: str
    age: Optional[int] = None
    gender: Optional[str] = Field(None, regex="^(male|female|other)$")
    photo_url: Optional[str] = None
    last_seen_lat: float
    last_seen_lng: float
    description: Optional[str] = None
    contact_info: Optional[str] = None

class MissingPersonUpdate(BaseModel):
    status: Optional[str] = Field(None, regex="^(open|found|closed)$")
    assigned_volunteer: Optional[UUID] = None

class RouteCreate(BaseModel):
    route_name: Optional[str] = None
    start_point_lat: float
    start_point_lng: float
    end_point_lat: float
    end_point_lng: float
    route_points: Optional[List[Dict]] = None
    distance: Optional[float] = None
    estimated_time: Optional[int] = None
    crowd_avoidance_score: int = 0
    route_type: str = Field("walking", regex="^(walking|shuttle|vehicle)$")

class SmartBandCreate(BaseModel):
    band_code: str
    assigned_user: Optional[UUID] = None
    status: str = Field("inactive", regex="^(active|inactive|lost|damaged)$")
    last_lat: Optional[float] = None
    last_lng: Optional[float] = None
    battery_level: int = Field(100, ge=0, le=100)

class SmartBandUpdate(BaseModel):
    assigned_user: Optional[UUID] = None
    status: Optional[str] = None
    last_lat: Optional[float] = None
    last_lng: Optional[float] = None
    battery_level: Optional[int] = None

# =======================
# USER ROUTES
# =======================

@app.post("/users", response_model=APIResponse)
async def create_user(user: UserCreate, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO users (name, phone_number, email, role, language_preference, 
                          location_lat, location_lng, device_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        """
        result = await db.fetchrow(query, user.name, user.phone_number, user.email,
                                 user.role, user.language_preference, user.location_lat,
                                 user.location_lng, user.device_id)
        return APIResponse(success=True, message="User created successfully", data=dict(result))
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Phone number already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users", response_model=APIResponse)
async def get_all_users(skip: int = 0, limit: int = 100, db=Depends(get_db)):
    try:
        query = "SELECT * FROM users ORDER BY created_at DESC OFFSET $1 LIMIT $2"
        results = await db.fetch(query, skip, limit)
        return APIResponse(success=True, message="Users retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{user_id}", response_model=APIResponse)
async def get_user_by_id(user_id: UUID, db=Depends(get_db)):
    try:
        query = "SELECT * FROM users WHERE user_id = $1"
        result = await db.fetchrow(query, user_id)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return APIResponse(success=True, message="User retrieved successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/users/{user_id}", response_model=APIResponse)
async def update_user(user_id: UUID, user_update: UserUpdate, db=Depends(get_db)):
    try:
        # Build dynamic update query
        update_fields = []
        values = []
        param_count = 1
        
        for field, value in user_update.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = ${param_count} RETURNING *"
        result = await db.fetchrow(query, *values)
        
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        return APIResponse(success=True, message="User updated successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# FACILITY ROUTES
# =======================

@app.post("/facilities", response_model=APIResponse)
async def create_facility(facility: FacilityCreate, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO facilities (type, name, description, icon, lat, lng, open_hours, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        """
        result = await db.fetchrow(query, facility.type, facility.name, facility.description,
                                 facility.icon, facility.lat, facility.lng, 
                                 facility.open_hours, facility.rating)
        return APIResponse(success=True, message="Facility created successfully", data=dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/facilities", response_model=APIResponse)
async def get_facilities(
    type: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_db)
):
    try:
        conditions = []
        values = []
        param_count = 1
        
        if type:
            conditions.append(f"type = ${param_count}")
            values.append(type)
            param_count += 1
        
        # Nearby search using Haversine formula
        if lat and lng and radius:
            conditions.append(f"""
                (6371 * acos(cos(radians(${param_count})) * cos(radians(lat)) * 
                cos(radians(lng) - radians(${param_count + 1})) + 
                sin(radians(${param_count})) * sin(radians(lat)))) <= ${param_count + 2}
            """)
            values.extend([lat, lng, radius])
            param_count += 3
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        values.extend([skip, limit])
        query = f"""
        SELECT *, 
        CASE WHEN ${param_count - 2 if lat and lng and radius else 'NULL'} IS NOT NULL THEN
            (6371 * acos(cos(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * cos(radians(lat)) * 
            cos(radians(lng) - radians(${param_count - 1 if lat and lng and radius else 'NULL'})) + 
            sin(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * sin(radians(lat))))
        ELSE NULL END as distance
        FROM facilities {where_clause}
        ORDER BY distance ASC NULLS LAST, created_at DESC
        OFFSET ${param_count} LIMIT ${param_count + 1}
        """
        
        results = await db.fetch(query, *values)
        return APIResponse(success=True, message="Facilities retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/facilities/{facility_id}", response_model=APIResponse)
async def get_facility_by_id(facility_id: UUID, db=Depends(get_db)):
    try:
        query = "SELECT * FROM facilities WHERE facility_id = $1"
        result = await db.fetchrow(query, facility_id)
        if not result:
            raise HTTPException(status_code=404, detail="Facility not found")
        return APIResponse(success=True, message="Facility retrieved successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# SHUTTLE ROUTES
# =======================

@app.post("/shuttles", response_model=APIResponse)
async def create_shuttle(shuttle: ShuttleCreate, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO shuttles (route_name, current_lat, current_lng, capacity, occupancy, next_stop, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        """
        result = await db.fetchrow(query, shuttle.route_name, shuttle.current_lat,
                                 shuttle.current_lng, shuttle.capacity, shuttle.occupancy,
                                 shuttle.next_stop, shuttle.status)
        return APIResponse(success=True, message="Shuttle created successfully", data=dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/shuttles", response_model=APIResponse)
async def get_shuttles(status: Optional[str] = None, db=Depends(get_db)):
    try:
        if status:
            query = "SELECT * FROM shuttles WHERE status = $1 ORDER BY updated_at DESC"
            results = await db.fetch(query, status)
        else:
            query = "SELECT * FROM shuttles ORDER BY updated_at DESC"
            results = await db.fetch(query)
        
        return APIResponse(success=True, message="Shuttles retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/shuttles/{shuttle_id}", response_model=APIResponse)
async def update_shuttle(shuttle_id: UUID, shuttle_update: ShuttleUpdate, db=Depends(get_db)):
    try:
        update_fields = []
        values = []
        param_count = 1
        
        for field, value in shuttle_update.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(shuttle_id)
        query = f"UPDATE shuttles SET {', '.join(update_fields)} WHERE shuttle_id = ${param_count} RETURNING *"
        result = await db.fetchrow(query, *values)
        
        if not result:
            raise HTTPException(status_code=404, detail="Shuttle not found")
        
        return APIResponse(success=True, message="Shuttle updated successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# PARKING ROUTES
# =======================

@app.post("/parking", response_model=APIResponse)
async def create_parking(parking: ParkingCreate, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO parking_slots (parking_area_name, lat, lng, total_capacity, available_capacity, price_per_hour)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        """
        result = await db.fetchrow(query, parking.parking_area_name, parking.lat, parking.lng,
                                 parking.total_capacity, parking.available_capacity, parking.price_per_hour)
        return APIResponse(success=True, message="Parking slot created successfully", data=dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/parking", response_model=APIResponse)
async def get_parking_slots(
    available_only: bool = False,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = None,
    db=Depends(get_db)
):
    try:
        conditions = []
        values = []
        param_count = 1
        
        if available_only:
            conditions.append("available_capacity > 0")
        
        if lat and lng and radius:
            conditions.append(f"""
                (6371 * acos(cos(radians(${param_count})) * cos(radians(lat)) * 
                cos(radians(lng) - radians(${param_count + 1})) + 
                sin(radians(${param_count})) * sin(radians(lat)))) <= ${param_count + 2}
            """)
            values.extend([lat, lng, radius])
            param_count += 3
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        query = f"""
        SELECT *, 
        CASE WHEN ${param_count - 2 if lat and lng and radius else 'NULL'} IS NOT NULL THEN
            (6371 * acos(cos(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * cos(radians(lat)) * 
            cos(radians(lng) - radians(${param_count - 1 if lat and lng and radius else 'NULL'})) + 
            sin(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * sin(radians(lat))))
        ELSE NULL END as distance,
        ROUND((available_capacity::decimal / total_capacity) * 100, 2) as availability_percentage
        FROM parking_slots {where_clause}
        ORDER BY distance ASC NULLS LAST, availability_percentage DESC
        """
        
        results = await db.fetch(query, *values)
        return APIResponse(success=True, message="Parking slots retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/parking/{slot_id}", response_model=APIResponse)
async def update_parking(slot_id: UUID, parking_update: ParkingUpdate, db=Depends(get_db)):
    try:
        update_fields = []
        values = []
        param_count = 1
        
        for field, value in parking_update.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(slot_id)
        query = f"UPDATE parking_slots SET {', '.join(update_fields)} WHERE slot_id = ${param_count} RETURNING *"
        result = await db.fetchrow(query, *values)
        
        if not result:
            raise HTTPException(status_code=404, detail="Parking slot not found")
        
        return APIResponse(success=True, message="Parking slot updated successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# CROWD DENSITY ROUTES
# =======================

@app.post("/crowd", response_model=APIResponse)
async def create_crowd_data(crowd: CrowdCreate, db=Depends(get_db)):
    try:
        # Check if facility exists
        facility_check = await db.fetchrow("SELECT facility_id FROM facilities WHERE facility_id = $1", crowd.location_id)
        if not facility_check:
            raise HTTPException(status_code=404, detail="Facility not found")
        
        # Upsert crowd data (update if exists, insert if not)
        query = """
        INSERT INTO crowd_density (location_id, people_count, density_level)
        VALUES ($1, $2, $3)
        ON CONFLICT (location_id) DO UPDATE SET
        people_count = EXCLUDED.people_count,
        density_level = EXCLUDED.density_level,
        updated_at = NOW()
        RETURNING *
        """
        result = await db.fetchrow(query, crowd.location_id, crowd.people_count, crowd.density_level)
        return APIResponse(success=True, message="Crowd data updated successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crowd", response_model=APIResponse)
async def get_crowd_data(
    density_level: Optional[str] = None,
    location_id: Optional[UUID] = None,
    db=Depends(get_db)
):
    try:
        conditions = []
        values = []
        param_count = 1
        
        if density_level:
            conditions.append(f"cd.density_level = ${param_count}")
            values.append(density_level)
            param_count += 1
            
        if location_id:
            conditions.append(f"cd.location_id = ${param_count}")
            values.append(location_id)
            param_count += 1
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        query = f"""
        SELECT cd.*, f.name as facility_name, f.type as facility_type, f.lat, f.lng
        FROM crowd_density cd
        JOIN facilities f ON cd.location_id = f.facility_id
        {where_clause}
        ORDER BY cd.updated_at DESC
        """
        
        results = await db.fetch(query, *values)
        return APIResponse(success=True, message="Crowd data retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crowd/low-density", response_model=APIResponse)
async def get_low_density_locations(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 10,
    db=Depends(get_db)
):
    try:
        # Get facilities with low crowd density, sorted by distance if lat/lng provided
        if lat and lng:
            query = """
            SELECT cd.*, f.name as facility_name, f.type as facility_type, f.lat, f.lng,
                   (6371 * acos(cos(radians($1)) * cos(radians(f.lat)) * 
                   cos(radians(f.lng) - radians($2)) + 
                   sin(radians($1)) * sin(radians(f.lat)))) as distance
            FROM crowd_density cd
            JOIN facilities f ON cd.location_id = f.facility_id
            WHERE cd.density_level IN ('low', 'medium')
            AND (6371 * acos(cos(radians($1)) * cos(radians(f.lat)) * 
                cos(radians(f.lng) - radians($2)) + 
                sin(radians($1)) * sin(radians(f.lat)))) <= $3
            ORDER BY distance ASC, cd.people_count ASC
            """
            results = await db.fetch(query, lat, lng, radius)
        else:
            query = """
            SELECT cd.*, f.name as facility_name, f.type as facility_type, f.lat, f.lng
            FROM crowd_density cd
            JOIN facilities f ON cd.location_id = f.facility_id
            WHERE cd.density_level IN ('low', 'medium')
            ORDER BY cd.people_count ASC
            """
            results = await db.fetch(query)
        
        return APIResponse(success=True, message="Low density locations retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# EMERGENCY ROUTES
# =======================

@app.post("/emergency", response_model=APIResponse)
async def report_emergency(emergency: EmergencyCreate, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO emergency_reports (user_id, lat, lng, type, description, priority)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        """
        result = await db.fetchrow(query, emergency.user_id, emergency.lat, emergency.lng,
                                 emergency.type, emergency.description, emergency.priority)
        
        # TODO: Add notification logic here to alert nearby responders
        
        return APIResponse(success=True, message="Emergency reported successfully", data=dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/emergency", response_model=APIResponse)
async def get_emergency_reports(
    status: Optional[str] = None,
    type: Optional[str] = None,
    priority: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = None,
    skip: int = 0,
    limit: int = 50,
    db=Depends(get_db)
):
    try:
        conditions = []
        values = []
        param_count = 1
        
        if status:
            conditions.append(f"er.status = ${param_count}")
            values.append(status)
            param_count += 1
            
        if type:
            conditions.append(f"er.type = ${param_count}")
            values.append(type)
            param_count += 1
            
        if priority:
            conditions.append(f"er.priority = ${param_count}")
            values.append(priority)
            param_count += 1
        
        if lat and lng and radius:
            conditions.append(f"""
                (6371 * acos(cos(radians(${param_count})) * cos(radians(er.lat)) * 
                cos(radians(er.lng) - radians(${param_count + 1})) + 
                sin(radians(${param_count})) * sin(radians(er.lat)))) <= ${param_count + 2}
            """)
            values.extend([lat, lng, radius])
            param_count += 3
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        values.extend([skip, limit])
        
        query = f"""
        SELECT er.*, 
               u1.name as reporter_name, u1.phone_number as reporter_phone,
               u2.name as assigned_name, u2.phone_number as assigned_phone,
               CASE WHEN ${param_count - 2 if lat and lng and radius else 'NULL'} IS NOT NULL THEN
                   (6371 * acos(cos(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * cos(radians(er.lat)) * 
                   cos(radians(er.lng) - radians(${param_count - 1 if lat and lng and radius else 'NULL'})) + 
                   sin(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * sin(radians(er.lat))))
               ELSE NULL END as distance
        FROM emergency_reports er
        LEFT JOIN users u1 ON er.user_id = u1.user_id
        LEFT JOIN users u2 ON er.assigned_to = u2.user_id
        {where_clause}
        ORDER BY 
            CASE er.priority 
                WHEN 'critical' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'medium' THEN 3 
                ELSE 4 
            END,
            distance ASC NULLS LAST,
            er.created_at DESC
        OFFSET ${param_count} LIMIT ${param_count + 1}
        """
        
        results = await db.fetch(query, *values)
        return APIResponse(success=True, message="Emergency reports retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/emergency/{report_id}", response_model=APIResponse)
async def update_emergency_report(report_id: UUID, emergency_update: EmergencyUpdate, db=Depends(get_db)):
    try:
        update_fields = []
        values = []
        param_count = 1
        
        for field, value in emergency_update.dict(exclude_unset=True).items():
            if value is not None:
                if field == "status" and value == "resolved":
                    update_fields.append(f"resolved_at = NOW()")
                update_fields.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(report_id)
        query = f"UPDATE emergency_reports SET {', '.join(update_fields)} WHERE report_id = ${param_count} RETURNING *"
        result = await db.fetchrow(query, *values)
        
        if not result:
            raise HTTPException(status_code=404, detail="Emergency report not found")
        
        return APIResponse(success=True, message="Emergency report updated successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# MISSING PERSON ROUTES
# =======================

@app.post("/missing", response_model=APIResponse)
async def report_missing_person(missing: MissingPersonCreate, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO missing_persons (reported_by, name, age, gender, photo_url, 
                                   last_seen_lat, last_seen_lng, description, contact_info)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        """
        result = await db.fetchrow(query, missing.reported_by, missing.name, missing.age,
                                 missing.gender, missing.photo_url, missing.last_seen_lat,
                                 missing.last_seen_lng, missing.description, missing.contact_info)
        
        return APIResponse(success=True, message="Missing person reported successfully", data=dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/missing", response_model=APIResponse)
async def get_missing_persons(
    status: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = None,
    skip: int = 0,
    limit: int = 50,
    db=Depends(get_db)
):
    try:
        conditions = []
        values = []
        param_count = 1
        
        if status:
            conditions.append(f"mp.status = ${param_count}")
            values.append(status)
            param_count += 1
        
        if lat and lng and radius:
            conditions.append(f"""
                (6371 * acos(cos(radians(${param_count})) * cos(radians(mp.last_seen_lat)) * 
                cos(radians(mp.last_seen_lng) - radians(${param_count + 1})) + 
                sin(radians(${param_count})) * sin(radians(mp.last_seen_lat)))) <= ${param_count + 2}
            """)
            values.extend([lat, lng, radius])
            param_count += 3
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        values.extend([skip, limit])
        
        query = f"""
        SELECT mp.*, 
               u1.name as reporter_name, u1.phone_number as reporter_phone,
               u2.name as volunteer_name, u2.phone_number as volunteer_phone,
               CASE WHEN ${param_count - 2 if lat and lng and radius else 'NULL'} IS NOT NULL THEN
                   (6371 * acos(cos(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * cos(radians(mp.last_seen_lat)) * 
                   cos(radians(mp.last_seen_lng) - radians(${param_count - 1 if lat and lng and radius else 'NULL'})) + 
                   sin(radians(${param_count - 2 if lat and lng and radius else 'NULL'})) * sin(radians(mp.last_seen_lat))))
               ELSE NULL END as distance
        FROM missing_persons mp
        LEFT JOIN users u1 ON mp.reported_by = u1.user_id
        LEFT JOIN users u2 ON mp.assigned_volunteer = u2.user_id
        {where_clause}
        ORDER BY distance ASC NULLS LAST, mp.created_at DESC
        OFFSET ${param_count} LIMIT ${param_count + 1}
        """
        
        results = await db.fetch(query, *values)
        return APIResponse(success=True, message="Missing persons retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/missing/{missing_id}", response_model=APIResponse)
async def update_missing_person(missing_id: UUID, missing_update: MissingPersonUpdate, db=Depends(get_db)):
    try:
        update_fields = []
        values = []
        param_count = 1
        
        for field, value in missing_update.dict(exclude_unset=True).items():
            if value is not None:
                if field == "status" and value == "found":
                    update_fields.append(f"found_at = NOW()")
                update_fields.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(missing_id)
        query = f"UPDATE missing_persons SET {', '.join(update_fields)} WHERE missing_id = ${param_count} RETURNING *"
        result = await db.fetchrow(query, *values)
        
        if not result:
            raise HTTPException(status_code=404, detail="Missing person record not found")
        
        return APIResponse(success=True, message="Missing person record updated successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# ROUTE ROUTES
# =======================

@app.post("/routes", response_model=APIResponse)
async def create_route(route: RouteCreate, db=Depends(get_db)):
    try:
        route_points_json = json.dumps(route.route_points) if route.route_points else None
        
        query = """
        INSERT INTO routes (route_name, start_point_lat, start_point_lng, end_point_lat, end_point_lng,
                           route_points, distance, estimated_time, crowd_avoidance_score, route_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
        """
        result = await db.fetchrow(query, route.route_name, route.start_point_lat, route.start_point_lng,
                                 route.end_point_lat, route.end_point_lng, route_points_json,
                                 route.distance, route.estimated_time, route.crowd_avoidance_score,
                                 route.route_type)
        
        return APIResponse(success=True, message="Route created successfully", data=dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/routes", response_model=APIResponse)
async def get_routes(
    route_type: Optional[str] = None,
    start_lat: Optional[float] = None,
    start_lng: Optional[float] = None,
    end_lat: Optional[float] = None,
    end_lng: Optional[float] = None,
    skip: int = 0,
    limit: int = 50,
    db=Depends(get_db)
):
    try:
        conditions = []
        values = []
        param_count = 1
        
        if route_type:
            conditions.append(f"route_type = ${param_count}")
            values.append(route_type)
            param_count += 1
        
        # Find routes near start/end points if provided
        if start_lat and start_lng:
            conditions.append(f"""
                (6371 * acos(cos(radians(${param_count})) * cos(radians(start_point_lat)) * 
                cos(radians(start_point_lng) - radians(${param_count + 1})) + 
                sin(radians(${param_count})) * sin(radians(start_point_lat)))) <= 5
            """)
            values.extend([start_lat, start_lng])
            param_count += 2
        
        if end_lat and end_lng:
            conditions.append(f"""
                (6371 * acos(cos(radians(${param_count})) * cos(radians(end_point_lat)) * 
                cos(radians(end_point_lng) - radians(${param_count + 1})) + 
                sin(radians(${param_count})) * sin(radians(end_point_lat)))) <= 5
            """)
            values.extend([end_lat, end_lng])
            param_count += 2
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        values.extend([skip, limit])
        
        query = f"""
        SELECT * FROM routes 
        {where_clause}
        ORDER BY crowd_avoidance_score DESC, distance ASC, created_at DESC
        OFFSET ${param_count} LIMIT ${param_count + 1}
        """
        
        results = await db.fetch(query, *values)
        return APIResponse(success=True, message="Routes retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/routes/{route_id}", response_model=APIResponse)
async def get_route_by_id(route_id: UUID, db=Depends(get_db)):
    try:
        query = "SELECT * FROM routes WHERE route_id = $1"
        result = await db.fetchrow(query, route_id)
        if not result:
            raise HTTPException(status_code=404, detail="Route not found")
        return APIResponse(success=True, message="Route retrieved successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# SMART BAND ROUTES
# =======================

@app.post("/smartbands", response_model=APIResponse)
async def create_smart_band(band: SmartBandCreate, db=Depends(get_db)):
    try:
        query = """
        INSERT INTO smart_bands (band_code, assigned_user, status, last_lat, last_lng, battery_level)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        """
        result = await db.fetchrow(query, band.band_code, band.assigned_user, band.status,
                                 band.last_lat, band.last_lng, band.battery_level)
        return APIResponse(success=True, message="Smart band created successfully", data=dict(result))
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Band code already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/smartbands", response_model=APIResponse)
async def get_smart_bands(
    status: Optional[str] = None,
    assigned_user: Optional[UUID] = None,
    low_battery: bool = False,
    db=Depends(get_db)
):
    try:
        conditions = []
        values = []
        param_count = 1
        
        if status:
            conditions.append(f"sb.status = ${param_count}")
            values.append(status)
            param_count += 1
            
        if assigned_user:
            conditions.append(f"sb.assigned_user = ${param_count}")
            values.append(assigned_user)
            param_count += 1
            
        if low_battery:
            conditions.append("sb.battery_level <= 20")
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        query = f"""
        SELECT sb.*, u.name as user_name, u.phone_number as user_phone
        FROM smart_bands sb
        LEFT JOIN users u ON sb.assigned_user = u.user_id
        {where_clause}
        ORDER BY sb.updated_at DESC
        """
        
        results = await db.fetch(query, *values)
        return APIResponse(success=True, message="Smart bands retrieved successfully", 
                         data=[dict(row) for row in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/smartbands/{band_id}", response_model=APIResponse)
async def update_smart_band(band_id: UUID, band_update: SmartBandUpdate, db=Depends(get_db)):
    try:
        update_fields = []
        values = []
        param_count = 1
        
        for field, value in band_update.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(band_id)
        query = f"UPDATE smart_bands SET {', '.join(update_fields)} WHERE band_id = ${param_count} RETURNING *"
        result = await db.fetchrow(query, *values)
        
        if not result:
            raise HTTPException(status_code=404, detail="Smart band not found")
        
        return APIResponse(success=True, message="Smart band updated successfully", data=dict(result))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =======================
# ADDITIONAL UTILITY ROUTES
# =======================

@app.get("/dashboard/stats", response_model=APIResponse)
async def get_dashboard_stats(db=Depends(get_db)):
    try:
        stats_query = """
        SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 'pilgrim') as total_pilgrims,
            (SELECT COUNT(*) FROM users WHERE role IN ('volunteer', 'police', 'fire', 'doctor')) as total_responders,
            (SELECT COUNT(*) FROM emergency_reports WHERE status = 'open') as open_emergencies,
            (SELECT COUNT(*) FROM missing_persons WHERE status = 'open') as open_missing_cases,
            (SELECT COUNT(*) FROM shuttles WHERE status = 'active') as active_shuttles,
            (SELECT SUM(available_capacity) FROM parking_slots) as total_parking_available,
            (SELECT COUNT(*) FROM crowd_density WHERE density_level IN ('high', 'critical')) as high_crowd_areas,
            (SELECT COUNT(*) FROM smart_bands WHERE status = 'active') as active_bands
        """
        
        result = await db.fetchrow(stats_query)
        return APIResponse(success=True, message="Dashboard stats retrieved successfully", data=dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", response_model=APIResponse)
async def health_check():
    return APIResponse(success=True, message="API is healthy", data={"status": "ok", "timestamp": datetime.now(timezone.utc)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
