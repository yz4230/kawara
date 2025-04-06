import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export async function fetchArticleContent(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const dom = new JSDOM(html);
  return new Readability(dom.window.document).parse();
}
