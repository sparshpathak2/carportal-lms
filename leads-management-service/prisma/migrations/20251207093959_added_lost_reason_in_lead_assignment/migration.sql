-- AlterTable
ALTER TABLE "LeadAssignment" ADD COLUMN     "lostReasonId" TEXT;

-- AddForeignKey
ALTER TABLE "LeadAssignment" ADD CONSTRAINT "LeadAssignment_lostReasonId_fkey" FOREIGN KEY ("lostReasonId") REFERENCES "LeadLostReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
