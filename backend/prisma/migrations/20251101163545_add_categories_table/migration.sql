-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- AlterTable: Make partType nullable and add categoryId
ALTER TABLE "listings" 
  ADD COLUMN "categoryId" TEXT,
  ALTER COLUMN "partType" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "listings_categoryId_idx" ON "listings"("categoryId");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed categories
INSERT INTO "categories" ("id", "name", "slug", "displayName", "color", "isActive", "createdAt", "updatedAt") VALUES
('cat_gpu', 'GPU', 'gpu', 'GPUS', '#6366f1', true, NOW(), NOW()),
('cat_cpu', 'CPU', 'cpu', 'CPUS', '#10b981', true, NOW(), NOW()),
('cat_ram', 'RAM', 'ram', 'MEMORY', '#f59e0b', true, NOW(), NOW()),
('cat_motherboard', 'Motherboard', 'motherboard', 'MOTHERBOARDS', '#8b5cf6', true, NOW(), NOW()),
('cat_storage', 'Storage', 'storage', 'STORAGE', '#ec4899', true, NOW(), NOW()),
('cat_psu', 'PSU', 'psu', 'POWER SUPPLIES', '#3b82f6', true, NOW(), NOW()),
('cat_case', 'Case', 'case', 'GAMING PCS', '#14b8a6', true, NOW(), NOW()),
('cat_cooling', 'Cooling', 'cooling', 'COOLING', '#06b6d4', true, NOW(), NOW()),
('cat_peripheral', 'Peripheral', 'peripheral', 'PERIPHERALS', '#a855f7', true, NOW(), NOW()),
('cat_monitor', 'Monitor', 'monitor', 'MONITORS', '#f97316', true, NOW(), NOW()),
('cat_other', 'Other', 'other', 'OTHER', '#64748b', true, NOW(), NOW());

-- Migrate existing listings: Map partType to categoryId
UPDATE "listings" SET "categoryId" = 'cat_gpu' WHERE "partType" = 'GPU';
UPDATE "listings" SET "categoryId" = 'cat_cpu' WHERE "partType" = 'CPU';
UPDATE "listings" SET "categoryId" = 'cat_ram' WHERE "partType" = 'RAM';
UPDATE "listings" SET "categoryId" = 'cat_motherboard' WHERE "partType" = 'Motherboard';
UPDATE "listings" SET "categoryId" = 'cat_storage' WHERE "partType" = 'Storage';
UPDATE "listings" SET "categoryId" = 'cat_psu' WHERE "partType" = 'PSU';
UPDATE "listings" SET "categoryId" = 'cat_case' WHERE "partType" = 'Case';
UPDATE "listings" SET "categoryId" = 'cat_cooling' WHERE "partType" = 'Cooling';
UPDATE "listings" SET "categoryId" = 'cat_peripheral' WHERE "partType" = 'Peripheral';
UPDATE "listings" SET "categoryId" = 'cat_monitor' WHERE "partType" = 'Monitor';
UPDATE "listings" SET "categoryId" = 'cat_other' WHERE "partType" = 'Other' OR "partType" IS NULL;
