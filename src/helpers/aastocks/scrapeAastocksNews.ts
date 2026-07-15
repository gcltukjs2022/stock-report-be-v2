import axios from "axios";
import * as cheerio from "cheerio";

interface NewsItemWoArticle {
  title: string;
  href: string;
  dateRaw: string | null; // e.g. '2026/07/03 14:05'
  dateYYYYMMDD: string | null; // e.g. '20260703'
}

function formatToYYYYMMDD(raw: string): string {
  const datePart = raw.split(" ")[0]; // '2026/07/03'
  return datePart.replace(/\//g, ""); // '20260703'
}

async function scrapeAastocksNews(url: string): Promise<NewsItemWoArticle[]> {
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const $ = cheerio.load(html);
  const results: NewsItemWoArticle[] = [];

  $("#aafn-search-c1 div[ref]").each((_, el) => {
    const container = $(el);

    const titleAnchor = container.find(".newshead4 a").first();
    const title = titleAnchor.text().trim();
    const href = titleAnchor.attr("href") || "";

    if (!title) return;

    const dataNt = container.find(".div_VoteTotal").attr("data-nt");

    let dateRaw: string | null = null;
    let dateYYYYMMDD: string | null = null;

    if (dataNt && dataNt.length >= 8) {
      dateYYYYMMDD = dataNt.slice(0, 8);
      dateRaw = `${dataNt.slice(0, 4)}/${dataNt.slice(4, 6)}/${dataNt.slice(6, 8)} ${dataNt.slice(8, 10)}:${dataNt.slice(10, 12)}`;
    } else {
      const scriptText =
        container.find(".inline_block script").first().html() || "";
      const match = scriptText.match(
        /ConvertToLocalTime\(\{dt:\s*['"]([^'"]+)['"]\}\)/,
      );

      if (match) {
        dateRaw = match[1];
        dateYYYYMMDD = formatToYYYYMMDD(dateRaw);
      }
    }

    results.push({ title, href, dateRaw, dateYYYYMMDD });
  });

  return results;
}

export default scrapeAastocksNews;
