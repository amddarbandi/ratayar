-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "assigned_at" TIMESTAMP(3),
ADD COLUMN     "assignee_id" UUID;

-- CreateTable
CREATE TABLE "ticket_macros" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "body" TEXT NOT NULL,
    "category" VARCHAR(30) NOT NULL DEFAULT 'other',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_macros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tickets_assignee_id_idx" ON "tickets"("assignee_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
