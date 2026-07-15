import { data, iData } from "../data";
import toSimplified from "../utils/convertToSimplified";
import pLimit from "p-limit";
import { sampleStockPrice } from "../sampleStockPrice";
import getAllowedDates from "../utils/getAllowedDates";
import aastocksGetValidDates from "../utils/astocksGetValidDates";
import buildAastocksNewsUrl from "../utils/buildAastocksNewsUrl";
import scrapeAastocksNews from "./aastocks/scrapeAastocksNews";
import scrapeFutunnNews from "./futunn/scrapeFutunnNews";
import scrapeAastocksArticleBody from "./aastocks/scrapeAastocksArticleBody";
import scrapeFutunnArticleBody from "./futunn/scrapeFutunnArticleBody";

interface NewsItemWoArticle {
  title: string;
  href: string;
  dateRaw: string | null; // e.g. '2026/07/03 14:05'
  dateYYYYMMDD: string | null; // e.g. '20260703'
}

interface NewsItem {
  stock: string;
  title: string;
  href: string;
  dateRaw: string | null;
  dateYYYYMMDD: string | null;
  article: string;
}

export interface StockWithNews extends iData {
  //   newsUrl: string | null;
  news: NewsItem[];
}

async function getAllStockNews(): Promise<StockWithNews[]> {
  // Aastocks
  const validDates = aastocksGetValidDates();

  const aastocksPromises = data.map(async (item): Promise<StockWithNews> => {
    const newsUrl = buildAastocksNewsUrl(item);

    function resolveHref(
      href: string,
      base = "https://www.aastocks.com",
    ): string {
      if (!href) return href;
      return href.startsWith("http") ? href : `${base}${href}`;
    }

    function filterNewsByValidDates(
      news: NewsItemWoArticle[],
      validDates: Set<string>,
    ): NewsItemWoArticle[] {
      return news.filter(
        (n) => n.dateYYYYMMDD !== null && validDates.has(n.dateYYYYMMDD),
      );
    }

    try {
      const rawNews = await scrapeAastocksNews(newsUrl);
      const filteredNews = rawNews
        .map((n) => ({ ...n, href: resolveHref(n.href) }))
        .filter((n) => filterNewsByValidDates([n], validDates).length > 0);

      const news: NewsItem[] = await Promise.all(
        filteredNews.map(async (n) => {
          try {
            const rawArticle = await scrapeAastocksArticleBody(n.href);
            const article = toSimplified(rawArticle);

            return { ...n, article, stock: item.name };
          } catch (err) {
            console.error(`Failed to fetch article body for ${n.href}`, err);
            return { ...n, article: "", stock: item.name };
          }
        }),
      );

      return { ...item, news };
    } catch (err) {
      console.error(
        `Aastocks Failed to scrape news for ${item.name} (${newsUrl})`,
        err,
      );
      return { ...item, news: [] };
    }
  });

  // return Promise.all(aastocksPromises);

  // Futunn
  const stockPromises = data.map(async (item): Promise<StockWithNews> => {
    //   const stockPromises = sampleStockPrice.map(
    // async (item): Promise<StockWithNews> => {
    const newsUrl = `https://www.futunn.com/hk/stock/${item.futunnParam}/news?`;

    try {
      const rawNews = await scrapeFutunnNews(newsUrl, item.futunnParam);

      const allowedDates = getAllowedDates();
      const filteredNews = rawNews.filter(
        (item) => item.dateYYYYMMDD && allowedDates.has(item.dateYYYYMMDD),
      );

      console.log("filterNews: ", filteredNews);

      const limit = pLimit(2);

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      const newsResults = await Promise.all(
        filteredNews.map((n) =>
          limit(async () => {
            try {
              await sleep(Math.random() * 2000 + 1000);

              const rawArticle = await scrapeFutunnArticleBody(n.href);

              if (!rawArticle || rawArticle.trim() === "") {
                return null;
              }

              const article = toSimplified(rawArticle);

              if (!article || article.trim() === "") {
                return null;
              }

              return { ...n, article };
            } catch (err) {
              console.error(`Failed to fetch article body for ${n.href}`);
              return null;
            }
          }),
        ),
      );

      const news: NewsItem[] = newsResults.filter(
        (n): n is NewsItem => n !== null,
      );

      return { ...item, news };
    } catch (err) {
      console.error(`Failed to scrape news for ${item.name} (${newsUrl})`, err);
      return { ...item, news: [] };
    }
  });

  return Promise.all(stockPromises);
}

export default getAllStockNews;
