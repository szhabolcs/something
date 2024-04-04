create table if not exists "badge" (
	"user_uuid" uuid not null,
	"badge_definition_uuid" uuid not null,
	"created_at" timestamp default now() not null,
	constraint "badge_user_uuid_badge_definition_uuid_unique" unique("user_uuid", "badge_definition_uuid")
);

--> statement-breakpoint
create table if not exists "badge_definition" (
	"uuid" uuid primary key default gen_random_uuid() not null,
	"icon" text not null,
	"name" text not null,
	"description" text default '' not null,
	"action" text not null,
	"action_count" integer not null,
	constraint "badge_definition_name_unique" unique("name")
);

--> statement-breakpoint
create table if not exists "checkpoint" (
	"user_uuid" uuid not null,
	"thing_uuid" uuid not null,
	"completed" boolean default false not null,
	"photoUuid" text,
	"utc_timestamp" timestamp not null,
	"created_at" timestamp default now() not null
);

--> statement-breakpoint
create table if not exists "level_definition" (
	"name" text not null,
	"min_threshold" integer not null,
	constraint "level_definition_name_unique" unique("name")
);

--> statement-breakpoint
create table if not exists "point" (
	"user_uuid" uuid not null,
	"point" integer not null,
	"public" boolean default false not null,
	"created_at" timestamp default now() not null
);

--> statement-breakpoint
create table if not exists "schedule" (
	"thing_uuid" uuid not null,
	"start_time" time not null,
	"end_time" time not null,
	"repeat" text not null,
	"day_of_week" text not null,
	"created_at" timestamp default now() not null
);

--> statement-breakpoint
create table if not exists "sharing" (
	"thing_uuid" uuid not null,
	"user_uuid" uuid not null,
	"created_at" timestamp default now() not null
);

--> statement-breakpoint
create table if not exists "streak" (
	"user_uuid" uuid not null,
	"thing_uuid" uuid not null,
	"count" integer default 0 not null,
	constraint "streak_user_uuid_thing_uuid_unique" unique("user_uuid", "thing_uuid")
);

--> statement-breakpoint
create table if not exists "thing" (
	"uuid" uuid primary key default gen_random_uuid() not null,
	"name" text not null,
	"description" text not null,
	"user_uuid" uuid not null,
	"type" text default 'personal' not null,
	"location" geometry(point, 4326),
	"created_at" timestamp default now() not null
);

--> statement-breakpoint
create table if not exists "user" (
	"uuid" uuid primary key default gen_random_uuid() not null,
	"username" text not null,
	"password" text not null,
	"type" text default 'user' not null,
	"created_at" timestamp default now() not null,
	"updated_at" timestamp default now() not null,
	constraint "user_username_unique" unique("username")
);

--> statement-breakpoint
do $$ begin

alter table "badge" add constraint "badge_user_uuid_user_uuid_fk" foreign key ("user_uuid") references "user"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "badge" add constraint "badge_badge_definition_uuid_badge_definition_uuid_fk" foreign key ("badge_definition_uuid") references "badge_definition"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "checkpoint" add constraint "checkpoint_user_uuid_user_uuid_fk" foreign key ("user_uuid") references "user"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "checkpoint" add constraint "checkpoint_thing_uuid_thing_uuid_fk" foreign key ("thing_uuid") references "thing"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "point" add constraint "point_user_uuid_user_uuid_fk" foreign key ("user_uuid") references "user"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "schedule" add constraint "schedule_thing_uuid_thing_uuid_fk" foreign key ("thing_uuid") references "thing"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "sharing" add constraint "sharing_thing_uuid_thing_uuid_fk" foreign key ("thing_uuid") references "thing"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "sharing" add constraint "sharing_user_uuid_user_uuid_fk" foreign key ("user_uuid") references "user"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "streak" add constraint "streak_user_uuid_user_uuid_fk" foreign key ("user_uuid") references "user"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "streak" add constraint "streak_thing_uuid_thing_uuid_fk" foreign key ("thing_uuid") references "thing"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;

--> statement-breakpoint
do $$ begin

alter table "thing" add constraint "thing_user_uuid_user_uuid_fk" foreign key ("user_uuid") references "user"("uuid") on delete no action on update no action;

exception
when duplicate_object then null;

end $$;