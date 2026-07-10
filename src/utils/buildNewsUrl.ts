import { iData } from "../data";

function buildNewsUrl(item: iData): string | null {
  const { currency, newsParam } = item;

  if (!newsParam) return null; // e.g. DBS (SGD) has no mapped pattern yet

  switch (currency) {
    case "HKD":
      return `https://www.aastocks.com/tc/stocks/analysis/stock-aafn/${newsParam}/0/hk-stock-news/`;

    case "USD":
      return `https://www.aastocks.com/tc/usq/quote/stock-news.aspx?symbol=${newsParam}`;

    case "RMB":
      return `https://www.aastocks.com/tc/cnhk/quote/stock-news/${newsParam}/0/cn-stock-news/`;

    default:
      return null; // SGD or any other unmapped currency
  }
}

export default buildNewsUrl;
