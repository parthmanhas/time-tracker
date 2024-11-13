/*
  Warnings:

  - You are about to drop the column `date` on the `Timer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Timer" DROP COLUMN "date",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
