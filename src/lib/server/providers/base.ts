import { array, object, string } from "valibot";
import type { FeedEntry } from "~/shared/types";

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
