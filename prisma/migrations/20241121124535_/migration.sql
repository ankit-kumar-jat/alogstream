-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Exchange" AS ENUM ('BSE', 'NSE', 'NFO', 'MCX', 'BFO', 'CDS', 'NCDEX', 'NCO');

-- CreateEnum
CREATE TYPE "TargetStopLossType" AS ENUM ('POINTS', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerAccount" (
    "id" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "feedToken" TEXT NOT NULL,
    "isLoginRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BrokerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "brokerOrderId" TEXT NOT NULL,
    "brokerUniqueOrderId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "pendingQty" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "price" DECIMAL(65,30),
    "profitLoss" DECIMAL(65,30),
    "brokrage" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "brokerAccountId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "label" TEXT,
    "status" "SignalStatus" NOT NULL DEFAULT 'DRAFT',
    "type" TEXT NOT NULL,
    "exchange" "Exchange" NOT NULL,
    "tickerSymbol" TEXT NOT NULL,
    "tickerSymbolToken" TEXT NOT NULL,
    "allocatedFund" DECIMAL(65,30) NOT NULL,
    "targetStopLossType" "TargetStopLossType" NOT NULL,
    "takeProfitValue" DECIMAL(65,30) NOT NULL,
    "stopLossValue" DECIMAL(65,30) NOT NULL,
    "size" INTEGER NOT NULL,
    "pyramiding" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTradeReport" (
    "id" TEXT NOT NULL,
    "exchange" "Exchange" NOT NULL,
    "symbol" TEXT NOT NULL,
    "totalTrades" INTEGER NOT NULL,
    "totalBuy" INTEGER NOT NULL,
    "totalSell" INTEGER NOT NULL,
    "pnl" DECIMAL(65,30) NOT NULL,
    "userId" TEXT NOT NULL,
    "brokerAccountId" TEXT NOT NULL,

    CONSTRAINT "DailyTradeReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
    "token" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expiry" TEXT,
    "type" TEXT,
    "exchange" "Exchange" NOT NULL,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "_BrokerAccountToSignal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerAccount_userId_clientId_key" ON "BrokerAccount"("userId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_brokerOrderId_brokerUniqueOrderId_key" ON "Order"("brokerOrderId", "brokerUniqueOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "_BrokerAccountToSignal_AB_unique" ON "_BrokerAccountToSignal"("A", "B");

-- CreateIndex
CREATE INDEX "_BrokerAccountToSignal_B_index" ON "_BrokerAccountToSignal"("B");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerAccount" ADD CONSTRAINT "BrokerAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "BrokerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTradeReport" ADD CONSTRAINT "DailyTradeReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTradeReport" ADD CONSTRAINT "DailyTradeReport_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "BrokerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrokerAccountToSignal" ADD CONSTRAINT "_BrokerAccountToSignal_A_fkey" FOREIGN KEY ("A") REFERENCES "BrokerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrokerAccountToSignal" ADD CONSTRAINT "_BrokerAccountToSignal_B_fkey" FOREIGN KEY ("B") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
