import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "~/lib/server/db";
import { ArticleCard } from "./-components/article-card";

const fetchArticles = createServerFn({ method: "GET" }).handler(async () => {
  return await db.query.articles.findMany({
    orderBy: (article, { desc, sql }) => {
      const sortKeys = [
        article.datePublished,
        article.dateModified,
        article.createdAt,
      ] as const;
      return desc(sql`coalesce(${sortKeys.join(", ")})`);
    },
  });
});

export const Route = createFileRoute("/feeds/")({
  component: RouteComponent,
  loader: async () => {
    const articles = await fetchArticles();
    return { articles };
  },
});

function RouteComponent() {
  const { articles } = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col border-x">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
