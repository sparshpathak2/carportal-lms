/*
  Warnings:

  - Added the required column `assignedToId` to the `LeadDealerAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LeadDealerAssignment" ADD COLUMN     "assignedToId" TEXT NOT NULL;
