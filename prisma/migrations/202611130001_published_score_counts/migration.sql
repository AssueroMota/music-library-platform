-- Only descriptions change; prices, access and existing orders are preserved.
UPDATE products
SET description = '116 partituras normais para violino, 10 setlists prontos e acesso vitalício. Não inclui playbacks nem partituras guiadas.'
WHERE id = 'library-violin-scores';

UPDATE products
SET description = '151 partituras para violino: 116 normais + 35 guiadas em vídeo. Inclui 116 playbacks, 42 setlists e acesso vitalício.'
WHERE id = 'library-violin-playbacks';
