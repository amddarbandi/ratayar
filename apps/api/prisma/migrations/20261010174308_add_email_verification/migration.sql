-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" VARCHAR(200),
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "email_verify_expires_at" TIMESTAMP(3),
ADD COLUMN     "email_verify_token" VARCHAR(100);

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_verify_token_idx" ON "users"("email_verify_token");
