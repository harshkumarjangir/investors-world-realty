-- Add rank and totalAreaSold to Associate model
ALTER TABLE "Associate" ADD COLUMN "rank" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Associate" ADD COLUMN "totalAreaSold" INTEGER NOT NULL DEFAULT 0;
