-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'sweet',
    "emoji" TEXT DEFAULT '🎉',
    "from" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Wish_slug_key" ON "Wish"("slug");
