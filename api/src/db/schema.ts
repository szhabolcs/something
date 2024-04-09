import {
  text,
  timestamp,
  pgTable,
  uuid,
  time,
  boolean,
  integer,
  unique,
} from "drizzle-orm/pg-core";

export const UserTable = pgTable("user", {
  uuid: uuid("uuid").defaultRandom().notNull().primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  type: text("type").default("user").$type<"user" | "organization">().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ThingTable = pgTable("thing", {
  uuid: uuid("uuid").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => UserTable.uuid),
  type: text("type")
    .default("personal")
    .$type<"personal" | "social">()
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ScheduleTable = pgTable("schedule", {
  thingUuid: uuid("thing_uuid")
    .notNull()
    .references(() => ThingTable.uuid),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  repeat: text("repeat").$type<"once" | "daily" | "weekly">().notNull(),
  dayOfWeek: text("day_of_week")
    .$type<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">()
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const CheckpointTable = pgTable("checkpoint", {
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => UserTable.uuid),
  thingUuid: uuid("thing_uuid")
    .notNull()
    .references(() => ThingTable.uuid),
  completed: boolean("completed").notNull().default(false),
  photoUuid: text("photoUuid"),
  utcTimestamp: timestamp("utc_timestamp").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const SharingTable = pgTable("sharing", {
  thingUuid: uuid("thing_uuid")
    .notNull()
    .references(() => ThingTable.uuid),
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => UserTable.uuid),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const PointTable = pgTable("point", {
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => UserTable.uuid),
  point: integer("point").notNull(),
  public: boolean("public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const LevelDefinitionTable = pgTable("level_definition", {
  name: text("name").notNull().unique(),
  minThreshold: integer("min_threshold").notNull(),
});

export const BadgeDefinitionTable = pgTable("badge_definition", {
  uuid: uuid("uuid").defaultRandom().notNull().primaryKey(),
  icon: text("icon").notNull(),
  name: text("name").notNull().unique(),
  description: text("description").default("").notNull(),
  action: text("action").$type<"create" | "complete">().notNull(),
  action_count: integer("action_count").notNull(),
});

export const BadgeTable = pgTable(
  "badge",
  {
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => UserTable.uuid),
    badgeDefinitionUuid: uuid("badge_definition_uuid")
      .notNull()
      .references(() => BadgeDefinitionTable.uuid),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    unq: unique().on(table.userUuid, table.badgeDefinitionUuid),
  })
);

export const StreakTable = pgTable(
  "streak",
  {
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => UserTable.uuid),
    thingUuid: uuid("thing_uuid")
      .notNull()
      .references(() => ThingTable.uuid),
    count: integer("count").default(0).notNull(),
  },
  (table) => ({
    unq: unique().on(table.userUuid, table.thingUuid),
  })
);
