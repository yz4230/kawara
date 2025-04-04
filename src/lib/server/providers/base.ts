import { toDate } from "date-fns";
import { pipe, string, transform } from "valibot";

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

/** (e.g.) Thu, 03 Apr 2025 12:56:48 GMT */
export const rfc822Date = () => pipe(string(), transform(toDate));
