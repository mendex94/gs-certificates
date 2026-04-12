ALTER TABLE "certificate" ADD COLUMN "generatedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "certificate" ADD COLUMN "tokenConsumed" boolean DEFAULT false NOT NULL;