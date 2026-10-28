-- Align the Complete offer description with the 42 curated setlists.
-- Prices, payment history and access permissions remain unchanged.
UPDATE "products"
SET "description" = 'Coleção de 100 partituras para violino com playbacks, em expansão. 42 setlists prontos e acesso vitalício.'
WHERE "id" = 'library-violin-playbacks';
