/*
  Warnings:

  - The values [MEI_COM_PF,OUTROS] on the enum `LeadSituation` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "LeadComplexity" AS ENUM ('ALUGUEL', 'VENDA_IMOVEL', 'DEPENDENTES', 'RENDA_VARIAVEL', 'CRIPTOATIVOS', 'EXTERIOR', 'PENSAO', 'PREVIDENCIA', 'NENHUMA', 'NAO_SEI');

-- CreateEnum
CREATE TYPE "LeadMoment" AS ENUM ('PRIMEIRO_ANO', 'DECLARA_SOZINHO', 'TROCAR_CONTADOR', 'MALHA_FINA', 'PESQUISANDO');

-- AlterEnum
BEGIN;
CREATE TYPE "LeadSituation_new" AS ENUM ('CLT', 'AUTONOMO', 'INVESTIDOR', 'MEI', 'APOSENTADO', 'MULTIPLO', 'NAO_SEI');
ALTER TABLE "Lead" ALTER COLUMN "situation" TYPE "LeadSituation_new" USING ("situation"::text::"LeadSituation_new");
ALTER TYPE "LeadSituation" RENAME TO "LeadSituation_old";
ALTER TYPE "LeadSituation_new" RENAME TO "LeadSituation";
DROP TYPE "public"."LeadSituation_old";
COMMIT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "complexity" "LeadComplexity"[],
ADD COLUMN     "moment" "LeadMoment",
ALTER COLUMN "situation" DROP NOT NULL;
