import scrapeNewsList from "./utils/scrapeNewsList";
import { data, iData } from "./data";
import buildNewsUrl from "./utils/buildNewsUrl";
import scrapeArticleBody from "./utils/scrapeArticleBody";
import toSimplified from "./utils/convertToSimplified";

interface NewsItemWoArticle {
  title: string;
  href: string;
  dateRaw: string | null; // e.g. '2026/07/03 14:05'
  dateYYYYMMDD: string | null; // e.g. '20260703'
}

interface NewsItem {
  title: string;
  href: string;
  dateRaw: string | null;
  dateYYYYMMDD: string | null;
  article: string;
}

export interface StockWithNews extends iData {
  newsUrl: string | null;
  news: NewsItem[];
}

function resolveHref(href: string, base = "https://www.aastocks.com"): string {
  if (!href) return href;
  return href.startsWith("http") ? href : `${base}${href}`;
}

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/**
 * Returns the set of valid dates (YYYYMMDD) to keep.
 * Normally just today. If today is Monday, also include
 * the Saturday and Sunday immediately before it.
 */
function getValidDates(referenceDate: Date = new Date()): Set<string> {
  const dates = new Set<string>();
  const today = new Date(referenceDate);
  dates.add(toYYYYMMDD(today));

  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...

  if (dayOfWeek === 1) {
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - 2);

    const sunday = new Date(today);
    sunday.setDate(today.getDate() - 1);

    dates.add(toYYYYMMDD(saturday));
    dates.add(toYYYYMMDD(sunday));
  }

  return dates;
}

function filterNewsByValidDates(
  news: NewsItemWoArticle[],
  validDates: Set<string>,
): NewsItemWoArticle[] {
  return news.filter(
    (n) => n.dateYYYYMMDD !== null && validDates.has(n.dateYYYYMMDD),
  );
}

async function getAllStockNews(): Promise<StockWithNews[]> {
  const validDates = getValidDates();

  const stockPromises = data.map(async (item): Promise<StockWithNews> => {
    const newsUrl = buildNewsUrl(item);

    if (!newsUrl) {
      console.warn(
        `Skipping ${item.name} — no URL pattern for currency "${item.currency}"`,
      );
      return { ...item, newsUrl: null, news: [] };
    }

    try {
      const rawNews = await scrapeNewsList(newsUrl);
      const filteredNews = rawNews
        .map((n) => ({ ...n, href: resolveHref(n.href) }))
        .filter((n) => filterNewsByValidDates([n], validDates).length > 0);

      const news: NewsItem[] = await Promise.all(
        filteredNews.map(async (n) => {
          try {
            const rawArticle = await scrapeArticleBody(n.href);
            const article = toSimplified(rawArticle);

            return { ...n, article };
          } catch (err) {
            console.error(`Failed to fetch article body for ${n.href}`, err);
            return { ...n, article: "" };
          }
        }),
      );

      return { ...item, newsUrl, news };
    } catch (err) {
      console.error(`Failed to scrape news for ${item.name} (${newsUrl})`, err);
      return { ...item, newsUrl, news: [] };
    }
  });

  return Promise.all(stockPromises);
}

export default getAllStockNews;
