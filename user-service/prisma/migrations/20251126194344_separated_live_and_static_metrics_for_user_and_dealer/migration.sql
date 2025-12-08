/*
  Warnings:

  - You are about to drop the column `dailyTarget` on the `DealerMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyTarget` on the `DealerMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyTarget` on the `DealerMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `dailyTarget` on the `UserMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyTarget` on the `UserMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyTarget` on the `UserMetrics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dealer" ADD COLUMN     "liveDailyTarget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "liveMonthlyTarget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "liveWeeklyTarget" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DealerMetrics" DROP COLUMN "dailyTarget",
DROP COLUMN "monthlyTarget",
DROP COLUMN "weeklyTarget";

-- AlterTable
ALTER TABLE "UserMetrics" DROP COLUMN "dailyTarget",
DROP COLUMN "monthlyTarget",
DROP COLUMN "weeklyTarget";
