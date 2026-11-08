CREATE TABLE "custom_setlists" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "songs" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "custom_setlists_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "custom_setlists_userId_updatedAt_idx" ON "custom_setlists"("userId", "updatedAt");
ALTER TABLE "custom_setlists" ADD CONSTRAINT "custom_setlists_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
