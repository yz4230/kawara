import { load } from "cheerio";
import { parseISO } from "date-fns";
import { invariant } from "es-toolkit";
import { object, parser, pipe, string, transform } from "valibot";
import { ProviderId } from "~/shared/provider";
import { type Provider, type RetrievedArticle } from "./base";

const RepositorySchema = object({
  created_at: pipe(string(), transform(parseISO)),
  updated_at: pipe(string(), transform(parseISO)),
});

export class GithubTrendingProvider implements Provider {
  id = ProviderId.GithubTrending;

  async retrieveFeed() {
    const baseUrl = new URL("https://github.com");
    const res = await fetch(new URL("/trending", baseUrl));
    const $ = await res.text().then(load);
    const articles = await Promise.all(
      $("article.Box-row").map(async (_, el) => {
        const h2a = $(el).find("h2 a");
        const title = h2a.text().replaceAll(/\s+/g, "");
        const href = h2a.attr("href");
        invariant(href, "href is required");
        const link = new URL(href, baseUrl).toString();
        const description = $(el).find("p").text().trim();

        const repo = await fetch(`https://api.github.com/repos/${title}`)
          .then((res) => res.json())
          .then(parser(RepositorySchema));

        const article: RetrievedArticle = {
          identifier: link,
          title,
          url: link,
          summary: description,
          datePublished: repo.created_at,
          dateModified: repo.updated_at,
        };

        return article;
      }),
    );

    return articles;
  }
}
