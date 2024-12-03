/*
  Warnings:

  - Added the required column `tickSize` to the `Instrument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instrument" ADD COLUMN     "tickSize" DECIMAL(65,30) NOT NULL;
