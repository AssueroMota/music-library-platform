-- Update only the two current offer descriptions to use the public product names.
UPDATE products
SET description = replace(
  replace(description, 'partituras normais', 'partituras'),
  '116 normais', '116 partituras'
)
WHERE id IN ('library-violin-scores', 'library-violin-playbacks');
