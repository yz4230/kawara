import type { articles } from "~/lib/server/schema/feed.schema";

export type ArticleModel = typeof articles.$inferSelect;
