-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "dealerAssignmentId" TEXT;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_dealerAssignmentId_fkey" FOREIGN KEY ("dealerAssignmentId") REFERENCES "LeadDealerAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
