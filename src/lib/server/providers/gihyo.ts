import { XMLParser } from "fast-xml-parser";
import { parse } from "valibot";
import { ProviderId } from "~/shared/provider";
import { minimalRssSchema, type Provider, type RetrievedFeedEntry } from "./base";

export class GihyoProvider implements Provider {
  id = ProviderId.Gihyo;

  async retrieveFeed() {
    const res = await fetch("https://gihyo.jp/feed/rss2");
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const xmlobj = parser.parse(xml);
    const obj = parse(minimalRssSchema, xmlobj);
    return obj.rss.channel.item.map<RetrievedFeedEntry>((item) => ({
      identifier: item.link,
      title: item.title,
      contentText: item.description,
      url: item.link,
    }));
  }
}
