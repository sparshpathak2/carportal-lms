/*
  Warnings:

  - You are about to drop the column `activityId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[leadActivityId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `leadActivityId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM ('LEAD_ADDED', 'COMMENT', 'CALL', 'MEETING', 'TEST_DRIVE', 'STATUS_UPDATE', 'CATEGORY_UPDATE', 'ASSIGNMENT', 'CALLBACK', 'FINANCE', 'EMAIL', 'OTHER');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_dealerAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_activityId_fkey";

-- DropIndex
DROP INDEX "Task_activityId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "type",
ADD COLUMN     "type" "LeadActivityType" NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "activityId",
ADD COLUMN     "leadActivityId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Activity";

-- DropEnum
DROP TYPE "ActivityType";

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "dealerAssignmentId" TEXT,
    "performedById" TEXT,
    "performedByName" TEXT,
    "type" "LeadActivityType" NOT NULL,
    "description" TEXT,
    "oldStatus" TEXT,
    "newStatus" TEXT,
    "oldCategory" TEXT,
    "newCategory" TEXT,
    "oldReason" TEXT,
    "newReason" TEXT,
    "oldAssignee" TEXT,
    "newAssignee" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_leadActivityId_key" ON "Task"("leadActivityId");

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_dealerAssignmentId_fkey" FOREIGN KEY ("dealerAssignmentId") REFERENCES "LeadDealerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_leadActivityId_fkey" FOREIGN KEY ("leadActivityId") REFERENCES "LeadActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
