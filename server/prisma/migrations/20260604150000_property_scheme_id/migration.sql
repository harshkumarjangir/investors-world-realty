-- AlterTable
ALTER TABLE "Property" ADD COLUMN "schemeId" TEXT;

-- CreateIndex
CREATE INDEX "Property_schemeId_idx" ON "Property"("schemeId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
