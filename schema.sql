CREATE TABLE IF NOT EXISTS progress (
  device_id          TEXT PRIMARY KEY,
  profile            JSONB   DEFAULT '{}',
  completed_chapters TEXT[]  DEFAULT '{}',
  completed_exercises TEXT[] DEFAULT '{}',
  completed_sessions TEXT[]  DEFAULT '{}',
  attempts           JSONB   DEFAULT '{}',
  streak             INTEGER DEFAULT 0,
  last_study         DATE,
  updated_at         TIMESTAMPTZ DEFAULT now()
);
