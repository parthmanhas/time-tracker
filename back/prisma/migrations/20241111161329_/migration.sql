/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Timer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Timer" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Timer_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Timer_id_key" ON "Timer"("id");
