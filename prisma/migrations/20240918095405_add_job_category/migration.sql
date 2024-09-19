-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE', 'TEMPORARY', 'VOLUNTEER');

-- AlterEnum
ALTER TYPE "ProductCategory" ADD VALUE 'JOB';

-- CreateTable
CREATE TABLE "JobDetails" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "salary" DOUBLE PRECISION,
    "type" "JobType" NOT NULL,
    "description" TEXT,

    CONSTRAINT "JobDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobDetails_productId_key" ON "JobDetails"("productId");

-- AddForeignKey
ALTER TABLE "JobDetails" ADD CONSTRAINT "JobDetails_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
