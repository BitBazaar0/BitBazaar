-- This migration assumes all listings have been migrated to use categoryId
-- from the previous migration (add_categories_table)

-- Ensure all listings have categoryId (set to 'cat_other' if null)
UPDATE "listings" SET "categoryId" = 'cat_other' WHERE "categoryId" IS NULL;

-- Make categoryId required (set NOT NULL)
ALTER TABLE "listings" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop the partType column and its index (no longer needed)
DROP INDEX IF EXISTS "listings_partType_idx";
ALTER TABLE "listings" DROP COLUMN IF EXISTS "partType";

