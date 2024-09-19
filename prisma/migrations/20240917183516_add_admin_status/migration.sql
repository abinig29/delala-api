-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "adminStatus" "AdminStatus" NOT NULL DEFAULT 'PENDING';
