-- Drop tables that are no longer needed
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "ticket_approvals" CASCADE;

-- Alter tickets table
ALTER TABLE "tickets" DROP COLUMN IF EXISTS "priority";
ALTER TABLE "tickets" DROP COLUMN IF EXISTS "assignedToId";
ALTER TABLE "tickets" DROP COLUMN IF EXISTS "imagePath";
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';
