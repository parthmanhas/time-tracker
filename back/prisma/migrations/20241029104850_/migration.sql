/*
  Warnings:

  - You are about to drop the column `comments` on the `Timer` table. All the data in the column will be lost.
  - Added the required column `notes` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timer" DROP COLUMN "comments",
ADD COLUMN     "notes" TEXT NOT NULL;
