/*
  Warnings:

  - You are about to drop the column `gameName` on the `fixed_services` table. All the data in the column will be lost.
  - You are about to drop the column `platformName` on the `fixed_services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."fixed_services" DROP COLUMN "gameName",
DROP COLUMN "platformName";

-- CreateTable
CREATE TABLE "public"."platforms" (
    "id" TEXT NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platforms_igdbId_key" ON "public"."platforms"("igdbId");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_slug_key" ON "public"."platforms"("slug");

-- AddForeignKey
ALTER TABLE "public"."fixed_services" ADD CONSTRAINT "fixed_services_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fixed_services" ADD CONSTRAINT "fixed_services_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "public"."platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
