/*
  Warnings:

  - The `status` column on the `Inquiry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'ANSWERED');

-- AlterTable
ALTER TABLE "Inquiry" DROP COLUMN "status",
ADD COLUMN     "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "InquirySatus";
