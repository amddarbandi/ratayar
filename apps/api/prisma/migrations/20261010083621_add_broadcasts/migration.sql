-- CreateTable
CREATE TABLE "broadcasts" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "channel" VARCHAR(20) NOT NULL,
    "audience" VARCHAR(30) NOT NULL,
    "audience_meta" JSONB NOT NULL DEFAULT '{}',
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "status" VARCHAR(20) NOT NULL DEFAULT 'queued',
    "recipient_count" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "scheduled_for" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "broadcasts_status_created_at_idx" ON "broadcasts"("status", "created_at");
