from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import os
from supabase import create_client, Client
import logging
import uvicorn
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration - IMPORTANT: Set these in your .env file
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Validate required environment variables
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")
if not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_ANON_KEY environment variable is required")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Pydantic models
class CameraAnalysis(BaseModel):
    score: float
    level: str
    color: str
    priority: str
    people_count: int
    max_density: float
    mean_density: float

class CameraData(BaseModel):
    camera_id: str
    camera_name: str
    density_type: str
    analysis: CameraAnalysis
    timestamp: Optional[datetime] = None

class CameraDataResponse(BaseModel):
    id: int
    camera_id: str
    camera_name: str
    density_type: str
    score: float
    level: str
    color: str
    priority: str
    people_count: int
    max_density: float
    mean_density: float
    timestamp: datetime
    created_at: datetime
    updated_at: datetime

class AlertResponse(BaseModel):
    id: int
    camera_id: str
    camera_name: str
    alert_type: str
    message: str
    severity: str
    timestamp: datetime
    is_active: bool
    created_at: datetime

class SystemOverview(BaseModel):
    total_cameras: int
    total_people: int
    high_density_cameras: int
    average_score: float
    critical_cameras: int
    active_alerts: int
    last_updated: datetime

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI application...")
    await create_tables()
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application...")

# Create FastAPI app
app = FastAPI(
    title="Multi-Camera Crowd Monitoring API",
    description="API for managing crowd monitoring data with real-time analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def create_tables():
    """
    Placeholder for table creation logic.
    In a real-world scenario, this would be handled by a migration tool like Alembic.
    For this example, we assume tables are created via the Supabase SQL editor.
    """
    logger.info("Skipping table creation. Assuming tables exist in Supabase.")

def get_supabase() -> Client:
    return supabase

@app.get("/")
async def root():
    return {"message": "Multi-Camera Crowd Monitoring API", "status": "active", "version": "1.0.0"}

@app.post("/cameras/data", response_model=dict)
async def store_camera_data(cameras: List[CameraData], db: Client = Depends(get_supabase)):
    """Store multiple camera data entries"""
    try:
        stored_data = []
        current_time = datetime.now(timezone.utc)
        current_time_iso = current_time.isoformat()

        for camera in cameras:
            # Prepare data for insertion
            # Ensure timestamp is in ISO format for Supabase
            timestamp_iso = (camera.timestamp or current_time).isoformat()

            camera_record = {
                "camera_id": camera.camera_id,
                "camera_name": camera.camera_name,
                "density_type": camera.density_type,
                "score": camera.analysis.score,
                "level": camera.analysis.level,
                "color": camera.analysis.color,
                "priority": camera.analysis.priority,
                "people_count": camera.analysis.people_count,
                "max_density": camera.analysis.max_density,
                "mean_density": camera.analysis.mean_density,
                "timestamp": timestamp_iso,
                "updated_at": current_time_iso
            }
            
            # Manual upsert: Try to update first, if no rows are affected, then insert.
            update_result = db.table("camera_data").update(camera_record).eq("camera_id", camera.camera_id).execute()

            if update_result.data:
                stored_data.append(update_result.data[0])
            else:
                # If update didn't affect any rows, insert a new record
                insert_result = db.table("camera_data").insert(camera_record).execute()
                if insert_result.data:
                    stored_data.append(insert_result.data[0])
                
                # Create alert if high priority
                if camera.analysis.score >= 70:
                    alert_data = {
                        "camera_id": camera.camera_id,
                        "camera_name": camera.camera_name,
                        "alert_type": "HIGH_CROWD_DENSITY",
                        "message": f"High crowd density detected: {camera.analysis.score}/100 score with {camera.analysis.people_count} people",
                        "severity": "HIGH" if camera.analysis.score >= 80 else "MEDIUM",
                        "timestamp": current_time_iso
                    }
                    db.table("alerts").insert(alert_data).execute()
        
        return {
            "message": f"Successfully stored data for {len(stored_data)} cameras",
            "stored_count": len(stored_data),
            "timestamp": current_time.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error storing camera data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cameras/data", response_model=List[CameraDataResponse])
async def get_camera_data(
    limit: int = 100,
    camera_id: Optional[str] = None,
    db: Client = Depends(get_supabase)
):
    """Get camera data with optional filtering"""
    try:
        query = db.table("camera_data").select("*").order("timestamp", desc=True)
        
        if camera_id:
            query = query.eq("camera_id", camera_id)
            
        result = query.limit(limit).execute()
        return result.data
        
    except Exception as e:
        logger.error(f"Error fetching camera data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cameras/latest", response_model=List[CameraDataResponse])
async def get_latest_camera_data(db: Client = Depends(get_supabase)):
    """Get the latest data for each camera"""
    try:
        # Get latest record for each camera
        result = db.rpc("get_latest_camera_data").execute()
        return result.data
        
    except Exception as e:
        # Fallback query if RPC doesn't exist
        try:
            result = db.table("camera_data").select("*").order("camera_id,timestamp", desc=True).execute()
            
            # Group by camera_id and get latest for each
            latest_data = {}
            for record in result.data:
                camera_id = record['camera_id']
                if camera_id not in latest_data:
                    latest_data[camera_id] = record
            
            return list(latest_data.values())
            
        except Exception as fallback_e:
            logger.error(f"Error fetching latest camera data: {fallback_e}")
            raise HTTPException(status_code=500, detail=str(fallback_e))

@app.get("/cameras/ranking", response_model=List[CameraDataResponse])
async def get_camera_ranking(db: Client = Depends(get_supabase)):
    """Get cameras ranked by crowd density score"""
    try:
        # Get latest data and sort by score at the database level
        latest_data = await get_latest_camera_data(db)
        
        # Sort the fetched data in Python
        # Note: A more efficient approach would be a dedicated SQL function 
        # or view that returns ranked data directly from the database.
        return sorted(latest_data, key=lambda x: x['score'], reverse=True)
        
    except Exception as e:
        logger.error(f"Error fetching camera ranking: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    active_only: bool = True,
    limit: int = 50,
    db: Client = Depends(get_supabase)
):
    """Get alerts with optional filtering"""
    try:
        query = db.table("alerts").select("*").order("timestamp", desc=True)
        
        if active_only:
            query = query.eq("is_active", True)
            
        result = query.limit(limit).execute()
        return result.data
        
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: Client = Depends(get_supabase)):
    """Mark an alert as resolved"""
    try:
        result = db.table("alerts").update({
            "is_active": False,
            "resolved_at": datetime.now(timezone.utc)
        }).eq("id", alert_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Alert not found")
            
        return {"message": "Alert resolved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/system/overview", response_model=SystemOverview)
async def get_system_overview(db: Client = Depends(get_supabase)):
    """Get system overview statistics"""
    try:
        # Get latest camera data
        latest_cameras = await get_latest_camera_data(db)
        
        # Get active alerts
        active_alerts = await get_alerts(active_only=True, db=db)
        
        # Calculate statistics
        total_cameras = len(latest_cameras)
        total_people = sum(camera['people_count'] for camera in latest_cameras)
        high_density_cameras = len([c for c in latest_cameras if c['level'] == 'HIGH'])
        average_score = sum(camera['score'] for camera in latest_cameras) / total_cameras if total_cameras > 0 else 0
        critical_cameras = len([c for c in latest_cameras if c['score'] >= 80])
        active_alert_count = len(active_alerts)
        
        return SystemOverview(
            total_cameras=total_cameras,
            total_people=total_people,
            high_density_cameras=high_density_cameras,
            average_score=round(average_score, 1),
            critical_cameras=critical_cameras,
            active_alerts=active_alert_count,
            last_updated=datetime.now(timezone.utc)
        )
        
    except Exception as e:
        logger.error(f"Error getting system overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/cameras/data")
async def clear_old_data(days: int = 7, db: Client = Depends(get_supabase)):
    """Clear camera data older than specified days"""
    try:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        result = db.table("camera_data").delete().lt("timestamp", cutoff_date.isoformat()).execute()
        
        return {
            "message": f"Cleared camera data older than {days} days",
            "deleted_count": len(result.data) if result.data else 0
        }
        
    except Exception as e:
        logger.error(f"Error clearing old data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        result = supabase.table("camera_data").select("id").limit(1).execute()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8005,
        reload=True,
        log_level="info"
    )
