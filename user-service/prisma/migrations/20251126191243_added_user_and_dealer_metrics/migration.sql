/*
  Warnings:

  - You are about to drop the column `leadTarget` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "leadTarget",
ADD COLUMN     "liveDailyTarget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "liveMonthlyTarget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "liveWeeklyTarget" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "leadsAssigned" INTEGER NOT NULL DEFAULT 0,
    "leadsConverted" INTEGER NOT NULL DEFAULT 0,
    "leadsUnattended" INTEGER NOT NULL DEFAULT 0,
    "pendingFollowups" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "dailyTarget" INTEGER NOT NULL DEFAULT 0,
    "weeklyTarget" INTEGER NOT NULL DEFAULT 0,
    "monthlyTarget" INTEGER NOT NULL DEFAULT 0,
    "targetCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerMetrics" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "leadsDelivered" INTEGER NOT NULL DEFAULT 0,
    "leadsConverted" INTEGER NOT NULL DEFAULT 0,
    "dailyTarget" INTEGER NOT NULL DEFAULT 0,
    "weeklyTarget" INTEGER NOT NULL DEFAULT 0,
    "monthlyTarget" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerMetrics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserMetrics" ADD CONSTRAINT "UserMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerMetrics" ADD CONSTRAINT "DealerMetrics_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
