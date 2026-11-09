ALTER TABLE "custom_setlists"
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'personal',
  ADD COLUMN "eventDate" VARCHAR(10),
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ready';
