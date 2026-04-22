/*
  Renames the `Lead` domain to the generic `Contact` domain with a `service` field (enum
  `ContactService`) so future services (MEI onboarding, PJ accounting, etc.) can share the
  same table. UTM columns are dropped — attribution is now owned by PostHog and no longer
  persisted in the database.

  Warnings:
  - Table `Lead` is renamed to `Contact` (data preserved).
  - Enums `LeadSituation`, `LeadComplexity`, `LeadMoment`, `LeadStatus` are renamed to
    `IrpfSituation`, `IrpfComplexity`, `IrpfMoment`, `ContactStatus` respectively.
  - Columns `utmSource`, `utmMedium`, `utmCampaign`, `source` are dropped. Historical UTM
    data is discarded (acceptable — no records depend on it and PostHog takes over).
*/

-- Rename enums (preserves the underlying type OIDs and column references).
ALTER TYPE "LeadSituation"  RENAME TO "IrpfSituation";
ALTER TYPE "LeadComplexity" RENAME TO "IrpfComplexity";
ALTER TYPE "LeadMoment"     RENAME TO "IrpfMoment";
ALTER TYPE "LeadStatus"     RENAME TO "ContactStatus";

-- Rename the table and its primary key / indexes so Prisma introspection stays consistent.
ALTER TABLE "Lead" RENAME TO "Contact";
ALTER TABLE "Contact" RENAME CONSTRAINT "Lead_pkey" TO "Contact_pkey";
ALTER INDEX "Lead_email_key"     RENAME TO "Contact_email_key";
ALTER INDEX "Lead_status_idx"    RENAME TO "Contact_status_idx";
ALTER INDEX "Lead_createdAt_idx" RENAME TO "Contact_createdAt_idx";

-- New service discriminator.
CREATE TYPE "ContactService" AS ENUM ('IRPF');

ALTER TABLE "Contact"
  ADD COLUMN "service" "ContactService" NOT NULL DEFAULT 'IRPF';

CREATE INDEX "Contact_service_idx" ON "Contact"("service");

-- Drop UTM / source columns — tracking moves to PostHog.
ALTER TABLE "Contact"
  DROP COLUMN "utmSource",
  DROP COLUMN "utmMedium",
  DROP COLUMN "utmCampaign",
  DROP COLUMN "source";
