-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "features" DROP NOT NULL,
ALTER COLUMN "features" SET DATA TYPE TEXT;
