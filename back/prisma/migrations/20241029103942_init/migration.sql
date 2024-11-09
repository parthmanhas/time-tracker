-- CreateEnum
CREATE TYPE "TimerStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Timer" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "timeLeft" INTEGER NOT NULL,
    "status" "TimerStatus" NOT NULL,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);
