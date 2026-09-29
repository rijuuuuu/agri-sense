-- AGRISENSE COMPLETE FEATURES & USER ISOLATION SCHEMA
-- Migration 002: Adds fields, disease scans, AI conversations/messages, expenses/resources, and recommendations with strict RLS

-- 8. Farm Fields (Sub-plots within a farm)
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    field_name VARCHAR(150) NOT NULL,
    area_acres NUMERIC(8, 2) NOT NULL CHECK (area_acres > 0),
    current_crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Disease Scans (Computer Vision & Agronomic Diagnostics)
CREATE TABLE IF NOT EXISTS disease_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_id VARCHAR(50) REFERENCES crops(id),
    crop_name VARCHAR(100),
    stage VARCHAR(40),
    affected_part VARCHAR(30) NOT NULL,
    condition_name VARCHAR(200) NOT NULL,
    condition_scientific VARCHAR(200),
    confidence_pct NUMERIC(4, 1) NOT NULL,
    confidence_rating VARCHAR(30) NOT NULL,
    uncertainty_factors TEXT,
    observations TEXT[] NOT NULL DEFAULT '{}',
    recommended_actions TEXT[] NOT NULL DEFAULT '{}',
    prevention_tips TEXT[] DEFAULT '{}',
    requires_extension_verification BOOLEAN DEFAULT TRUE,
    safety_notice TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI Conversations and Messages
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    title VARCHAR(200) DEFAULT 'Farm Advisory Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    grounding_citations TEXT[] DEFAULT '{}',
    action_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Farm Expenses and Resource Ledger
CREATE TABLE IF NOT EXISTS farm_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE SET NULL,
    category VARCHAR(40) NOT NULL CHECK (category IN ('seeds', 'fertilizer', 'pesticide', 'labor', 'irrigation', 'machinery', 'other')),
    description VARCHAR(250) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Crop Recommendations Log
CREATE TABLE IF NOT EXISTS crop_recommendations_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL,
    soil_type VARCHAR(50) NOT NULL,
    water_availability VARCHAR(40) NOT NULL,
    top_recommended_crop_id VARCHAR(50) REFERENCES crops(id),
    suitability_score_pct INT NOT NULL,
    rationale TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_recommendations_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies with Tenant/User Isolation
CREATE POLICY "Farmers can manage own fields"
    ON fields FOR ALL
    USING (farm_id IN (
        SELECT f.id FROM farms f 
        JOIN farmer_profiles fp ON f.farmer_id = fp.id 
        WHERE fp.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can manage own disease scans"
    ON disease_scans FOR ALL
    USING (farm_id IN (
        SELECT f.id FROM farms f 
        JOIN farmer_profiles fp ON f.farmer_id = fp.id 
        WHERE fp.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can manage own conversations"
    ON ai_conversations FOR ALL
    USING (auth_user_id = auth.uid());

CREATE POLICY "Farmers can manage own conversation messages"
    ON ai_messages FOR ALL
    USING (conversation_id IN (
        SELECT id FROM ai_conversations WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can manage own farm expenses"
    ON farm_expenses FOR ALL
    USING (farm_id IN (
        SELECT f.id FROM farms f 
        JOIN farmer_profiles fp ON f.farmer_id = fp.id 
        WHERE fp.auth_user_id = auth.uid()
    ));

CREATE POLICY "Farmers can manage own crop recommendation logs"
    ON crop_recommendations_log FOR ALL
    USING (farm_id IN (
        SELECT f.id FROM farms f 
        JOIN farmer_profiles fp ON f.farmer_id = fp.id 
        WHERE fp.auth_user_id = auth.uid()
    ));
