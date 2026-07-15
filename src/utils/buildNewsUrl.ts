import { iData } from "./getStocks";

function buildNewsUrl(item: iData): string | null {
  const { currency, aastocksParam } = item;

  if (!aastocksParam) return null; // e.g. DBS (SGD) has no mapped pattern yet

  switch (currency) {
    case "HKD":
      return `https://www.aastocks.com/tc/stocks/analysis/stock-aafn/${aastocksParam}/0/hk-stock-news/`;

    case "USD":
      return `https://www.aastocks.com/tc/usq/quote/stock-news.aspx?symbol=${aastocksParam}`;

    case "RMB":
      return `https://www.aastocks.com/tc/cnhk/quote/stock-news/${aastocksParam}/0/cn-stock-news/`;

    default:
      return null; // SGD or any other unmapped currency
  }
}

export default buildNewsUrl;
