/*
  Warnings:

  - Made the column `timerId` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `timerId` on table `Tag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_timerId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_timerId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "timerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "timerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "Timer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "Timer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
