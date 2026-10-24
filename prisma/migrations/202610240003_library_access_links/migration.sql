CREATE TABLE "library_access_links" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "secretHash" TEXT NOT NULL,
  "secretCiphertext" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rotatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "library_access_links_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "library_access_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "library_access_links_hash" CHECK ("secretHash" ~ '^[a-f0-9]{64}$')
);
CREATE UNIQUE INDEX "library_access_links_userId_key" ON "library_access_links"("userId");
ALTER TABLE "library_access_links" ENABLE ROW LEVEL SECURITY;
