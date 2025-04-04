import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { SparkleIcon } from "lucide-react";
import { Button } from "~/lib/components/ui/button";
import { DateFormat } from "~/shared/format";
import type { ArticleModel } from "../-types";

export function ArticleCard(props: { article: ArticleModel }) {
  const { article } = props;
  return (
    <div className="flex flex-col border-t p-4 last:border-b">
      <a href={article.url ?? "#"} target="_blank" className="group">
        <h2 className="text-lg font-bold group-hover:underline">{article.title}</h2>
      </a>
      {article.datePublished && (
        <div className="text-muted-foreground text-sm">
          {format(article.datePublished, DateFormat.dateTime)}
        </div>
      )}
      <p className="text-muted-foreground line-clamp-2 text-sm">{article.summary}</p>
      <div className="mt-2 flex justify-end">
        <Button asChild>
          <Link
            to="/feeds/$providerId/$articleId"
            params={{ providerId: article.providerId, articleId: article.id }}
          >
            <SparkleIcon className="size-4" />
            <span>Follow up</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
