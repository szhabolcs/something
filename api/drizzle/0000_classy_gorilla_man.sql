CREATE TABLE IF NOT EXISTS "badge_definition" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"user_uuid" uuid NOT NULL,
	"badge_definition_uuid" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badge_user_uuid_badge_definition_uuid_unique" UNIQUE("user_uuid","badge_definition_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkpoint" (
	"user_uuid" uuid NOT NULL,
	"thing_uuid" uuid NOT NULL,
	"filename" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "level_definition" (
	"name" text NOT NULL,
	"min_threshold" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "level_definition_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule" (
	"thing_uuid" uuid NOT NULL,
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
	"user_uuid" uuid NOT NULL,
	"value" integer NOT NULL,
	"public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sharing" (
	"thing_uuid" uuid NOT NULL,
	"user_uuid" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "streak" (
	"user_uuid" uuid NOT NULL,
	"thing_uuid" uuid NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "streak_user_uuid_thing_uuid_unique" UNIQUE("user_uuid","thing_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "thing" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"user_uuid" uuid NOT NULL,
	"type" text DEFAULT 'personal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"type" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "badge" ADD CONSTRAINT "badge_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."user"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "badge" ADD CONSTRAINT "badge_badge_definition_uuid_badge_definition_uuid_fk" FOREIGN KEY ("badge_definition_uuid") REFERENCES "public"."badge_definition"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."user"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_thing_uuid_thing_uuid_fk" FOREIGN KEY ("thing_uuid") REFERENCES "public"."thing"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_thing_uuid_thing_uuid_fk" FOREIGN KEY ("thing_uuid") REFERENCES "public"."thing"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "score" ADD CONSTRAINT "score_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."user"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sharing" ADD CONSTRAINT "sharing_thing_uuid_thing_uuid_fk" FOREIGN KEY ("thing_uuid") REFERENCES "public"."thing"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sharing" ADD CONSTRAINT "sharing_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."user"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "streak" ADD CONSTRAINT "streak_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."user"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "streak" ADD CONSTRAINT "streak_thing_uuid_thing_uuid_fk" FOREIGN KEY ("thing_uuid") REFERENCES "public"."thing"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "thing" ADD CONSTRAINT "thing_user_uuid_user_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."user"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
