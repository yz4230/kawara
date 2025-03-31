import { load } from "cheerio";
import { invariant } from "es-toolkit";
import { ProviderId } from "~/shared/provider";
import { type Provider } from "./base";

export class GithubTrendingProvider implements Provider {
  id = ProviderId.GithubTrending;

  async fetchEntries() {
    const res = await fetch("https://github.com/trending");
    const $ = await res.text().then(load);
    const entries = $("article.Box-row")
      .map((_, el) => {
        const h2a = $(el).find("h2 a");
        const title = h2a.text().replaceAll(/\s+/g, "");
        const href = h2a.attr("href");
        invariant(href, "href is required");
        const link = `https://github.com${href}`;
        const description = $(el).find("p").text().trim();
        return { title, link, description };
      })
      .get();
    return entries;
  }
}
