-- ============================================
-- OPTC Crew Building - Phase 2 : Teams System
-- Execute this in Supabase SQL Editor
-- ============================================

-- 1. Create teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- e.g. "Garp Challenge vs. Hody - PSY Roger"
  description TEXT,                            -- Optional general description
  video_url TEXT,                              -- YouTube link (optional)
  captain_id INTEGER NOT NULL,                 -- OPTC DB character ID for the captain
  friend_captain_id INTEGER NOT NULL,          -- OPTC DB character ID for friend captain
  ship TEXT,                                   -- Ship name (optional)
  score INTEGER DEFAULT 0,                     -- Like count (for future Phase 6)
  submitted_by TEXT DEFAULT 'Anonymous',       -- Username (no auth yet)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create team_units table (6 units per team + supports)
CREATE TABLE team_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  unit_id INTEGER NOT NULL,                    -- OPTC DB character ID
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 6),
  -- Position layout:
  -- 1 = Captain          | 2 = Friend Captain
  -- 3 = Crew member 1    | 4 = Crew member 2
  -- 5 = Crew member 3    | 6 = Crew member 4
  support_id INTEGER,                          -- OPTC DB character ID for support (optional)
  UNIQUE(team_id, position)
);

-- 3. Create team_guides table (stage-by-stage walkthrough)
CREATE TABLE team_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,               -- Stage 1, 2, 3...
  description TEXT NOT NULL,                   -- Full guide text for this stage
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(team_id, stage_number)
);

-- 4. Create indexes
CREATE INDEX idx_teams_stage ON teams(stage_id);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_teams_created ON teams(created_at DESC);
CREATE INDEX idx_team_units_team ON team_units(team_id);
CREATE INDEX idx_team_guides_team ON team_guides(team_id);

-- 5. Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_guides ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - Everyone can read
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Team units are viewable by everyone" ON team_units FOR SELECT USING (true);
CREATE POLICY "Team guides are viewable by everyone" ON team_guides FOR SELECT USING (true);

-- 7. RLS Policies - Anyone can insert (password-protected site for now)
CREATE POLICY "Anyone can insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert team units" ON team_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert team guides" ON team_guides FOR INSERT WITH CHECK (true);

-- 8. Auto-update timestamp trigger for teams
CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Done! You now have the teams system ready.
-- ============================================
