import {
  isServer,
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { isUndefined } from "es-toolkit";
import { LoaderCircleIcon } from "lucide-react";
import { RefCallback, useCallback, useState } from "react";
import { useIsClient } from "usehooks-ts";
import { number, object, optional, string } from "valibot";
import { ScrollArea } from "~/lib/components/ui/scroll-area";
import { authMiddleware } from "~/lib/middleware/auth-guard";
import { db } from "~/lib/server/db";
import type { ServerFnData } from "~/lib/tanstack-start";
import { cn } from "~/lib/utils";
import { DateFormat } from "~/shared/format";
import AISummerization from "./-components/AISummerization";

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 25;

const fetchArticles = createServerFn()
  .middleware([authMiddleware])
  .validator(
    object({
      providerId: optional(string()),
      pageIndex: optional(number(), DEFAULT_PAGE_INDEX),
      pageSize: optional(number(), DEFAULT_PAGE_SIZE),
    }),
  )
  .handler(async ({ data }) => {
    const articles = await db.query.articles.findMany({
      orderBy: (articles, { desc }) => [
        desc(articles.datePublished),
        desc(articles.dateModified),
        desc(articles.createdAt),
      ],
      limit: data.pageSize,
      offset: data.pageIndex * data.pageSize,
    });
    return articles;
  });

const fetchArticle = createServerFn()
  .middleware([authMiddleware])
  .validator(
    object({
      articleId: string(),
    }),
  )
  .handler(async ({ data }) => {
    const article = await db.query.articles.findFirst({
      where: (articles, { eq }) => eq(articles.id, data.articleId),
    });
    if (!article) {
      throw new Error("Article not found");
    }
    return article;
  });

function articlesQuery(options?: ServerFnData<typeof fetchArticles>) {
  return queryOptions({
    queryKey: ["articles", options],
    queryFn: () => fetchArticles({ data: options ?? {} }),
  });
}

function articleQuery(options: ServerFnData<typeof fetchArticle>) {
  return queryOptions({
    queryKey: ["article", options],
    queryFn: () => fetchArticle({ data: options }),
  });
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
  validateSearch: object({
    articleId: optional(string()),
    pageIndex: optional(number(), DEFAULT_PAGE_INDEX),
    pageSize: optional(number(), DEFAULT_PAGE_SIZE),
  }),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps: { search } }) => {
    const promises: Promise<unknown>[] = [];
    promises.push(
      context.queryClient.prefetchQuery(
        articlesQuery({
          pageIndex: search.pageIndex,
          pageSize: search.pageSize,
        }),
      ),
    );
    if (!isUndefined(search.articleId)) {
      promises.push(
        context.queryClient.prefetchQuery(
          articleQuery({
            articleId: search.articleId,
          }),
        ),
      );
    }
    if (isServer) await Promise.all(promises); // for SSR
  },
});

function DashboardIndex() {
  const { articleId, pageIndex, pageSize } = Route.useSearch();
  const { data: articles } = useQuery({
    ...articlesQuery({ pageIndex, pageSize }),
    placeholderData: keepPreviousData,
  });
  const { data: article } = useQuery({
    ...articleQuery({ articleId: articleId as string }),
    enabled: !isUndefined(articleId),
    placeholderData: keepPreviousData,
  });

  const isClient = useIsClient();

  const [rect, setRect] = useState<DOMRect>();
  const refCallback = useCallback<RefCallback<HTMLDivElement>>((node) => {
    const parent = node?.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    setRect(rect);

    const resizeObserver = new ResizeObserver(([{ target }]) => {
      const rect = target.getBoundingClientRect();
      setRect(rect);
    });

    resizeObserver.observe(parent);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center p-6">
        <LoaderCircleIcon className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={refCallback}
      style={{ height: rect?.height, width: rect?.width }}
      className="fixed flex justify-center"
    >
      <ScrollArea className="border-l">
        <div className="flex w-xs shrink-0 flex-col">
          {articles?.map((article) => (
            <Link
              key={article.id}
              className={cn(
                "hover:bg-accent px-4 py-2",
                article.id === articleId && "bg-accent",
              )}
              to="/dashboard"
              search={{ articleId: article.id }}
            >
              <h2 className="line-clamp-2 text-sm font-bold">{article.title}</h2>
              {article.summary && (
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {article.summary}
                </p>
              )}
              {article.datePublished && (
                <div className="text-muted-foreground mt-1 text-right text-xs">
                  {format(article.datePublished, DateFormat.dateTime)}
                </div>
              )}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="border-x">
        <div className="w-full max-w-3xl p-8">
          {article ? (
            <div className="flex flex-col gap-4">
              <a href={article.url ?? "#"} target="_blank">
                <h2 className={cn("text-xl font-bold", article.url && "hover:underline")}>
                  {article.title}
                </h2>
              </a>
              {article.datePublished && (
                <div className="text-muted-foreground text-sm">
                  {format(article.datePublished, DateFormat.dateTime)}
                </div>
              )}
              <AISummerization key={article.id} articleId={article.id} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <h2 className="text-muted-foreground text-2xl font-bold">
                Select an article to view
              </h2>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
