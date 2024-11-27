/*
  Warnings:

  - You are about to drop the column `totalBuy` on the `DailyTradeReport` table. All the data in the column will be lost.
  - You are about to drop the column `totalSell` on the `DailyTradeReport` table. All the data in the column will be lost.
  - You are about to drop the column `totalTrades` on the `DailyTradeReport` table. All the data in the column will be lost.
  - Added the required column `buyQty` to the `DailyTradeReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellQty` to the `DailyTradeReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbolToken` to the `DailyTradeReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyTradeReport" DROP COLUMN "totalBuy",
DROP COLUMN "totalSell",
DROP COLUMN "totalTrades",
ADD COLUMN     "buyQty" INTEGER NOT NULL,
ADD COLUMN     "sellQty" INTEGER NOT NULL,
ADD COLUMN     "symbolToken" TEXT NOT NULL;
