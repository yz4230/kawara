import { XMLParser } from "fast-xml-parser";
import { array, object, optional, parse, string } from "valibot";
import { ProviderId } from "~/shared/provider";
import { rfc822Date, type Provider, type RetrievedArticle } from "./base";

const RSSSchema = object({
  rss: object({
    channel: object({
      item: array(
        object({
          title: string(),
          description: string(),
          link: string(),
          guid: object({
            "#text": string(),
            "@_isPermaLink": string(),
          }),
          pubDate: rfc822Date(),
          enclosure: optional(
            object({
              "@_url": string(),
              "@_length": string(),
              "@_type": string(),
            }),
          ),
          "dc:creator": string(),
        }),
      ),
    }),
  }),
});

export class ZennTrendingProvider implements Provider {
  id = ProviderId.ZennTrending;

  async retrieveFeed() {
    const res = await fetch("https://zenn.dev/feed");
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const xmlobj = parser.parse(xml);
    const obj = parse(RSSSchema, xmlobj);
    return obj.rss.channel.item
      .filter(({ link }) => {
        const url = new URL(link);
        const parts = url.pathname.split("/");
        return parts.at(2) === "articles";
      })
      .map<RetrievedArticle>((item) => ({
        identifier: item.guid["#text"],
        title: item.title,
        url: item.link,
        summary: item.description,
        imageURL: item.enclosure?.["@_url"],
        datePublished: item.pubDate,
      }));
  }
}
