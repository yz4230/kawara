import { array, object, string } from "valibot";

export type RetrievedFeedEntry = {
  identifier: string;
  title?: string;
  contentHTML?: string;
  contentText?: string;
  url?: string;
  externalURL?: string;
  summary?: string;
  imageURL?: string;
  bannerImageURL?: string;
  datePublished?: Date;
  dateModified?: Date;
};

export interface Provider {
  id: string;
  retrieveFeed: () => Promise<RetrievedFeedEntry[]>;
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
