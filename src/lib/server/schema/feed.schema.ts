import { char, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

const now = () => new Date();

const timestamps = {
  createdAt: timestamp().notNull().$defaultFn(now),
  updatedAt: timestamp().notNull().$defaultFn(now).$onUpdateFn(now),
};

export const feedEntry = pgTable(
  "feed_entry",
  {
    id: char({ length: 36 }).primaryKey().$defaultFn(uuidv7),
    providerId: text().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    link: text().notNull(),
    ...timestamps,
  },
  (table) => [index().on(table.providerId)],
);
