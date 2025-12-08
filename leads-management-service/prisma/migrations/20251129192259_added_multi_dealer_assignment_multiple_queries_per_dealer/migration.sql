/*
  Warnings:

  - You are about to drop the column `alternatePhone` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToName` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `dealerId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `leadForwardedTo` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "dealerAssignmentId" TEXT;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "alternatePhone",
DROP COLUMN "assignedToId",
DROP COLUMN "assignedToName",
DROP COLUMN "city",
DROP COLUMN "dealerId",
DROP COLUMN "email",
DROP COLUMN "leadForwardedTo",
DROP COLUMN "location",
DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAnalytics" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "internalUserId" TEXT,
    "dealerId" TEXT,
    "firstDeliveredAt" TIMESTAMP(3),
    "firstConvertedAt" TIMESTAMP(3),
    "deliveredMetricFlag" BOOLEAN NOT NULL DEFAULT false,
    "convertedMetricFlag" BOOLEAN NOT NULL DEFAULT false,
    "currentStatusOrder" INTEGER,
    "lastStatusChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadDealerAssignment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deliveredMetricFlag" BOOLEAN NOT NULL DEFAULT false,
    "convertedMetricFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadDealerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadAnalytics_leadId_key" ON "LeadAnalytics"("leadId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAnalytics" ADD CONSTRAINT "LeadAnalytics_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadDealerAssignment" ADD CONSTRAINT "LeadDealerAssignment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_dealerAssignmentId_fkey" FOREIGN KEY ("dealerAssignmentId") REFERENCES "LeadDealerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
