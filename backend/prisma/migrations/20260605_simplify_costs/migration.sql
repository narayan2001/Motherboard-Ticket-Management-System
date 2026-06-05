-- Simplify diagnosis costs: merge partsCost and laborCost into single repairCost field

-- Add the new repairCost column
ALTER TABLE "ticket_diagnoses" ADD COLUMN IF NOT EXISTS "repairCost" DOUBLE PRECISION DEFAULT 0;

-- Copy data: use totalCost as repairCost (since totalCost was sum of parts and labor)
UPDATE "ticket_diagnoses" SET "repairCost" = "totalCost" WHERE "repairCost" = 0;

-- Drop the old columns
ALTER TABLE "ticket_diagnoses" DROP COLUMN IF EXISTS "partsCost";
ALTER TABLE "ticket_diagnoses" DROP COLUMN IF EXISTS "laborCost";
ALTER TABLE "ticket_diagnoses" DROP COLUMN IF EXISTS "totalCost";
