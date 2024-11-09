/*
  Warnings:

  - You are about to drop the column `notes` on the `Timer` table. All the data in the column will be lost.
  - You are about to drop the column `timeLeft` on the `Timer` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Timer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingTime` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timer" DROP COLUMN "notes",
DROP COLUMN "timeLeft",
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "remainingTime" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "timerId" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "timerId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "Timer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "Timer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
