-- CreateTable
CREATE TABLE "obligations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "category" VARCHAR(20) NOT NULL DEFAULT 'life',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "repeat_type" VARCHAR(20) NOT NULL DEFAULT 'once',
    "repeat_interval" INTEGER,
    "alert_days" INTEGER[] DEFAULT ARRAY[30, 7, 1]::INTEGER[],
    "asset_id" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obligations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "obligations_user_id_idx" ON "obligations"("user_id");

-- CreateIndex
CREATE INDEX "obligations_due_date_idx" ON "obligations"("due_date");

-- CreateIndex
CREATE INDEX "obligations_status_idx" ON "obligations"("status");
