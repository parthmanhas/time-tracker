/*
  Warnings:

  - The primary key for the `Timer` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Timer" DROP CONSTRAINT "Timer_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Timer_pkey" PRIMARY KEY ("id");
