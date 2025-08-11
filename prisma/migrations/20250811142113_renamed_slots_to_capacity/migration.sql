/*
  Warnings:

  - You are about to drop the column `slots` on the `fixed_services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."fixed_services" DROP COLUMN "slots",
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 1;
