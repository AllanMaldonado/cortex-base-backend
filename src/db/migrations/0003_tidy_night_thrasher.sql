ALTER TABLE "notes" RENAME COLUMN "content" TO "summary";--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "trascription" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "folder_id" DROP NOT NULL;