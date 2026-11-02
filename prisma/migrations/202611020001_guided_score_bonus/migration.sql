BEGIN;

ALTER TABLE "library_assets" DROP CONSTRAINT "library_assets_kind";
ALTER TABLE "library_assets" ADD CONSTRAINT "library_assets_kind"
CHECK ("kind" IN ('score', 'audio', 'video'));

UPDATE "products"
SET "description" = 'Coleção de 100 partituras para violino, em expansão. 10 setlists, bônus de 23 partituras guiadas em vídeo e acesso vitalício. Não inclui playbacks em áudio.'
WHERE "id" = 'library-violin-scores';

UPDATE "products"
SET "description" = 'Coleção de 100 partituras para violino com playbacks, em expansão. 42 setlists, bônus de 23 partituras guiadas em vídeo e acesso vitalício.'
WHERE "id" = 'library-violin-playbacks';

COMMIT;
