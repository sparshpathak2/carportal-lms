/*
  Warnings:

  - You are about to drop the column `dealerAssignmentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `dealerAssignmentId` on the `LeadActivity` table. All the data in the column will be lost.
  - You are about to drop the `LeadDealerAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_dealerAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "LeadActivity" DROP CONSTRAINT "LeadActivity_dealerAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "LeadDealerAssignment" DROP CONSTRAINT "LeadDealerAssignment_leadId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "dealerAssignmentId",
ADD COLUMN     "leadAssignmentId" TEXT;

-- AlterTable
ALTER TABLE "LeadActivity" DROP COLUMN "dealerAssignmentId",
ADD COLUMN     "leadAssignmentId" TEXT;

-- DropTable
DROP TABLE "LeadDealerAssignment";

-- CreateTable
CREATE TABLE "LeadAssignment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assignedToName" TEXT,
    "assignedById" TEXT,
    "assignedByName" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deliveredMetricFlag" BOOLEAN NOT NULL DEFAULT false,
    "convertedMetricFlag" BOOLEAN NOT NULL DEFAULT false,
    "statusId" TEXT,
    "category" "LeadCategory",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeadAssignment" ADD CONSTRAINT "LeadAssignment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAssignment" ADD CONSTRAINT "LeadAssignment_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "LeadStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_leadAssignmentId_fkey" FOREIGN KEY ("leadAssignmentId") REFERENCES "LeadAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadAssignmentId_fkey" FOREIGN KEY ("leadAssignmentId") REFERENCES "LeadAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
