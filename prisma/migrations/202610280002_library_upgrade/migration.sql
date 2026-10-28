ALTER TABLE "orders" ADD COLUMN "upgradeFromOrderId" UUID;
CREATE INDEX "orders_upgradeFromOrderId_idx" ON "orders"("upgradeFromOrderId");
ALTER TABLE "orders" ADD CONSTRAINT "orders_upgradeFromOrderId_fkey"
  FOREIGN KEY ("upgradeFromOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
