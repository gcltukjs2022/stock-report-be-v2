import axios from "axios";
import * as cheerio from "cheerio";
import normalizeFutunnTime from "../../utils/normalizeFutunnTime";

interface NewsItemWoArticle {
  stock: string;
  title: string;
  href: string;
  dateRaw: string | null; // e.g. '2026/07/13 22:32'
  dateYYYYMMDD: string | null; // e.g. '20260713'
}

async function scrapeFutunnNews(
  url: string,
  stock: string,
): Promise<NewsItemWoArticle[]> {
  const { data: html } = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      Referer: "https://www.futunn.com/",
    },
  });

  const $ = cheerio.load(html);
  const results: NewsItemWoArticle[] = [];

  // Find the first news section
  const newsSection = $("section.stock-news").first();

  // console.log("first section: ", newsSection);

  if (newsSection.length === 0) {
    console.warn(`No news section found for ${url}`);
    return [];
  }

  newsSection.find("ul.news-box > li.news-item").each((_, el) => {
    const item = $(el);

    const aTag = item.find("a[href]").first();
    if (!aTag.length) return;
    if (aTag.attr("rel") === "nofollow") return;

    const title = aTag.find("p.news-title").text().trim();
    const href = aTag.attr("href") ?? "";

    if (!title || !href) return;

    const timeText = aTag
      .find("p.news-meta span")
      .last()
      .text()
      .trim()
      .replace(/[^0-9/: ]/g, "");

    const { dateRaw, dateYYYYMMDD } = normalizeFutunnTime(timeText);

    results.push({
      stock,
      title,
      href,
      dateRaw,
      dateYYYYMMDD,
    });
  });

  return results;
}

export default scrapeFutunnNews;
