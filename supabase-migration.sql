-- ============================================
-- OPTC Crew Building - Phase 1 : Database Setup
-- Execute this in Supabase SQL Editor
-- ============================================

-- 1. Create ENUM for stage types
CREATE TYPE stage_type AS ENUM (
  'Story',
  'Fortnight',
  'Weekly',
  'Raid',
  'Coliseum',
  'Special',
  'Training Forest',
  'Treasure Map',
  'Kizuna Clash',
  'Arena',
  'Rookie Mission',
  'Grand Voyage',
  'Pirate King Adventures'
);

-- 2. Create stages table
CREATE TABLE stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type stage_type NOT NULL,
  difficulty TEXT,                    -- e.g. 'Master', 'Ultimate', 'Challenge'
  image_url TEXT,                     -- Boss portrait URL
  global_id TEXT,                     -- ID from OPTC DB if applicable
  is_global BOOLEAN DEFAULT true,     -- Available on Global version
  is_japan BOOLEAN DEFAULT true,      -- Available on Japan version
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create index for fast search
CREATE INDEX idx_stages_name ON stages USING gin (to_tsvector('english', name));
CREATE INDEX idx_stages_type ON stages (type);

-- 4. Enable Row Level Security
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Everyone can read stages
CREATE POLICY "Stages are viewable by everyone"
  ON stages FOR SELECT
  USING (true);

-- 6. RLS Policy: Only authenticated users can insert (for future phases)
CREATE POLICY "Authenticated users can insert stages"
  ON stages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. Insert sample data (real OPTC stages)
-- ============================================
INSERT INTO stages (name, type, difficulty, is_global, is_japan) VALUES
  -- Raids
  ('Clash!! Dracule Mihawk', 'Raid', 'Master', true, true),
  ('Clash!! Monster Chopper', 'Raid', 'Master', true, true),
  ('Clash!! Garp the Fist', 'Raid', 'Master', true, true),
  ('Clash!! Donquixote Doflamingo', 'Raid', 'Ultimate', true, true),
  ('Clash!! Emporio Ivankov', 'Raid', 'Master', true, true),
  ('Clash!! Blackbeard', 'Raid', 'Ultimate', true, true),
  ('Clash!! Bartholomew Kuma', 'Raid', 'Master', true, true),
  ('Clash!! Aokiji', 'Raid', 'Ultimate', true, true),
  ('Clash!! Eneru', 'Raid', 'Ultimate', true, true),
  ('Clash!! Shiki the Golden Lion', 'Raid', 'Ultimate', true, true),
  ('Clash!! Silvers Rayleigh', 'Raid', 'Ultimate', true, true),
  ('Clash!! Sabo', 'Raid', 'Ultimate', true, true),
  ('Clash!! Ace', 'Raid', 'Ultimate', true, true),
  ('Clash!! Kaido King of the Beasts', 'Raid', 'Ultimate', true, true),
  ('Clash!! Big Mom', 'Raid', 'Ultimate', true, true),
  ('Clash!! Shanks', 'Raid', 'Ultimate', true, true),
  ('Clash!! Luffy Gear 5', 'Raid', 'Ultimate', true, true),

  -- Coliseum
  ('Coliseum Alvida', 'Coliseum', 'Chaos', true, true),
  ('Coliseum Rebecca', 'Coliseum', 'Chaos', true, true),
  ('Coliseum Kid', 'Coliseum', 'Chaos', true, true),
  ('Coliseum Hawkins', 'Coliseum', 'Chaos', true, true),
  ('Coliseum Diamante', 'Coliseum', 'Chaos', true, true),
  ('Coliseum Doflamingo', 'Coliseum', 'Chaos', true, true),
  ('Coliseum Katakuri', 'Coliseum', 'Chaos', true, true),

  -- Treasure Map
  ('Treasure Map Mihawk', 'Treasure Map', 'Grand Line', true, true),
  ('Treasure Map Whitebeard', 'Treasure Map', 'Grand Line', true, true),
  ('Treasure Map Ace', 'Treasure Map', 'Grand Line', true, true),
  ('Treasure Map Sabo', 'Treasure Map', 'Grand Line', true, true),
  ('Treasure Map Kaido', 'Treasure Map', 'New World', true, true),
  ('Treasure Map Big Mom', 'Treasure Map', 'New World', true, true),
  ('Treasure Map Shanks', 'Treasure Map', 'New World', true, true),

  -- Kizuna Clash
  ('Kizuna Clash vs Zoro & Sanji', 'Kizuna Clash', 'Ultimate', true, true),
  ('Kizuna Clash vs Big Mom', 'Kizuna Clash', 'Ultimate', true, true),
  ('Kizuna Clash vs Kaido', 'Kizuna Clash', 'Ultimate', true, true),
  ('Kizuna Clash vs King & Queen', 'Kizuna Clash', 'Ultimate', true, true),

  -- Arena
  ('Arena Crocodile', 'Arena', 'Master', true, true),
  ('Arena Boa Hancock', 'Arena', 'Master', true, true),
  ('Arena Trafalgar Law', 'Arena', 'Master', true, true),
  ('Arena Yamato', 'Arena', 'Master', true, true),

  -- Training Forest
  ('Training Forest Hawk', 'Training Forest', NULL, true, true),
  ('Training Forest Whitebeard', 'Training Forest', NULL, true, true),
  ('Training Forest Ace', 'Training Forest', NULL, true, true),
  ('Training Forest Jimbe', 'Training Forest', NULL, true, true),
  ('Training Forest Shanks', 'Training Forest', NULL, true, true),

  -- Special / Garp Challenges
  ('Garp Challenge vs. Hody', 'Special', 'Challenge', true, true),
  ('Garp Challenge vs. Katakuri', 'Special', 'Challenge', true, true),
  ('Garp Challenge vs. Big Mom', 'Special', 'Challenge', true, true),
  ('Garp Challenge vs. Kaido', 'Special', 'Challenge', true, true),

  -- Pirate King Adventures (new type!)
  ('Pirate King Adventures: Wano', 'Pirate King Adventures', 'Ultimate', true, true),
  ('Pirate King Adventures: Whole Cake Island', 'Pirate King Adventures', 'Ultimate', true, true),
  ('Pirate King Adventures: Dressrosa', 'Pirate King Adventures', 'Ultimate', true, true),

  -- Grand Voyage
  ('Grand Voyage: East Blue', 'Grand Voyage', NULL, true, true),
  ('Grand Voyage: Grand Line', 'Grand Voyage', NULL, true, true),
  ('Grand Voyage: New World', 'Grand Voyage', NULL, true, true),

  -- Rookie Mission
  ('Rookie Mission: Straw Hat Pirates', 'Rookie Mission', NULL, true, true),

  -- Story
  ('Fushia Village', 'Story', NULL, true, true),
  ('Shells Town', 'Story', NULL, true, true),
  ('Baratie', 'Story', NULL, true, true),
  ('Arlong Park', 'Story', NULL, true, true),
  ('Loguetown', 'Story', NULL, true, true),
  ('Water Seven', 'Story', NULL, true, true),
  ('Enies Lobby', 'Story', NULL, true, true),
  ('Thriller Bark', 'Story', NULL, true, true),
  ('Sabaody Archipelago', 'Story', NULL, true, true),
  ('Marineford', 'Story', NULL, true, true),
  ('Dressrosa', 'Story', NULL, true, true),
  ('Whole Cake Island', 'Story', NULL, true, true),
  ('Wano Country', 'Story', NULL, true, true);

-- ============================================
-- Done! You should see 65+ stages in your table.
-- ============================================
