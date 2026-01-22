-- CreateEnum
CREATE TYPE "HouseType" AS ENUM ('GHIBLI', 'SANRIO');

-- AlterTable
ALTER TABLE "BotUserState" ADD COLUMN     "ghibliSelected" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sanrioSelected" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HouseClaim" ADD COLUMN     "houseType" "HouseType";
