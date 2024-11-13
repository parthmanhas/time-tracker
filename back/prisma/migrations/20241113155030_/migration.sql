/*
  Warnings:

  - Made the column `completedAt` on table `Timer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Timer" ALTER COLUMN "completedAt" SET NOT NULL,
ALTER COLUMN "completedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" DROP DEFAULT;
