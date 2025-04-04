import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { object, picklist } from "valibot";
import { db } from "~/lib/server/db";
import { providerIds, type ProviderId } from "~/shared/provider";
import { ArticleCard } from "../-components/article-card";

const fetchArticlesByProviderId = createServerFn({ method: "GET" })
  .validator(object({ providerId: picklist(providerIds) }))
  .handler(async ({ data }) => {
    const articles = await db.query.articles.findMany({
      where: (articles, { eq }) => eq(articles.providerId, data.providerId),
      orderBy: (articles, { desc, sql }) => {
        const sortKeys = [
          articles.datePublished,
          articles.dateModified,
          articles.createdAt,
        ] as const;
        return desc(sql`coalesce(${sortKeys.join(", ")})`);
      },
    });
    return articles;
  });

export const Route = createFileRoute("/feeds/$providerId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const articles = await fetchArticlesByProviderId({
      data: { providerId: params.providerId as ProviderId },
    });
    return { articles };
  },
});

function RouteComponent() {
  const { articles } = Route.useLoaderData();

  return (
    <div className="mx-auto flex max-w-3xl flex-col border-x">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
