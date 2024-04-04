import {
  text,
  timestamp,
  pgTable,
  uuid,
  customType,
  time,
  boolean,
  integer,
  unique,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  uuid: uuid("uuid").defaultRandom().notNull().primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  type: text("type").default("user").$type<"user" | "organization">().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TODO: After generating remove double quotes
const geometry = customType({
  dataType() {
    return `GEOMETRY(Point, 4326)`;
  },
});

export const thing = pgTable("thing", {
  uuid: uuid("uuid").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => user.uuid),
  type: text("type")
    .default("personal")
    .$type<"personal" | "social">()
    .notNull(),
  location: geometry("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schedule = pgTable("schedule", {
  thingUuid: uuid("thing_uuid")
    .notNull()
    .references(() => thing.uuid),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  repeat: text("repeat").$type<"once" | "daily" | "weekly">().notNull(),
  dayOfWeek: text("day_of_week")
    .$type<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">()
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const checkpoint = pgTable("checkpoint", {
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => user.uuid),
  thingUuid: uuid("thing_uuid")
    .notNull()
    .references(() => thing.uuid),
  completed: boolean("completed").notNull().default(false),
  photoUuid: text("photoUuid"),
  utcTimestamp: timestamp("utc_timestamp").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sharing = pgTable("sharing", {
  thingUuid: uuid("thing_uuid")
    .notNull()
    .references(() => thing.uuid),
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => user.uuid),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const point = pgTable("point", {
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => user.uuid),
  point: integer("point").notNull(),
  public: boolean("public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const levelDefinition = pgTable("level_definition", {
  name: text("name").notNull().unique(),
  minThreshold: integer("min_threshold").notNull(),
});

export const badgeDefinition = pgTable("badge_definition", {
  uuid: uuid("uuid").defaultRandom().notNull().primaryKey(),
  icon: text("icon").notNull(),
  name: text("name").notNull().unique(),
  description: text("description").default("").notNull(),
  action: text("action").$type<"create" | "complete">().notNull(),
  action_count: integer("action_count").notNull(),
});

export const badge = pgTable(
  "badge",
  {
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => user.uuid),
    badgeDefinitionUuid: uuid("badge_definition_uuid")
      .notNull()
      .references(() => badgeDefinition.uuid),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    unq: unique().on(table.userUuid, table.badgeDefinitionUuid),
  })
);

export const streak = pgTable(
  "streak",
  {
    userUuid: uuid("user_uuid")
      .notNull()
      .references(() => user.uuid),
    thingUuid: uuid("thing_uuid")
      .notNull()
      .references(() => thing.uuid),
    count: integer("count").default(0).notNull(),
  },
  (table) => ({
    unq: unique().on(table.userUuid, table.thingUuid),
  })
);
