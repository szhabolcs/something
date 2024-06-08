import { sql } from 'drizzle-orm';
import {
  text,
  timestamp,
  pgTable,
  uuid,
  time,
  boolean,
  integer,
  unique,
  date
} from 'drizzle-orm/pg-core';

const timechangeColumns = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`NOW()`)
};

// quck hack to be able to have check support
// (https://github.com/drizzle-team/drizzle-orm/issues/880#issuecomment-1814869720)
const check = (defaultval: string, checkexpr: string) =>
  sql`${sql.raw(defaultval)} CHECK (${sql.raw(checkexpr)})`;

export const UserTable = pgTable('user', {
  uuid: uuid('uuid').defaultRandom().notNull().primaryKey(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  type: text('type').default('user').$type<'user' | 'organization'>().notNull(),
  ...timechangeColumns
});

export const ThingTable = pgTable('thing', {
  uuid: uuid('uuid').defaultRandom().notNull().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  userUuid: uuid('user_uuid')
    .notNull()
    .references(() => UserTable.uuid),
  type: text('type')
    .default('personal')
    .$type<'personal' | 'social'>()
    .notNull(),
  ...timechangeColumns
});

export const ScheduleTable = pgTable('schedule', {
  thingUuid: uuid('thing_uuid')
    .notNull()
    .references(() => ThingTable.uuid),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  repeat: text('repeat', { enum: ['once', 'daily', 'weekly'] })
    .notNull()
    .default(check(`'once'`, `repeat IN ('once', 'daily', 'weekly')`)),
  specificDate: date('specific_date') // used for repeat 'once'
    .default(
      check(
        'NULL',
        `    (specific_date IS NULL     AND repeat IN ('daily', 'weekly'))
          OR (specific_date IS NOT NULL AND repeat = 'once')`
      )
    ),
  dayOfWeek: text(
    'day_of_week', // used for repeat 'weekly'
    {
      enum: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ]
    }
  ).default(
    check(
      'NULL',
      `(day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday','saturday', 'sunday'))
        AND (
              (day_of_week IS NULL     AND repeat IN ('once', 'daily'))
          OR  (day_of_week IS NOT NULL AND repeat = 'weekly')
        )`
    )
  ),
  ...timechangeColumns
});

export const CheckpointTable = pgTable('checkpoint', {
  userUuid: uuid('user_uuid')
    .notNull()
    .references(() => UserTable.uuid),
  thingUuid: uuid('thing_uuid')
    .notNull()
    .references(() => ThingTable.uuid),
  filename: text('filename'),
  ...timechangeColumns
});

export const SharingTable = pgTable('sharing', {
  thingUuid: uuid('thing_uuid')
    .notNull()
    .references(() => ThingTable.uuid),
  userUuid: uuid('user_uuid')
    .notNull()
    .references(() => UserTable.uuid),
  ...timechangeColumns
});

export const ScoreTable = pgTable('score', {
  userUuid: uuid('user_uuid')
    .notNull()
    .references(() => UserTable.uuid),
  value: integer('value').notNull(),
  public: boolean('public').notNull().default(true),
  ...timechangeColumns
});

export const LevelDefinitionTable = pgTable('level_definition', {
  name: text('name').notNull().unique(),
  minThreshold: integer('min_threshold').notNull(),
  ...timechangeColumns
});

export const BadgeDefinitionTable = pgTable('badge_definition', {
  uuid: uuid('uuid').defaultRandom().notNull().primaryKey(),
  icon: text('icon').notNull(), // PascalCase name from https://iconoir.com
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  action: text('action', { enum: ['create', 'complete'] })
    .notNull()
    .default(check(`'create'`, `action IN ('create', 'complete')`)),
  action_count: integer('action_count').notNull(),
  ...timechangeColumns
});

export const BadgeTable = pgTable(
  'badge',
  {
    userUuid: uuid('user_uuid')
      .notNull()
      .references(() => UserTable.uuid),
    badgeDefinitionUuid: uuid('badge_definition_uuid')
      .notNull()
      .references(() => BadgeDefinitionTable.uuid),
    ...timechangeColumns
  },
  (table) => ({
    unq: unique().on(table.userUuid, table.badgeDefinitionUuid)
  })
);

export const StreakTable = pgTable(
  'streak',
  {
    userUuid: uuid('user_uuid')
      .notNull()
      .references(() => UserTable.uuid),
    thingUuid: uuid('thing_uuid')
      .notNull()
      .references(() => ThingTable.uuid),
    count: integer('count').default(0).notNull()
  },
  (table) => ({
    unq: unique().on(table.userUuid, table.thingUuid)
  })
);
