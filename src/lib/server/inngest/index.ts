import { differenceBy } from "es-toolkit";
import { Inngest } from "inngest";
import { db } from "~/lib/server/db";
import { providers } from "~/lib/server/providers/all";
import { feedEntry } from "~/lib/server/schema";

export const inngest = new Inngest({ id: "kawara" });

// Your new function:
const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

const collectFeedEntries = inngest.createFunction(
  { id: "collect-feed-entries", timeouts: { finish: "10s" } },
  { event: "feed/collect" },
  async ({ step, logger }) => {
    await Promise.all(
      providers.map((provider) =>
        step.run(`fetch-${provider.id}`, async () => {
          const entries = await provider.fetchEntries();
          const lastEntryLinks = await db.query.feedEntry.findMany({
            where: (feedEntry, { eq }) => eq(feedEntry.providerId, provider.id),
            limit: entries.length,
          });
          const newEntries = differenceBy(entries, lastEntryLinks, (entry) => entry.link);
          logger.info(`Found ${newEntries.length} new entries from ${provider.id}`);
          if (newEntries.length > 0) {
            await db.insert(feedEntry).values(
              newEntries.map((entry) => ({
                providerId: provider.id,
                title: entry.title,
                description: entry.description,
                link: entry.link,
              })),
            );
          }
        }),
      ),
    );
  },
);

// Add the function to the exported array:
export const functions = [helloWorld, collectFeedEntries];
