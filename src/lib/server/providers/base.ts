import { array, object, string } from "valibot";

export interface FeedEntry {
  title: string;
  description: string;
  link: string;
}

export interface Provider {
  id: string;
  fetchEntries: () => Promise<FeedEntry[]>;
}

export const minimalRssSchema = object({
  rss: object({
    channel: object({
      item: array(
        object({
          title: string(),
          link: string(),
          description: string(),
        }),
      ),
    }),
  }),
});
