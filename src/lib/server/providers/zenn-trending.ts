import { XMLParser } from "fast-xml-parser";
import { parse } from "valibot";
import { ProviderId } from "~/shared/provider";
import { minimalRssSchema, type Provider } from "./base";

export class ZennTrendingProvider implements Provider {
  id = ProviderId.ZennTrending;

  async fetchEntries() {
    const res = await fetch("https://zenn.dev/feed");
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const xmlobj = parser.parse(xml);
    const obj = parse(minimalRssSchema, xmlobj);
    return obj.rss.channel.item.map((item) => ({
      title: item.title,
      description: item.description,
      link: item.link,
    }));
  }
}
