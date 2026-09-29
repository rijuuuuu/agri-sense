-- AGRISENSE POSTGRESQL / SUPABASE INITIAL SCHEMA
-- Enables UUID and creates core relational entities with Row Level Security

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Farmer Profiles
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone_number VARCHAR(30),
    preferred_language VARCHAR(10) DEFAULT 'en',
    farming_experience_years INT DEFAULT 0,
    approximate_budget NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    farm_name VARCHAR(150) NOT NULL,
    total_area_acres NUMERIC(8, 2) NOT NULL CHECK (total_area_acres > 0),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    village_district VARCHAR(150),
    state_province VARCHAR(150),
    country VARCHAR(100) DEFAULT 'India',
    climate_zone VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Soil Profiles
CREATE TABLE IF NOT EXISTS soil_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    soil_type VARCHAR(50) NOT NULL,
    ph_level NUMERIC(3, 1),
    nitrogen_level VARCHAR(20),
    phosphorus_level VARCHAR(20),
    potassium_level VARCHAR(20),
    organic_matter_pct NUMERIC(4, 2),
    drainage_quality VARCHAR(30) DEFAULT 'well_drained',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Water Profiles
CREATE TABLE IF NOT EXISTS water_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    water_source VARCHAR(60) NOT NULL,
    availability_status VARCHAR(40) NOT NULL,
    irrigation_method VARCHAR(60) NOT NULL,
    storage_capacity_liters NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Master Crops Reference
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(50) PRIMARY KEY,
    common_name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    category VARCHAR(50) NOT NULL,
    suitable_seasons TEXT[] NOT NULL,
    min_temp_celsius NUMERIC(4, 1) NOT NULL,
    max_temp_celsius NUMERIC(4, 1) NOT NULL,
    optimal_rainfall_mm_min NUMERIC(6, 1) NOT NULL,
    optimal_rainfall_mm_max NUMERIC(6, 1) NOT NULL,
    min_soil_ph NUMERIC(3, 1) DEFAULT 5.5,
    max_soil_ph NUMERIC(3, 1) DEFAULT 7.5,
    preferred_soil_types TEXT[] NOT NULL,
    duration_days_min INT NOT NULL,
    duration_days_max INT NOT NULL,
    water_requirement_level VARCHAR(20) NOT NULL,
    average_yield_per_acre_kg NUMERIC(8, 2),
    estimated_cost_per_acre NUMERIC(10, 2),
    management_complexity VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crop Cycles
CREATE TABLE IF NOT EXISTS crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_id VARCHAR(50) NOT NULL REFERENCES crops(id),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    current_stage VARCHAR(40) NOT NULL,
    planted_area_acres NUMERIC(8, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Farm Tasks (Today's Actions)
CREATE TABLE IF NOT EXISTS farm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE SET NULL,
    category VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    generated_by VARCHAR(30) DEFAULT 'rule_engine',
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage own profile"
    ON farmer_profiles FOR ALL
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Farmers can manage own farms"
    ON farms FOR ALL
    USING (farmer_id IN (SELECT id FROM farmer_profiles WHERE auth_user_id = auth.uid()));
