/*
  Warnings:

  - You are about to drop the column `city` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Destination` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nameCity,country]` on the table `Destination` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameCity` to the `Destination` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Destination_name_city_country_key";

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "city",
DROP COLUMN "imageUrl",
DROP COLUMN "name",
ADD COLUMN     "nameCity" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Destination_nameCity_country_key" ON "Destination"("nameCity", "country");
