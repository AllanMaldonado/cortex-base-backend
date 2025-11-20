ALTER TABLE "folders" DROP CONSTRAINT "folders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_folder_id_folders_id_fk";
--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "folders_user_id_idx" ON "folders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_folder_id_idx" ON "notes" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");