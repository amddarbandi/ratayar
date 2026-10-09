-- CreateTable
CREATE TABLE "price_snapshots" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(30) NOT NULL,
    "price_toman" BIGINT,
    "price_usd" DECIMAL(20,8),
    "change_24h" DECIMAL(10,4),
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_snapshots_symbol_ts_idx" ON "price_snapshots"("symbol", "ts");
