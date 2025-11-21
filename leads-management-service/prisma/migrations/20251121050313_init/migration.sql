-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('LEAD_ADDED', 'COMMENT', 'CALL', 'MEETING', 'TEST_DRIVE', 'STATUS_UPDATE', 'CATEGORY_UPDATE', 'ASSIGNMENT', 'CALLBACK', 'FINANCE', 'EMAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LeadCategory" AS ENUM ('COLD', 'WARM', 'HOT');

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "oldModel" TEXT,
    "location" TEXT,
    "city" TEXT,
    "leadForwardedTo" TEXT[],
    "testDrive" BOOLEAN NOT NULL DEFAULT false,
    "finance" BOOLEAN NOT NULL DEFAULT false,
    "occupation" TEXT,
    "budget" INTEGER,
    "category" "public"."LeadCategory" NOT NULL DEFAULT 'COLD',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "statusId" TEXT,
    "lostReasonId" TEXT,
    "adId" TEXT,
    "adsetId" TEXT,
    "campaignId" TEXT,
    "adName" TEXT,
    "adsetName" TEXT,
    "campaignName" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LeadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeadLostReason" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "LeadLostReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserFilter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "performedById" TEXT,
    "performedByName" TEXT,
    "type" "public"."ActivityType" NOT NULL,
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

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FbUserToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FbUserToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FbPageToken" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageName" TEXT,
    "accessToken" TEXT NOT NULL,
    "userTokenId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FbPageToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadStatus_name_key" ON "public"."LeadStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserFilter_userId_type_key" ON "public"."UserFilter"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Task_activityId_key" ON "public"."Task"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "FbPageToken_pageId_key" ON "public"."FbPageToken"("pageId");

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "public"."LeadStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_lostReasonId_fkey" FOREIGN KEY ("lostReasonId") REFERENCES "public"."LeadLostReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadLostReason" ADD CONSTRAINT "LeadLostReason_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "public"."LeadStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FbPageToken" ADD CONSTRAINT "FbPageToken_userTokenId_fkey" FOREIGN KEY ("userTokenId") REFERENCES "public"."FbUserToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
