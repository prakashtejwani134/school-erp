-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateTable
CREATE TABLE "SchoolSettings" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currentAcademicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeCategoryRule" (
    "id" TEXT NOT NULL,
    "schoolSettingsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" "FeeFrequency" NOT NULL,
    "lateFeePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeCategoryRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeCategoryRule_schoolSettingsId_idx" ON "FeeCategoryRule"("schoolSettingsId");

-- AddForeignKey
ALTER TABLE "FeeCategoryRule" ADD CONSTRAINT "FeeCategoryRule_schoolSettingsId_fkey" FOREIGN KEY ("schoolSettingsId") REFERENCES "SchoolSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

