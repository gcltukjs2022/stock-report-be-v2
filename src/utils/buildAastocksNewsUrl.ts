import { iData } from "../data";

function buildAastocksNewsUrl(item: iData): string {
  const { currency, aastocksParam } = item;

  switch (currency) {
    case "HKD":
      return `https://www.aastocks.com/tc/stocks/analysis/stock-aafn/${aastocksParam}/0/hk-stock-news/`;

    case "USD":
      return `https://www.aastocks.com/tc/usq/quote/stock-news.aspx?symbol=${aastocksParam}`;

    case "RMB":
      return `https://www.aastocks.com/tc/cnhk/quote/stock-news/${aastocksParam}/0/cn-stock-news/`;

    default:
      throw new Error(`Unsupported currency: ${currency}`);
  }
}

export default buildAastocksNewsUrl;
