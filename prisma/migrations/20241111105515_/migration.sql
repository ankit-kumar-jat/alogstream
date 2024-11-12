/*
  Warnings:

  - You are about to drop the column `stopLossType` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `takeProfitType` on the `Signal` table. All the data in the column will be lost.
  - Added the required column `targetStopLossType` to the `Signal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Signal" DROP COLUMN "stopLossType",
DROP COLUMN "takeProfitType",
ADD COLUMN     "targetStopLossType" TEXT NOT NULL;
