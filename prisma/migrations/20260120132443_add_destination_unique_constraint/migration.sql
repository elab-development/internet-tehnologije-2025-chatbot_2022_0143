/*
  Warnings:

  - A unique constraint covering the columns `[name,city,country]` on the table `Destination` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Destination_name_city_country_key" ON "Destination"("name", "city", "country");
