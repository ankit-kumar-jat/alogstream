/*
  Warnings:

  - You are about to drop the column `isActive` on the `Signal` table. All the data in the column will be lost.
  - You are about to alter the column `budget` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `remainingBudget` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `takeProfitValue` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `stopLossValue` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - Added the required column `description` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `exchange` on the `Signal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SignalStatusType" AS ENUM ('DRAFT', 'LIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Signal" DROP COLUMN "isActive",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "status" "SignalStatusType" NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "budget" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "remainingBudget" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "exchange",
ADD COLUMN     "exchange" TEXT NOT NULL,
ALTER COLUMN "takeProfitValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "stopLossValue" SET DATA TYPE DOUBLE PRECISION;

-- DropEnum
DROP TYPE "Exchnage";
