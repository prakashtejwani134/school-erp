-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "concessionApprovedBy" TEXT,
ADD COLUMN     "concessionGrantedAt" TIMESTAMP(3),
ADD COLUMN     "concessionReason" TEXT;

-- CreateIndex
CREATE INDEX "Student_concessionApprovedBy_idx" ON "Student"("concessionApprovedBy");

-- CreateIndex
CREATE INDEX "Student_concessionGrantedAt_idx" ON "Student"("concessionGrantedAt");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_concessionApprovedBy_fkey" FOREIGN KEY ("concessionApprovedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
