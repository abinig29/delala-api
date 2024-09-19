/*
  Warnings:

  - You are about to drop the `ClassifiedDetais` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceDetais` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassifiedDetais" DROP CONSTRAINT "ClassifiedDetais_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ClassifiedDetais" DROP CONSTRAINT "ClassifiedDetais_lastCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "ClassifiedDetais" DROP CONSTRAINT "ClassifiedDetais_productId_fkey";

-- DropForeignKey
ALTER TABLE "ClassifiedDetais" DROP CONSTRAINT "ClassifiedDetais_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceDetais" DROP CONSTRAINT "ServiceDetais_productId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceDetais" DROP CONSTRAINT "ServiceDetais_serviceId_fkey";

-- DropTable
DROP TABLE "ClassifiedDetais";

-- DropTable
DROP TABLE "ServiceDetais";

-- CreateTable
CREATE TABLE "ServiceDetails" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServiceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassifiedDetails" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "lastCategoryId" TEXT,

    CONSTRAINT "ClassifiedDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceDetails_productId_key" ON "ServiceDetails"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassifiedDetails_productId_key" ON "ClassifiedDetails"("productId");

-- AddForeignKey
ALTER TABLE "ServiceDetails" ADD CONSTRAINT "ServiceDetails_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDetails" ADD CONSTRAINT "ServiceDetails_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Serivce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetails" ADD CONSTRAINT "ClassifiedDetails_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetails" ADD CONSTRAINT "ClassifiedDetails_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MainCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetails" ADD CONSTRAINT "ClassifiedDetails_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetails" ADD CONSTRAINT "ClassifiedDetails_lastCategoryId_fkey" FOREIGN KEY ("lastCategoryId") REFERENCES "LastCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
