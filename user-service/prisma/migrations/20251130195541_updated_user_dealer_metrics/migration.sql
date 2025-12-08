-- AlterTable
ALTER TABLE "UserDealerMetrics" ADD COLUMN     "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingFollowups" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "targetCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
