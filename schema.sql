-- ============================================================
-- Mundial 2026 · Resort Xcaret · Supabase Schema
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS matches (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team     text        NOT NULL,
  away_team     text        NOT NULL,
  home_flag     text        NOT NULL,
  away_flag     text        NOT NULL,
  kick_off      timestamptz NOT NULL,
  group_name    text        NOT NULL,
  stage         text        NOT NULL DEFAULT 'group',
  status        text        NOT NULL DEFAULT 'upcoming'
                            CHECK (status IN ('upcoming','live','finished')),
  home_score    integer     DEFAULT 0,
  away_score    integer     DEFAULT 0,
  home_score_ht integer,
  away_score_ht integer,
  minute        integer,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guests (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text        NOT NULL,
  room_number   text        NOT NULL,
  resort        text        NOT NULL DEFAULT 'Xcaret',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id          uuid        NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  match_id          uuid        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_result  text        NOT NULL CHECK (predicted_result IN ('home','draw','away')),
  predicted_home    integer,
  predicted_away    integer,
  predicted_home_ht integer,
  predicted_away_ht integer,
  points_earned     integer,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(guest_id, match_id)
);

CREATE TABLE IF NOT EXISTS flash_offers (
  id               uuid           DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id         uuid           NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  title            text           NOT NULL,
  description      text,
  original_price   numeric(10,2)  NOT NULL,
  sale_price       numeric(10,2)  NOT NULL,
  currency         text           NOT NULL DEFAULT 'MXN',
  duration_seconds integer        DEFAULT 3600,
  active           boolean        DEFAULT true,
  created_at       timestamptz    DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moments (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id    uuid        NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  match_id    uuid        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('gol','ambiente','grupo','reaccion')),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ratings (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id    uuid        NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  match_id    uuid        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  score       integer     NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(guest_id, match_id)
);

-- ── INDEXES ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_matches_status    ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_kick_off  ON matches(kick_off);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_guest ON predictions(guest_id);
CREATE INDEX IF NOT EXISTS idx_flash_offers_match ON flash_offers(match_id, active);

-- ── POINTS TRIGGER ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Fires when a match transitions to 'finished'
  IF NEW.status = 'finished' AND (OLD.status IS DISTINCT FROM 'finished') THEN
    UPDATE predictions p
    SET points_earned = (
      -- 100 pts for correct winner
      CASE
        WHEN (NEW.home_score > NEW.away_score  AND p.predicted_result = 'home') OR
             (NEW.home_score = NEW.away_score  AND p.predicted_result = 'draw') OR
             (NEW.home_score < NEW.away_score  AND p.predicted_result = 'away')
        THEN 100 ELSE 0
      END
      -- +200 pts for exact final score
      + CASE
        WHEN p.predicted_home IS NOT NULL
         AND p.predicted_away IS NOT NULL
         AND p.predicted_home = NEW.home_score
         AND p.predicted_away = NEW.away_score
        THEN 200 ELSE 0
      END
      -- +50 pts for exact halftime score
      + CASE
        WHEN p.predicted_home_ht IS NOT NULL
         AND p.predicted_away_ht IS NOT NULL
         AND NEW.home_score_ht IS NOT NULL
         AND NEW.away_score_ht IS NOT NULL
         AND p.predicted_home_ht = NEW.home_score_ht
         AND p.predicted_away_ht = NEW.away_score_ht
        THEN 50 ELSE 0
      END
    )
    WHERE p.match_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_finished ON matches;
CREATE TRIGGER trg_match_finished
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION calculate_prediction_points();

-- ── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings      ENABLE ROW LEVEL SECURITY;

-- matches: read-only for everyone
CREATE POLICY "matches_select" ON matches FOR SELECT TO anon USING (true);

-- guests: insert + read
CREATE POLICY "guests_insert" ON guests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "guests_select" ON guests FOR SELECT TO anon USING (true);

-- predictions: insert + read (unique constraint prevents duplicates)
CREATE POLICY "predictions_insert" ON predictions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "predictions_select" ON predictions FOR SELECT TO anon USING (true);

-- flash_offers: read-only
CREATE POLICY "flash_offers_select" ON flash_offers FOR SELECT TO anon USING (true);

-- moments: insert + read
CREATE POLICY "moments_insert" ON moments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "moments_select" ON moments FOR SELECT TO anon USING (true);

-- ratings: insert + read
CREATE POLICY "ratings_insert" ON ratings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "ratings_select" ON ratings FOR SELECT TO anon USING (true);

-- Enable realtime for live features
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE predictions;

-- ── SEED: 48 GROUP STAGE MATCHES ────────────────────────────
-- 16 grupos × 3 partidos = 48 partidos
-- Horarios en CDT (UTC-6) · Sedes: México, USA, Canadá
-- Partido demo: México vs Portugal (Grupo C) → status = 'live'

INSERT INTO matches (home_team, away_team, home_flag, away_flag, kick_off, group_name, stage, status, home_score, away_score, minute) VALUES

-- ── GRUPO A ─────────────────────────────────────────────────
('Argentina',  'Polonia',      '🇦🇷','🇵🇱', '2026-06-11T14:00:00-06:00', 'A', 'group', 'upcoming', 0, 0, NULL),
('Argentina',  'Arabia Saudita','🇦🇷','🇸🇦', '2026-06-17T17:00:00-06:00', 'A', 'group', 'upcoming', 0, 0, NULL),
('Polonia',    'Arabia Saudita','🇵🇱','🇸🇦', '2026-06-23T14:00:00-06:00', 'A', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO B ─────────────────────────────────────────────────
('Francia',    'Uruguay',      '🇫🇷','🇺🇾', '2026-06-11T17:00:00-06:00', 'B', 'group', 'upcoming', 0, 0, NULL),
('Francia',    'Túnez',        '🇫🇷','🇹🇳', '2026-06-17T20:00:00-06:00', 'B', 'group', 'upcoming', 0, 0, NULL),
('Uruguay',    'Túnez',        '🇺🇾','🇹🇳', '2026-06-23T17:00:00-06:00', 'B', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO C ─────────────────────────────────────────────────
('México',     'Ecuador',      '🇲🇽','🇪🇨', '2026-06-12T11:00:00-06:00', 'C', 'group', 'upcoming', 0, 0, NULL),
('México',     'Portugal',     '🇲🇽','🇵🇹', '2026-06-18T20:00:00-06:00', 'C', 'group', 'live',     1, 0, 67),  -- ← DEMO LIVE
('Portugal',   'Ecuador',      '🇵🇹','🇪🇨', '2026-06-24T14:00:00-06:00', 'C', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO D ─────────────────────────────────────────────────
('Brasil',     'Suiza',        '🇧🇷','🇨🇭', '2026-06-12T14:00:00-06:00', 'D', 'group', 'upcoming', 0, 0, NULL),
('Brasil',     'Camerún',      '🇧🇷','🇨🇲', '2026-06-18T14:00:00-06:00', 'D', 'group', 'upcoming', 0, 0, NULL),
('Suiza',      'Camerún',      '🇨🇭','🇨🇲', '2026-06-24T17:00:00-06:00', 'D', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO E ─────────────────────────────────────────────────
('Inglaterra', 'USA',          '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇺🇸', '2026-06-12T17:00:00-06:00', 'E', 'group', 'upcoming', 0, 0, NULL),
('Inglaterra', 'Irán',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇮🇷', '2026-06-18T11:00:00-06:00', 'E', 'group', 'upcoming', 0, 0, NULL),
('USA',        'Irán',         '🇺🇸','🇮🇷', '2026-06-24T20:00:00-06:00', 'E', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO F ─────────────────────────────────────────────────
('España',     'Japón',        '🇪🇸','🇯🇵', '2026-06-13T11:00:00-06:00', 'F', 'group', 'upcoming', 0, 0, NULL),
('España',     'Costa Rica',   '🇪🇸','🇨🇷', '2026-06-19T14:00:00-06:00', 'F', 'group', 'upcoming', 0, 0, NULL),
('Japón',      'Costa Rica',   '🇯🇵','🇨🇷', '2026-06-25T11:00:00-06:00', 'F', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO G ─────────────────────────────────────────────────
('Países Bajos','Senegal',     '🇳🇱','🇸🇳', '2026-06-13T14:00:00-06:00', 'G', 'group', 'upcoming', 0, 0, NULL),
('Países Bajos','Qatar',       '🇳🇱','🇶🇦', '2026-06-19T17:00:00-06:00', 'G', 'group', 'upcoming', 0, 0, NULL),
('Senegal',    'Qatar',        '🇸🇳','🇶🇦', '2026-06-25T14:00:00-06:00', 'G', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO H ─────────────────────────────────────────────────
('Bélgica',    'Canadá',       '🇧🇪','🇨🇦', '2026-06-13T17:00:00-06:00', 'H', 'group', 'upcoming', 0, 0, NULL),
('Bélgica',    'Marruecos',    '🇧🇪','🇲🇦', '2026-06-19T20:00:00-06:00', 'H', 'group', 'upcoming', 0, 0, NULL),
('Canadá',     'Marruecos',    '🇨🇦','🇲🇦', '2026-06-25T17:00:00-06:00', 'H', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO I ─────────────────────────────────────────────────
('Alemania',   'Australia',    '🇩🇪','🇦🇺', '2026-06-14T11:00:00-06:00', 'I', 'group', 'upcoming', 0, 0, NULL),
('Alemania',   'Ghana',        '🇩🇪','🇬🇭', '2026-06-20T14:00:00-06:00', 'I', 'group', 'upcoming', 0, 0, NULL),
('Australia',  'Ghana',        '🇦🇺','🇬🇭', '2026-06-26T11:00:00-06:00', 'I', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO J ─────────────────────────────────────────────────
('Italia',     'Colombia',     '🇮🇹','🇨🇴', '2026-06-14T14:00:00-06:00', 'J', 'group', 'upcoming', 0, 0, NULL),
('Italia',     'Corea del Sur','🇮🇹','🇰🇷', '2026-06-20T17:00:00-06:00', 'J', 'group', 'upcoming', 0, 0, NULL),
('Colombia',   'Corea del Sur','🇨🇴','🇰🇷', '2026-06-26T14:00:00-06:00', 'J', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO K ─────────────────────────────────────────────────
('Croacia',    'Perú',         '🇭🇷','🇵🇪', '2026-06-14T17:00:00-06:00', 'K', 'group', 'upcoming', 0, 0, NULL),
('Croacia',    'Costa de Marfil','🇭🇷','🇨🇮', '2026-06-20T20:00:00-06:00', 'K', 'group', 'upcoming', 0, 0, NULL),
('Perú',       'Costa de Marfil','🇵🇪','🇨🇮', '2026-06-26T17:00:00-06:00', 'K', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO L ─────────────────────────────────────────────────
('Serbia',     'Chile',        '🇷🇸','🇨🇱', '2026-06-11T20:00:00-06:00', 'L', 'group', 'upcoming', 0, 0, NULL),
('Serbia',     'Argelia',      '🇷🇸','🇩🇿', '2026-06-17T11:00:00-06:00', 'L', 'group', 'upcoming', 0, 0, NULL),
('Chile',      'Argelia',      '🇨🇱','🇩🇿', '2026-06-23T20:00:00-06:00', 'L', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO M ─────────────────────────────────────────────────
('Dinamarca',  'Nigeria',      '🇩🇰','🇳🇬', '2026-06-12T20:00:00-06:00', 'M', 'group', 'upcoming', 0, 0, NULL),
('Dinamarca',  'Bolivia',      '🇩🇰','🇧🇴', '2026-06-18T17:00:00-06:00', 'M', 'group', 'upcoming', 0, 0, NULL),
('Nigeria',    'Bolivia',      '🇳🇬','🇧🇴', '2026-06-24T11:00:00-06:00', 'M', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO N ─────────────────────────────────────────────────
('Suecia',     'Turquía',      '🇸🇪','🇹🇷', '2026-06-13T20:00:00-06:00', 'N', 'group', 'upcoming', 0, 0, NULL),
('Suecia',     'Nueva Zelanda','🇸🇪','🇳🇿', '2026-06-19T11:00:00-06:00', 'N', 'group', 'upcoming', 0, 0, NULL),
('Turquía',    'Nueva Zelanda','🇹🇷','🇳🇿', '2026-06-25T20:00:00-06:00', 'N', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO O ─────────────────────────────────────────────────
('Ucrania',    'Paraguay',     '🇺🇦','🇵🇾', '2026-06-14T20:00:00-06:00', 'O', 'group', 'upcoming', 0, 0, NULL),
('Ucrania',    'Zambia',       '🇺🇦','🇿🇲', '2026-06-20T11:00:00-06:00', 'O', 'group', 'upcoming', 0, 0, NULL),
('Paraguay',   'Zambia',       '🇵🇾','🇿🇲', '2026-06-26T20:00:00-06:00', 'O', 'group', 'upcoming', 0, 0, NULL),

-- ── GRUPO P ─────────────────────────────────────────────────
('Gales',      'Honduras',     '🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇭🇳', '2026-06-14T14:00:00-06:00', 'P', 'group', 'upcoming', 0, 0, NULL),
('Gales',      'Jamaica',      '🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇯🇲', '2026-06-20T20:00:00-06:00', 'P', 'group', 'upcoming', 0, 0, NULL),
('Honduras',   'Jamaica',      '🇭🇳','🇯🇲', '2026-06-26T14:00:00-06:00', 'P', 'group', 'upcoming', 0, 0, NULL);

-- ── SEED: FLASH OFFERS (partido demo México vs Portugal) ─────

INSERT INTO flash_offers (match_id, title, description, original_price, sale_price, currency, duration_seconds, active)
SELECT
  m.id,
  offer.title,
  offer.description,
  offer.original_price,
  offer.sale_price,
  'MXN',
  3600,
  true
FROM matches m,
(VALUES
  ('2x1 en Cocteles Xcaret',
   'Pide 2 cocteles de la barra premium durante el partido y paga solo uno',
   650, 325),
  ('Upgrade a Suite con Vista al Mar',
   'Mejora tu habitación esta noche mientras dura el partido. Sujeto a disponibilidad',
   4200, 2100),
  ('Tour Nocturno Xcaret México',
   'Acceso especial al show de esta noche con descuento de partido',
   1800, 900),
  ('Masaje de 30 min en Spa',
   'Relájate después del partido con un masaje express en el Spa Xcaret',
   1200, 600)
) AS offer(title, description, original_price, sale_price)
WHERE m.home_team = 'México' AND m.away_team = 'Portugal';
