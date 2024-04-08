/*
  Warnings:

  - Added the required column `formato` to the `Arquivo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Arquivo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);
INSERT INTO "new_Arquivo" ("categoria", "dataCriacao", "descricao", "hash", "id", "nome") SELECT "categoria", "dataCriacao", "descricao", "hash", "id", "nome" FROM "Arquivo";
DROP TABLE "Arquivo";
ALTER TABLE "new_Arquivo" RENAME TO "Arquivo";
CREATE UNIQUE INDEX "Arquivo_hash_key" ON "Arquivo"("hash");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
