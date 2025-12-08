-- CreateEnum
CREATE TYPE "PackType" AS ENUM ('LEADS', 'DIGITAL_MARKETING');

-- AlterTable
ALTER TABLE "Pack" ADD COLUMN     "packType" "PackType" NOT NULL DEFAULT 'LEADS';
