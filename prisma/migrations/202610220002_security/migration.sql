-- Deny direct browser access, including when PostgreSQL is hosted by Supabase.
-- The backend uses the database owner/service role; no public policies are created.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_assets ENABLE ROW LEVEL SECURITY;

ALTER TABLE products ADD CONSTRAINT products_positive_price CHECK ("priceCents" > 0);
ALTER TABLE products ADD CONSTRAINT products_brl CHECK (currency = 'BRL');
ALTER TABLE products ADD CONSTRAINT products_access_type CHECK (
  ("accessType" = 'COMPLETE' AND instrument IS NULL) OR
  ("accessType" = 'INSTRUMENT' AND instrument IN ('violin', 'saxophone', 'flute', 'guitar', 'viola', 'cello'))
);
ALTER TABLE orders ADD CONSTRAINT orders_positive_price CHECK ("priceCents" > 0);
ALTER TABLE orders ADD CONSTRAINT orders_brl CHECK (currency = 'BRL');
ALTER TABLE library_assets ADD CONSTRAINT library_assets_kind CHECK (kind IN ('score', 'audio'));
ALTER TABLE library_assets ADD CONSTRAINT library_assets_instrument CHECK (instrument IN ('violin', 'saxophone', 'flute', 'guitar', 'viola', 'cello'));
