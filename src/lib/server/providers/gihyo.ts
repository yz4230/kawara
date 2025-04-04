import { XMLParser } from "fast-xml-parser";
import { array, object, parse, string } from "valibot";
import { ProviderId } from "~/shared/provider";
import { rfc822Date, type Provider, type RetrievedArticle } from "./base";

const RSSSchema = object({
  rss: object({
    channel: object({
      item: array(
        object({
          title: string(),
          link: string(),
          pubDate: rfc822Date(),
          description: string(),
          guid: object({
            "#text": string(),
            "@_isPermaLink": string(),
          }),
        }),
      ),
    }),
  }),
});

export class GihyoProvider implements Provider {
  id = ProviderId.Gihyo;

  async retrieveFeed() {
    const res = await fetch("https://gihyo.jp/feed/rss2");
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const xmlobj = parser.parse(xml);
    const obj = parse(RSSSchema, xmlobj);
    return obj.rss.channel.item.map<RetrievedArticle>((item) => ({
      identifier: item.guid["#text"],
      title: item.title,
      url: item.link,
      summary: item.description,
      datePublished: item.pubDate,
    }));
  }
}
