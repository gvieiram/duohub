/*
  Warnings:

  - The values [DECLARA_SOZINHO,TROCAR_CONTADOR,PESQUISANDO] on the enum `LeadMoment` will be removed. Existing rows carrying these values are remapped to NULL so the migration can complete without data loss of the lead itself.

*/
-- Remap legacy values to NULL before narrowing the enum.
UPDATE "Lead"
SET "moment" = NULL
WHERE "moment"::text IN ('DECLARA_SOZINHO', 'TROCAR_CONTADOR', 'PESQUISANDO');

-- AlterEnum
BEGIN;
CREATE TYPE "LeadMoment_new" AS ENUM ('PRIMEIRO_ANO', 'MALHA_FINA', 'JA_DECLAREI');
ALTER TABLE "Lead" ALTER COLUMN "moment" TYPE "LeadMoment_new" USING ("moment"::text::"LeadMoment_new");
ALTER TYPE "LeadMoment" RENAME TO "LeadMoment_old";
ALTER TYPE "LeadMoment_new" RENAME TO "LeadMoment";
DROP TYPE "public"."LeadMoment_old";
COMMIT;
