/*
  Warnings:

  - You are about to drop the column `ghibliSelected` on the `BotUserState` table. All the data in the column will be lost.
  - You are about to drop the column `sanrioSelected` on the `BotUserState` table. All the data in the column will be lost.
  - You are about to drop the column `houseType` on the `HouseClaim` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BotUserState" DROP COLUMN "ghibliSelected",
DROP COLUMN "sanrioSelected";

-- AlterTable
ALTER TABLE "HouseClaim" DROP COLUMN "houseType";

-- DropEnum
DROP TYPE "HouseType";
