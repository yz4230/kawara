import { Inngest } from "inngest";
import { db } from "~/lib/server/db";
import { providers } from "~/lib/server/providers/all";
import { feedEntry } from "~/lib/server/schema";

export const inngest = new Inngest({ id: "kawara" });

const collectFeedEntries = inngest.createFunction(
  {
    id: "collect-feed-entries",
    timeouts: { finish: "10s" },
    optimizeParallelism: true,
  },
  { event: "feed/collect" },
  async ({ step, logger }) => {
    await Promise.all(
      providers.map((provider) =>
        step.run(`fetch-${provider.id}`, async () => {
          const entries = await provider.retrieveFeed();
          const existings = await db.query.feedEntry.findMany({
            where: (feedEntry, { eq }) => eq(feedEntry.providerId, provider.id),
            columns: { identifier: true },
          });
          const existingIdents = new Set(existings.map((e) => e.identifier));
          const newEntries = entries.filter((e) => !existingIdents.has(e.identifier));

          logger.info(`Fetched ${newEntries.length} new entries from ${provider.id}`);

          if (newEntries.length > 0) {
            await db.insert(feedEntry).values(
              newEntries.map((entry) => ({
                providerId: provider.id,
                identifier: entry.identifier,
                title: entry.title,
                contentHTML: entry.contentHTML,
                contentText: entry.contentText,
                url: entry.url,
                externalURL: entry.externalURL,
                summary: entry.summary,
                imageURL: entry.imageURL,
                bannerImageURL: entry.bannerImageURL,
                datePublished: entry.datePublished,
                dateModified: entry.dateModified,
              })),
            );
          }
        }),
      ),
    );
  },
);

// Add the function to the exported array:
export const functions = [collectFeedEntries];
