-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductCategory" ADD VALUE 'SERVICE';
ALTER TYPE "ProductCategory" ADD VALUE 'CLASSIFIED';

-- CreateTable
CREATE TABLE "ServiceDetais" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServiceDetais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassifiedDetais" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "lastCategoryId" TEXT,

    CONSTRAINT "ClassifiedDetais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Serivce" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Serivce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "MainCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainCategoryId" TEXT NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LastCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,

    CONSTRAINT "LastCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceDetais_productId_key" ON "ServiceDetais"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassifiedDetais_productId_key" ON "ClassifiedDetais"("productId");

-- AddForeignKey
ALTER TABLE "ServiceDetais" ADD CONSTRAINT "ServiceDetais_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDetais" ADD CONSTRAINT "ServiceDetais_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Serivce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetais" ADD CONSTRAINT "ClassifiedDetais_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetais" ADD CONSTRAINT "ClassifiedDetais_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MainCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetais" ADD CONSTRAINT "ClassifiedDetais_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDetais" ADD CONSTRAINT "ClassifiedDetais_lastCategoryId_fkey" FOREIGN KEY ("lastCategoryId") REFERENCES "LastCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "MainCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastCategory" ADD CONSTRAINT "LastCategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
