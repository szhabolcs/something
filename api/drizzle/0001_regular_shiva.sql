ALTER TABLE "checkpoint" RENAME TO "image";--> statement-breakpoint
ALTER TABLE "sharing" RENAME TO "thing_access";--> statement-breakpoint
ALTER TABLE "image" DROP CONSTRAINT "checkpoint_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "image" DROP CONSTRAINT "checkpoint_thing_id_thing_id_fk";
--> statement-breakpoint
ALTER TABLE "thing_access" DROP CONSTRAINT "sharing_thing_id_thing_id_fk";
--> statement-breakpoint
ALTER TABLE "thing_access" DROP CONSTRAINT "sharing_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "checkpoint_thing_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "checkpoint_user_id_thing_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "sharing_user_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "sharing_thing_id_user_id_index";--> statement-breakpoint
ALTER TABLE "image" DROP CONSTRAINT "checkpoint_user_id_thing_id_filename_pk";--> statement-breakpoint
ALTER TABLE "thing_access" DROP CONSTRAINT "sharing_thing_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "image" ALTER COLUMN "filename" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_user_id_thing_id_filename_pk" PRIMARY KEY("user_id","thing_id","filename");--> statement-breakpoint
ALTER TABLE "thing_access" ADD CONSTRAINT "thing_access_thing_id_user_id_pk" PRIMARY KEY("thing_id","user_id");--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "thing_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "scheduled_at" date NOT NULL;--> statement-breakpoint
ALTER TABLE "thing_access" ADD COLUMN "role" text DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image" ADD CONSTRAINT "image_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image" ADD CONSTRAINT "image_thing_id_thing_id_fk" FOREIGN KEY ("thing_id") REFERENCES "public"."thing"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_thing_id_thing_id_fk" FOREIGN KEY ("thing_id") REFERENCES "public"."thing"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "thing_access" ADD CONSTRAINT "thing_access_thing_id_thing_id_fk" FOREIGN KEY ("thing_id") REFERENCES "public"."thing"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "thing_access" ADD CONSTRAINT "thing_access_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "image_thing_id_index" ON "image" USING btree ("thing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "image_user_id_thing_id_index" ON "image" USING btree ("user_id","thing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_thing_id_index" ON "notification" USING btree ("thing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_scheduled_at_index" ON "notification" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "thing_access_user_id_index" ON "thing_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "thing_access_thing_id_user_id_index" ON "thing_access" USING btree ("thing_id","user_id");
