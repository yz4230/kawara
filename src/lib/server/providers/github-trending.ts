import { load } from "cheerio";
import { invariant } from "es-toolkit";
import { ProviderId } from "~/shared/provider";
import { type Provider, type RetrievedArticle } from "./base";

export class GithubTrendingProvider implements Provider {
  id = ProviderId.GithubTrending;

  async retrieveFeed() {
    const baseUrl = new URL("https://github.com");
    const res = await fetch(new URL("/trending", baseUrl));
    const $ = await res.text().then(load);
    const articles: RetrievedArticle[] = [];
    for (const el of $("article.Box-row")) {
      const h2a = $(el).find("h2 a");
      const title = h2a.text().replaceAll(/\s+/g, "");
      const href = h2a.attr("href");
      invariant(href, "href is required");
      const link = new URL(href, baseUrl).toString();
      const description = $(el).find("p").text().trim();
      articles.push({ identifier: link, title, url: link, summary: description });
    }
    return articles;
  }
}
