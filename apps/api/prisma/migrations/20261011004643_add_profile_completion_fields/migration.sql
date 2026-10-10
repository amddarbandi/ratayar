-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" VARCHAR(500),
ADD COLUMN     "father_name" VARCHAR(60),
ADD COLUMN     "first_name" VARCHAR(60),
ADD COLUMN     "id_number" VARCHAR(10),
ADD COLUMN     "last_name" VARCHAR(80),
ADD COLUMN     "national_id" VARCHAR(10),
ADD COLUMN     "postal_code" VARCHAR(10),
ADD COLUMN     "profile_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_completed_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_national_id_key" ON "users"("national_id");
