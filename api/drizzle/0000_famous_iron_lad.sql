CREATE TABLE IF NOT EXISTS "badge_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"icon" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"action" text DEFAULT 'create' CHECK (action IN ('create', 'complete')) NOT NULL,
	"action_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badge_definition_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "badge" (
	"user_id" uuid NOT NULL,
	"badge_definition_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badge_user_id_badge_definition_id_pk" PRIMARY KEY("user_id","badge_definition_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkpoint" (
	"user_id" uuid NOT NULL,
	"thing_id" uuid NOT NULL,
	"filename" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "checkpoint_user_id_thing_id_filename_pk" PRIMARY KEY("user_id","thing_id","filename")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "level_definition" (
	"name" text PRIMARY KEY NOT NULL,
	"min_threshold" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" json NOT NULL,
	"push_token" text NOT NULL,
	"sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thing_id" uuid NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"repeat" text DEFAULT 'once' CHECK (repeat IN ('once', 'daily', 'weekly')) NOT NULL,
	"specific_date" date DEFAULT NULL CHECK (    (specific_date IS NULL     AND repeat IN ('daily', 'weekly'))
          OR (specific_date IS NOT NULL AND repeat = 'once')),
	"day_of_week" text DEFAULT NULL CHECK ((day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday','saturday', 'sunday'))
        AND (
              (day_of_week IS NULL     AND repeat IN ('once', 'daily'))
          OR  (day_of_week IS NOT NULL AND repeat = 'weekly')
        )),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "score" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"value" integer NOT NULL,
	"public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_refresh_token_unique" UNIQUE("refresh_token"),
	CONSTRAINT "session_user_id_refresh_token_unique" UNIQUE("user_id","refresh_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sharing" (
	"thing_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sharing_thing_id_user_id_pk" PRIMARY KEY("thing_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "streak" (
	"user_id" uuid NOT NULL,
	"thing_id" uuid NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "streak_user_id_thing_id_pk" PRIMARY KEY("user_id","thing_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "thing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text DEFAULT 'personal' CHECK (type IN ('personal', 'social')) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"type" text DEFAULT 'user' CHECK (type IN ('user', 'organization')) NOT NULL,
	"push_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "badge" ADD CONSTRAINT "badge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "badge" ADD CONSTRAINT "badge_badge_definition_id_badge_definition_id_fk" FOREIGN KEY ("badge_definition_id") REFERENCES "public"."badge_definition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_thing_id_thing_id_fk" FOREIGN KEY ("thing_id") REFERENCES "public"."thing"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_thing_id_thing_id_fk" FOREIGN KEY ("thing_id") REFERENCES "public"."thing"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "score" ADD CONSTRAINT "score_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sharing" ADD CONSTRAINT "sharing_thing_id_thing_id_fk" FOREIGN KEY ("thing_id") REFERENCES "public"."thing"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sharing" ADD CONSTRAINT "sharing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "streak" ADD CONSTRAINT "streak_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "streak" ADD CONSTRAINT "streak_thing_id_thing_id_fk" FOREIGN KEY ("thing_id") REFERENCES "public"."thing"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "thing" ADD CONSTRAINT "thing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "badge_user_id_index" ON "badge" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkpoint_thing_id_index" ON "checkpoint" USING btree ("thing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkpoint_user_id_thing_id_index" ON "checkpoint" USING btree ("user_id","thing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "level_definition_min_threshold_index" ON "level_definition" USING btree ("min_threshold");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_user_id_index" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_sent_index" ON "notification" USING btree ("sent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_thing_id_index" ON "schedule" USING btree ("thing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "score_public_index" ON "score" USING btree ("public");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_index" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sharing_user_id_index" ON "sharing" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sharing_thing_id_user_id_index" ON "sharing" USING btree ("thing_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "thing_user_id_index" ON "thing" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "thing_user_id_type_index" ON "thing" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username_index" ON "user" USING btree ("username");