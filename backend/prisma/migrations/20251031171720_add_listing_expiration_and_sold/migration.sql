-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isSold" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "listings_isSold_idx" ON "listings"("isSold");

-- CreateIndex
CREATE INDEX "listings_expiresAt_idx" ON "listings"("expiresAt");
