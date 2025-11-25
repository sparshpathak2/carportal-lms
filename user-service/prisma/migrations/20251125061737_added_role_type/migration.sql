-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('INTERNAL', 'DEALER');

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "roleType" "RoleType" NOT NULL DEFAULT 'DEALER';
