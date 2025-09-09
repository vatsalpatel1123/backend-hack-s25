-- Smart Mobility & Safety App for Simhastha 2028 - Complete SQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('pilgrim', 'volunteer', 'police', 'fire', 'doctor', 'admin')),
    language_preference VARCHAR(10) DEFAULT 'hi',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Facilities table
CREATE TABLE facilities (
    facility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('washroom', 'rest', 'mandir', 'akhada', 'food', 'parking', 'ghat', 'medical', 'police_station')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    open_hours VARCHAR(50) DEFAULT '24/7',
    rating DECIMAL(3, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Shuttles table
CREATE TABLE shuttles (
    shuttle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255) NOT NULL,
    current_lat DECIMAL(10, 8) NOT NULL,
    current_lng DECIMAL(11, 8) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 50,
    occupancy INTEGER NOT NULL DEFAULT 0,
    next_stop VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Parking slots table
CREATE TABLE parking_slots (
    slot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parking_area_name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    total_capacity INTEGER NOT NULL,
    available_capacity INTEGER NOT NULL,
    price_per_hour DECIMAL(8, 2) DEFAULT 0.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crowd density table
CREATE TABLE crowd_density (
    density_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES facilities(facility_id) ON DELETE CASCADE,
    people_count INTEGER NOT NULL DEFAULT 0,
    density_level VARCHAR(10) NOT NULL CHECK (density_level IN ('low', 'medium', 'high', 'critical')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Emergency reports table
CREATE TABLE emergency_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('medical', 'police', 'fire', 'other', 'accident', 'lost_child')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'cancelled')),
    assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. Missing persons table
CREATE TABLE missing_persons (
    missing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    photo_url TEXT,
    last_seen_lat DECIMAL(10, 8) NOT NULL,
    last_seen_lng DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'found', 'closed')),
    assigned_volunteer UUID REFERENCES users(user_id) ON DELETE SET NULL,
    description TEXT,
    contact_info VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    found_at TIMESTAMP WITH TIME ZONE
);

-- 8. Routes table
CREATE TABLE routes (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255),
    start_point_lat DECIMAL(10, 8) NOT NULL,
    start_point_lng DECIMAL(11, 8) NOT NULL,
    end_point_lat DECIMAL(10, 8) NOT NULL,
    end_point_lng DECIMAL(11, 8) NOT NULL,
    route_points JSONB, -- Array of {lat, lng, instruction} waypoints
    distance DECIMAL(8, 2), -- in kilometers
    estimated_time INTEGER, -- in minutes
    crowd_avoidance_score INTEGER DEFAULT 0, -- 0-100 scale
    route_type VARCHAR(20) DEFAULT 'walking' CHECK (route_type IN ('walking', 'shuttle', 'vehicle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Smart bands table
CREATE TABLE smart_bands (
    band_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    band_code VARCHAR(50) UNIQUE NOT NULL,
    assigned_user UUID REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'lost', 'damaged')),
    last_lat DECIMAL(10, 8),
    last_lng DECIMAL(11, 8),
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional useful tables for enhanced functionality

-- 10. Notifications table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('emergency', 'alert', 'info', 'reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Geofences table (for area-based alerts)
CREATE TABLE geofences (
    geofence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    radius DECIMAL(8, 2) NOT NULL, -- in meters
    type VARCHAR(50) NOT NULL CHECK (type IN ('restricted', 'vip', 'emergency', 'parking', 'facility')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location_lat, location_lng);

CREATE INDEX idx_facilities_type ON facilities(type);
CREATE INDEX idx_facilities_location ON facilities(lat, lng);

CREATE INDEX idx_shuttles_location ON shuttles(current_lat, current_lng);
CREATE INDEX idx_shuttles_status ON shuttles(status);

CREATE INDEX idx_parking_location ON parking_slots(lat, lng);

CREATE INDEX idx_crowd_location ON crowd_density(location_id);
CREATE INDEX idx_crowd_updated ON crowd_density(updated_at);

CREATE INDEX idx_emergency_status ON emergency_reports(status);
CREATE INDEX idx_emergency_type ON emergency_reports(type);
CREATE INDEX idx_emergency_location ON emergency_reports(lat, lng);
CREATE INDEX idx_emergency_created ON emergency_reports(created_at);

CREATE INDEX idx_missing_status ON missing_persons(status);
CREATE INDEX idx_missing_location ON missing_persons(last_seen_lat, last_seen_lng);

CREATE INDEX idx_routes_points ON routes(start_point_lat, start_point_lng, end_point_lat, end_point_lng);

CREATE INDEX idx_bands_user ON smart_bands(assigned_user);
CREATE INDEX idx_bands_status ON smart_bands(status);
CREATE INDEX idx_bands_location ON smart_bands(last_lat, last_lng);

-- Triggers for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shuttles_updated_at BEFORE UPDATE ON shuttles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parking_updated_at BEFORE UPDATE ON parking_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crowd_updated_at BEFORE UPDATE ON crowd_density FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bands_updated_at BEFORE UPDATE ON smart_bands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();