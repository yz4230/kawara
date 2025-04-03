import type { feedEntry } from "~/lib/server/schema/feed.schema";

export type FeedEntryModel = typeof feedEntry.$inferSelect;
