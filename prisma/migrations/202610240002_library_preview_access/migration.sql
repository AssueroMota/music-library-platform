CREATE TABLE "library_preview_access" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "instrument" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "revokedAt" TIMESTAMPTZ(3),
  CONSTRAINT "library_preview_access_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "library_preview_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "library_preview_access_instrument" CHECK ("instrument" IN ('violin', 'saxophone', 'flute', 'guitar', 'viola', 'cello')),
  CONSTRAINT "library_preview_access_expiry" CHECK ("expiresAt" > "createdAt")
);
CREATE UNIQUE INDEX "library_preview_access_userId_instrument_key" ON "library_preview_access"("userId", "instrument");
ALTER TABLE "library_preview_access" ENABLE ROW LEVEL SECURITY;
