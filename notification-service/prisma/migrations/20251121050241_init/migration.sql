-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LEAD_ADDED', 'COMMENT', 'CALL', 'MEETING', 'TEST_DRIVE', 'STATUS_UPDATE', 'ASSIGNMENT', 'CALLBACK', 'FINANCE', 'EMAIL', 'OTHER');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "type" "ActivityType",
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "generatedById" TEXT,
    "generatedBy" TEXT,
    "meta" JSONB,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
