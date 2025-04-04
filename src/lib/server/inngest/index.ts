import { Inngest } from "inngest";
import { db } from "~/lib/server/db";
import { providers } from "~/lib/server/providers/all";
import { articles } from "~/lib/server/schema";

export const inngest = new Inngest({ id: "kawara" });

const collectFeed = inngest.createFunction(
  {
    id: "collect-feed",
    timeouts: { finish: "10s" },
    optimizeParallelism: true,
  },
  { event: "feed/collect" },
  async ({ step, logger }) => {
    await Promise.all(
      providers.map((provider) =>
        step.run(`fetch-${provider.id}`, async () => {
          const retrievedArticles = await provider.retrieveFeed();
          const existings = await db.query.articles.findMany({
            where: (articles, { eq }) => eq(articles.providerId, provider.id),
            columns: { identifier: true },
          });
          const existingIdents = new Set(existings.map((article) => article.identifier));
          const newArticles = retrievedArticles.filter(
            (article) => !existingIdents.has(article.identifier),
          );

          logger.info(`Fetched ${newArticles.length} new articles from ${provider.id}`);

          if (newArticles.length > 0) {
            await db.insert(articles).values(
              newArticles.map((article) => ({
                providerId: provider.id,
                identifier: article.identifier,
                title: article.title,
                contentHTML: article.contentHTML,
                contentText: article.contentText,
                url: article.url,
                externalURL: article.externalURL,
                summary: article.summary,
                imageURL: article.imageURL,
                bannerImageURL: article.bannerImageURL,
                datePublished: article.datePublished,
                dateModified: article.dateModified,
              })),
            );
          }
        }),
      ),
    );
  },
);

// Add the function to the exported array:
export const functions = [collectFeed];
