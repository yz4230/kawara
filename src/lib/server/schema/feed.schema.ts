import { char, index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

const now = () => new Date();

const timestamps = {
  createdAt: timestamp().notNull().$defaultFn(now),
  updatedAt: timestamp().notNull().$defaultFn(now).$onUpdateFn(now),
};

const uuid = () => char({ length: 36 });
const uuidPk = () => uuid().primaryKey().$defaultFn(uuidv7);

export const articles = pgTable(
  "articles",
  {
    id: uuidPk(),
    providerId: text().notNull(),
    identifier: text().notNull(),
    title: text(),
    contentHTML: text(),
    contentText: text(),
    url: text(),
    externalURL: text(),
    summary: text(),
    imageURL: text(),
    bannerImageURL: text(),
    datePublished: timestamp(),
    dateModified: timestamp(),
    ...timestamps,
  },
  (table) => [
    index().on(table.providerId),
    index().on(table.identifier),
    unique().on(table.providerId, table.identifier),
  ],
);
