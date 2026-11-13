ALTER TYPE "JobKind" ADD VALUE 'FREE_ACCESS_EMAIL';

CREATE TABLE library_free_access (
  id UUID NOT NULL,
  "userId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMPTZ(3),
  "emailSentAt" TIMESTAMPTZ(3),
  "emailLinkCiphertext" TEXT NOT NULL,
  CONSTRAINT library_free_access_pkey PRIMARY KEY (id),
  CONSTRAINT library_free_access_user_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX library_free_access_user_key ON library_free_access("userId");

CREATE TABLE library_free_samples (
  "assetId" UUID NOT NULL,
  CONSTRAINT library_free_samples_pkey PRIMARY KEY ("assetId"),
  CONSTRAINT library_free_samples_asset_fkey FOREIGN KEY ("assetId") REFERENCES library_assets(id) ON DELETE CASCADE
);
ALTER TABLE library_free_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_free_samples ENABLE ROW LEVEL SECURITY;

-- Exact existing files only. Alternate files and future imports stay locked.
INSERT INTO library_free_samples ("assetId")
SELECT id FROM library_assets WHERE "storageKey" IN (
  'violin/partituras/basico-v1/a-thousand-years.pdf',
  'violin/audios/restaurant-v1/a-thousand-years-377df778f881.mp3',
  'violin/partituras/basico-v1/perfect.pdf',
  'violin/audios/batch-v1/perfect-079f98270579.mp3',
  'violin/guided-scores/my-way-faststart-ccba2d2932d2.mp4',
  'violin/guided-scores/bondade-de-deus-4087815d5e06.mp4'
);
