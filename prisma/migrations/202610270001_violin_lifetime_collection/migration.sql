-- Update the owner-authorized offer copy without changing prices, availability or existing orders.
UPDATE "products"
SET "description" = 'Coleção de 100 partituras para violino, em expansão. 10 setlists prontos e acesso vitalício. Não inclui playbacks.'
WHERE "id" = 'library-violin-scores';

UPDATE "products"
SET "description" = 'Coleção de 100 partituras para violino com playbacks, em expansão. 10 setlists prontos e acesso vitalício.'
WHERE "id" = 'library-violin-playbacks';
