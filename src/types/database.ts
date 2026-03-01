export type StageType =
  | 'Story'
  | 'Fortnight'
  | 'Weekly'
  | 'Raid'
  | 'Coliseum'
  | 'Special'
  | 'Training Forest'
  | 'Treasure Map'
  | 'Kizuna Clash'
  | 'Arena'
  | 'Rookie Mission'
  | 'Grand Voyage'
  | 'Pirate King Adventures';

export interface Stage {
  id: string;
  name: string;
  type: StageType;
  difficulty: string | null;
  image_url: string | null;
  global_id: string | null;
  is_global: boolean;
  is_japan: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  stage_id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  captain_id: number;
  friend_captain_id: number;
  ship: string | null;
  score: number;
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamUnit {
  id: string;
  team_id: string;
  unit_id: number;
  position: number;
  support_id: number | null;
}

export interface TeamGuide {
  id: string;
  team_id: string;
  stage_number: number;
  description: string;
  sort_order: number;
}

export interface TeamWithDetails extends Team {
  units: TeamUnit[];
  guides: TeamGuide[];
  stage?: Stage;
}

// OPTC DB character (simplified)
export interface OPTCCharacter {
  id: number;
  name: string;
  type: string;
  class: string | string[];
  stars: number;
}

export interface Database {
  public: {
    Tables: {
      stages: {
        Row: Stage;
        Insert: Omit<Stage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Stage, 'id'>>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'score'>;
        Update: Partial<Omit<Team, 'id'>>;
      };
      team_units: {
        Row: TeamUnit;
        Insert: Omit<TeamUnit, 'id'>;
        Update: Partial<Omit<TeamUnit, 'id'>>;
      };
      team_guides: {
        Row: TeamGuide;
        Insert: Omit<TeamGuide, 'id'>;
        Update: Partial<Omit<TeamGuide, 'id'>>;
      };
    };
  };
}

// All stage types for filtering
export const STAGE_TYPES: StageType[] = [
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
  'Pirate King Adventures',
];

// Colors for stage type badges
export const STAGE_TYPE_COLORS: Record<StageType, string> = {
  'Story': 'bg-gray-600',
  'Fortnight': 'bg-teal-600',
  'Weekly': 'bg-slate-600',
  'Raid': 'bg-red-700',
  'Coliseum': 'bg-orange-600',
  'Special': 'bg-yellow-600',
  'Training Forest': 'bg-emerald-700',
  'Treasure Map': 'bg-blue-600',
  'Kizuna Clash': 'bg-purple-600',
  'Arena': 'bg-rose-600',
  'Rookie Mission': 'bg-cyan-600',
  'Grand Voyage': 'bg-indigo-600',
  'Pirate King Adventures': 'bg-amber-600',
};
