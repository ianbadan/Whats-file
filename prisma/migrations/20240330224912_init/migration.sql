-- CreateTable
CREATE TABLE "Arquivo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Arquivo_hash_key" ON "Arquivo"("hash");
