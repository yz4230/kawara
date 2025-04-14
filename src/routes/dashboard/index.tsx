import {
  infiniteQueryOptions,
  isServer,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { isString, isUndefined } from "es-toolkit";
import { isNumber } from "es-toolkit/compat";
import { LoaderCircleIcon } from "lucide-react";
import { RefCallback, useCallback, useState } from "react";
import { useIntersectionObserver, useIsClient } from "usehooks-ts";
import { number, object, optional, string } from "valibot";
import { ScrollArea } from "~/lib/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/lib/components/ui/select";
import { authMiddleware } from "~/lib/middleware/auth-guard";
import { db } from "~/lib/server/db";
import type { ServerFnData } from "~/lib/tanstack-start";
import { cn } from "~/lib/utils";
import { DateFormat } from "~/shared/format";
import { providerMetas } from "~/shared/provider";
import AIFollowUp from "./-components/AIFollowUp";
import AISummerization from "./-components/AISummerization";

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 20;

const PROVIDER_ALL = "all";

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
      where: (articles, { eq }) => {
        if (isUndefined(data.providerId)) return undefined;
        return eq(articles.providerId, data.providerId);
      },
      orderBy: (articles, { asc, desc }) => [
        desc(articles.datePublished),
        desc(articles.dateModified),
        desc(articles.createdAt),
        asc(articles.title),
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

function articlesInfiniteQuery(
  options?: Omit<ServerFnData<typeof fetchArticles>, "pageIndex">,
) {
  return infiniteQueryOptions({
    queryKey: [fetchArticles.url, options ?? {}] as const,
    queryFn: ({ pageParam, queryKey: [, { pageSize, providerId }] }) =>
      fetchArticles({
        data: {
          pageSize,
          pageIndex: pageParam,
          providerId: providerId === PROVIDER_ALL ? undefined : providerId,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const isEnd = isNumber(options?.pageSize)
        ? lastPage.length < options.pageSize
        : lastPage.length < 0;
      return isEnd ? undefined : lastPageParam + 1;
    },
  });
}

function articleQuery(options: ServerFnData<typeof fetchArticle>) {
  return queryOptions({
    queryKey: [fetchArticle.url, options],
    queryFn: () => fetchArticle({ data: options }),
  });
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
  validateSearch: object({
    articleId: optional(string()),
    pageSize: optional(number(), DEFAULT_PAGE_SIZE),
    providerId: optional(string()),
  }),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps: { search } }) => {
    const promises: Promise<unknown>[] = [];
    promises.push(
      context.queryClient.prefetchInfiniteQuery(
        articlesInfiniteQuery({
          pageSize: search.pageSize,
          providerId: search.providerId,
        }),
      ),
    );
    if (isString(search.articleId)) {
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
  const { articleId, pageSize, providerId } = Route.useSearch();
  const {
    data: articles,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...articlesInfiniteQuery({ pageSize, providerId }),
    placeholderData: keepPreviousData,
    select: (data) => data.pages.flatMap((page) => page),
  });

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

  const navigate = Route.useNavigate();
  const handleChangeProviderId = useCallback(
    (providerId: string) => navigate({ search: (prev) => ({ ...prev, providerId }) }),
    [navigate],
  );

  const isClient = useIsClient();

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
      <ScrollArea className="w-xs border-l">
        <div className="fixed z-10 flex h-12 w-xs items-center px-2">
          <Select
            value={providerId ?? PROVIDER_ALL}
            onValueChange={handleChangeProviderId}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PROVIDER_ALL}>ALL</SelectItem>
              {providerMetas.map((provider) => (
                <SelectItem
                  key={provider.id}
                  value={provider.id}
                  textValue={provider.name}
                  className="flex items-center gap-2"
                >
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="size-5 rounded-full"
                  />
                  <span>{provider.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-12 flex w-xs flex-col">
          {articles?.map((article) => (
            <Link
              key={article.id}
              className={cn(
                "hover:bg-accent px-4 py-2",
                article.id === articleId && "bg-accent",
              )}
              to="/dashboard"
              search={(prev) => ({ ...prev, articleId: article.id })}
              preload={false}
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
          {hasNextPage && <ScrollSentinel onIntersect={fetchNextPage} />}
        </div>
      </ScrollArea>
      <ScrollArea className="w-full max-w-3xl border-x">
        <div className="w-full max-w-3xl p-8">
          {articleId ? (
            <ArticlePane articleId={articleId} />
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

function ArticlePane(props: { articleId: string }) {
  const { data: article } = useQuery({
    ...articleQuery({ articleId: props.articleId }),
    placeholderData: keepPreviousData,
  });

  if (!article) {
    return (
      <div className="flex justify-center p-6">
        <LoaderCircleIcon className="size-6 animate-spin" />
      </div>
    );
  }

  return (
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
      <AISummerization key={`${article.id}-summary`} articleId={article.id} />
      <AIFollowUp key={`${article.id}-followup`} articleId={article.id} />
    </div>
  );
}

function ScrollSentinel(props: { onIntersect?: () => void }) {
  const { ref } = useIntersectionObserver({
    onChange: (intersecting) => intersecting && props.onIntersect?.(),
  });

  return (
    <div ref={ref} className="flex justify-center p-2">
      <LoaderCircleIcon className="size-6 animate-spin" />
    </div>
  );
}
