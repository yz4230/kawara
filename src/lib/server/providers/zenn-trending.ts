import { XMLParser } from "fast-xml-parser";
import { parse } from "valibot";
import { ProviderId } from "~/shared/provider";
import { minimalRssSchema, type Provider, type RetrievedFeedEntry } from "./base";

export class ZennTrendingProvider implements Provider {
  id = ProviderId.ZennTrending;

  async retrieveFeed() {
    const res = await fetch("https://zenn.dev/feed");
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const xmlobj = parser.parse(xml);
    const obj = parse(minimalRssSchema, xmlobj);
    return obj.rss.channel.item
      .filter(({ link }) => {
        const url = new URL(link);
        const parts = url.pathname.split("/");
        return parts.at(2) === "articles";
      })
      .map<RetrievedFeedEntry>((item) => ({
        identifier: item.link,
        title: item.title,
        contentText: item.description,
        url: item.link,
      }));
  }
}
