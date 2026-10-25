-- Keep legacy product records and historical orders; retire their public sale.
ALTER TABLE products DROP CONSTRAINT products_access_type;
ALTER TABLE products ADD CONSTRAINT products_access_type CHECK (
  ("accessType" = 'COMPLETE' AND instrument IS NULL) OR
  ("accessType" IN ('INSTRUMENT', 'SCORES') AND instrument IN ('violin', 'saxophone', 'flute', 'guitar', 'viola', 'cello'))
);

UPDATE products SET available = false
WHERE id IN ('library-violin', 'library-saxophone', 'library-flute', 'library-guitar', 'library-viola', 'library-cello', 'library-complete');

INSERT INTO products (id, code, name, description, "priceCents", currency, available, "accessType", instrument)
VALUES
  ('library-violin-scores', 'ML-VIOLIN-SCORES', 'Violino · Partituras', '25 partituras para violino. Não inclui playbacks.', 1290, 'BRL', true, 'SCORES', 'violin'),
  ('library-violin-playbacks', 'ML-VIOLIN-PLAYBACKS', 'Violino · Partituras + Playbacks', '100 partituras para violino com os respectivos playbacks.', 2790, 'BRL', true, 'INSTRUMENT', 'violin')
ON CONFLICT (id) DO NOTHING;
