/*
  Warnings:

  - You are about to drop the column `voter` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `actor` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Made the column `reason` on table `Vote` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'open',
    "evidenceJson" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Proposal" ("body", "createdAt", "evidenceJson", "id", "status", "title", "updatedAt") SELECT "body", "createdAt", "evidenceJson", "id", "status", "title", "updatedAt" FROM "Proposal";
DROP TABLE "Proposal";
ALTER TABLE "new_Proposal" RENAME TO "Proposal";
CREATE TABLE "new_Synthient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "lastHeartbeat" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Synthient" ("createdAt", "id", "lastHeartbeat", "name", "status", "updatedAt") SELECT "createdAt", "id", "lastHeartbeat", "name", "status", "updatedAt" FROM "Synthient";
DROP TABLE "Synthient";
ALTER TABLE "new_Synthient" RENAME TO "Synthient";
CREATE TABLE "new_TrainingRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "synthientId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'running',
    "metricsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingRun_synthientId_fkey" FOREIGN KEY ("synthientId") REFERENCES "Synthient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TrainingRun" ("createdAt", "finishedAt", "id", "metricsJson", "startedAt", "status", "synthientId") SELECT "createdAt", "finishedAt", "id", "metricsJson", "startedAt", "status", "synthientId" FROM "TrainingRun";
DROP TABLE "TrainingRun";
ALTER TABLE "new_TrainingRun" RENAME TO "TrainingRun";
CREATE TABLE "new_Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("createdAt", "decision", "id", "proposalId", "reason") SELECT "createdAt", "decision", "id", "proposalId", "reason" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
