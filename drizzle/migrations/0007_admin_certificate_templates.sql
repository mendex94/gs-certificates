CREATE TYPE "public"."certificate_management_status" AS ENUM('active', 'inactive', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."template_storage_mode" AS ENUM('direct_upload', 'manual_publish');--> statement-breakpoint
CREATE TYPE "public"."template_migration_state" AS ENUM('legacy_fallback', 'backfilled');--> statement-breakpoint
CREATE TYPE "public"."template_reference_request_status" AS ENUM('pending', 'processed', 'canceled');--> statement-breakpoint

CREATE TABLE "certificate_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(150) NOT NULL,
  "slug" varchar(150) NOT NULL,
  "description" varchar(500),
  "legacy_token_type" "certificate_type",
  "status" "certificate_management_status" DEFAULT 'active' NOT NULL,
  "current_template_id" uuid,
  "migration_state" "template_migration_state" DEFAULT 'legacy_fallback' NOT NULL,
  "migration_cutoff_at" timestamp (3),
  "backfill_completed_at" timestamp (3),
  "created_by_admin_id" integer NOT NULL,
  "created_at" timestamp (3) DEFAULT now() NOT NULL,
  "updated_at" timestamp (3) DEFAULT now() NOT NULL,
  "archived_at" timestamp (3),
  "deleted_at" timestamp (3),
  CONSTRAINT "certificate_types_slug_unique" UNIQUE("slug")
);--> statement-breakpoint

CREATE TABLE "certificate_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "certificate_type_id" uuid NOT NULL,
  "version" integer NOT NULL,
  "original_file_name" varchar(255) NOT NULL,
  "storage_path" varchar(255) NOT NULL,
  "storage_mode" "template_storage_mode" DEFAULT 'direct_upload' NOT NULL,
  "mime_type" varchar(80) NOT NULL,
  "file_size_bytes" integer NOT NULL,
  "status" "certificate_management_status" DEFAULT 'active' NOT NULL,
  "created_by_admin_id" integer NOT NULL,
  "created_at" timestamp (3) DEFAULT now() NOT NULL,
  "updated_at" timestamp (3) DEFAULT now() NOT NULL,
  "archived_at" timestamp (3),
  "deleted_at" timestamp (3),
  CONSTRAINT "certificate_templates_type_version_unique" UNIQUE("certificate_type_id","version")
);--> statement-breakpoint

CREATE TABLE "certificate_pending_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "certificate_type_id" uuid,
  "template_id" uuid,
  "status" "template_reference_request_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp (3) DEFAULT now() NOT NULL,
  "updated_at" timestamp (3) DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "certificate" ADD COLUMN "certificate_type_id" uuid;--> statement-breakpoint
ALTER TABLE "certificate" ADD COLUMN "template_id" uuid;--> statement-breakpoint

ALTER TABLE "certificate_types" ADD CONSTRAINT "certificate_types_created_by_admin_id_user_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_certificate_type_id_certificate_types_id_fk" FOREIGN KEY ("certificate_type_id") REFERENCES "public"."certificate_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_created_by_admin_id_user_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_pending_requests" ADD CONSTRAINT "certificate_pending_requests_certificate_type_id_certificate_types_id_fk" FOREIGN KEY ("certificate_type_id") REFERENCES "public"."certificate_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_pending_requests" ADD CONSTRAINT "certificate_pending_requests_template_id_certificate_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."certificate_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_certificate_type_id_certificate_types_id_fk" FOREIGN KEY ("certificate_type_id") REFERENCES "public"."certificate_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_template_id_certificate_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."certificate_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "certificate_types_name_idx" ON "certificate_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX "certificate_types_status_idx" ON "certificate_types" USING btree ("status");--> statement-breakpoint
CREATE INDEX "certificate_templates_type_status_idx" ON "certificate_templates" USING btree ("certificate_type_id","status");--> statement-breakpoint
CREATE INDEX "certificate_pending_requests_type_status_idx" ON "certificate_pending_requests" USING btree ("certificate_type_id","status");--> statement-breakpoint
CREATE INDEX "certificate_pending_requests_template_status_idx" ON "certificate_pending_requests" USING btree ("template_id","status");--> statement-breakpoint
CREATE INDEX "certificate_type_id_idx" ON "certificate" USING btree ("certificate_type_id");--> statement-breakpoint
CREATE INDEX "certificate_template_id_idx" ON "certificate" USING btree ("template_id");--> statement-breakpoint
