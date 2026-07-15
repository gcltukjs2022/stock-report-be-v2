import * as cheerio from "cheerio";
import futunnClient from "../../utils/futunnClient";

async function scrapeFutunnArticleBody(url: string): Promise<string> {
  const response = await futunnClient.get(
    // "https://news.futunn.com/hk/post/76011846",
    url,
  );

  const { data: html } = await futunnClient.get<string>(url);

  const $ = cheerio.load(html);

  console.log(html.includes('id="content"'));

  const article = $("#content .inner").first();
  console.log("on this website: ", url);

  if (article.length === 0) {
    console.warn(`No article body found for ${url}`);
    return "";
  }

  const paragraphs = article
    .find("p")
    .map((_, el) =>
      $(el)
        .text()
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .get()
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return article
      .text()
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return paragraphs.join("\n\n");
}

export default scrapeFutunnArticleBody;
