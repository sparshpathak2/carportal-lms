-- CreateTable
CREATE TABLE "UserDealerMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "leadsAssigned" INTEGER NOT NULL DEFAULT 0,
    "leadsDelivered" INTEGER NOT NULL DEFAULT 0,
    "leadsConverted" INTEGER NOT NULL DEFAULT 0,
    "leadsUnattended" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDealerMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDealerMetrics_userId_dealerId_date_key" ON "UserDealerMetrics"("userId", "dealerId", "date");

-- AddForeignKey
ALTER TABLE "UserDealerMetrics" ADD CONSTRAINT "UserDealerMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDealerMetrics" ADD CONSTRAINT "UserDealerMetrics_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
