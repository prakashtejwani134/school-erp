/*
  Warnings:

  - You are about to drop the column `action` on the `AuditLog` table. All the data in the column will be lost.
  - Added the required column `actionType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetEntity` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('FEE_COLLECTED', 'STUDENT_CREATED', 'STUDENT_UPDATED', 'STUDENT_DELETED', 'ATTENDANCE_MARKED', 'SETTINGS_UPDATED', 'FEE_CATEGORY_CREATED', 'FEE_CATEGORY_UPDATED', 'FEE_CATEGORY_DELETED');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "action",
ADD COLUMN     "actionType" "AuditActionType" NOT NULL,
ADD COLUMN     "targetEntity" TEXT NOT NULL,
ADD COLUMN     "targetId" TEXT;

-- AlterTable
ALTER TABLE "FeeDue" ADD COLUMN     "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DataMigration: backfill amountPaid for dues already marked fully paid
UPDATE "FeeDue" SET "amountPaid" = "dueAmount" WHERE "isPaid" = true;

-- CreateIndex
CREATE INDEX "AuditLog_actionType_idx" ON "AuditLog"("actionType");

-- CreateIndex
CREATE INDEX "AuditLog_targetEntity_idx" ON "AuditLog"("targetEntity");
