-- CreateTable
CREATE TABLE "PropertyCommissionSlab" (
    "id" TEXT NOT NULL,
    "minArea" INTEGER NOT NULL,
    "maxArea" INTEGER NOT NULL,
    "sellerPercent" DECIMAL(65,30) NOT NULL,
    "level1Percent" DECIMAL(65,30) NOT NULL,
    "level2Percent" DECIMAL(65,30) NOT NULL,
    "level3Percent" DECIMAL(65,30) NOT NULL,
    "level4Percent" DECIMAL(65,30) NOT NULL,
    "level5Percent" DECIMAL(65,30) NOT NULL,
    "level6Percent" DECIMAL(65,30) NOT NULL,
    "level7Percent" DECIMAL(65,30) NOT NULL,
    "level8Percent" DECIMAL(65,30) NOT NULL,
    "level9Percent" DECIMAL(65,30) NOT NULL,
    "level10Percent" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyCommissionSlab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertySaleCommission" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "associateId" TEXT NOT NULL,
    "sellerAssociateId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "propertyPrice" DECIMAL(65,30) NOT NULL,
    "propertyArea" INTEGER NOT NULL,
    "commissionAmount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertySaleCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyCommissionSlab_minArea_maxArea_idx" ON "PropertyCommissionSlab"("minArea", "maxArea");

-- CreateIndex
CREATE INDEX "PropertySaleCommission_propertyId_idx" ON "PropertySaleCommission"("propertyId");

-- CreateIndex
CREATE INDEX "PropertySaleCommission_associateId_idx" ON "PropertySaleCommission"("associateId");

-- CreateIndex
CREATE INDEX "PropertySaleCommission_bookingId_idx" ON "PropertySaleCommission"("bookingId");

-- CreateIndex
CREATE INDEX "PropertySaleCommission_status_idx" ON "PropertySaleCommission"("status");
