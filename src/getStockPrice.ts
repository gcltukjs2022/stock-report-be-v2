import axios from "axios";
import { getStocks, iData } from "./utils/getStocks";

interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
}

interface YahooQuoteResponse {
  quoteResponse: {
    result: YahooQuote[];
    error: string | null;
  };
}

export interface StockPriceResult extends iData {
  marketPrice: number;
  changePercent: number;
}

const getStockPrice = async (): Promise<StockPriceResult[]> => {
  const { YAHOO_API, RAPIDAPI_KEY, RAPIDAPI_HOST } = process.env;

  if (!YAHOO_API || !RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    throw new Error(
      "Missing required env vars: YAHOO_API, RAPIDAPI_KEY, RAPIDAPI_HOST",
    );
  }

  const data = await getStocks();

  const symbols = data.map((el: iData) => el.yahooSymbol).join(",");

  try {
    const response = await axios.request<YahooQuoteResponse>({
      method: "GET",
      url: YAHOO_API,
      params: {
        region: "US",
        symbols,
      },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    const quotes = response.data.quoteResponse.result;

    // Map yahooSymbol -> quote for O(1) lookups instead of O(n^2) name matching
    const quoteBySymbol = new Map<string, YahooQuote>(
      quotes.map((quote) => [quote.symbol, quote]),
    );

    const priceResult: StockPriceResult[] = [];

    for (const item of data) {
      const quote = quoteBySymbol.get(item.yahooSymbol);

      if (!quote) {
        console.warn(`No quote returned for symbol: ${item.yahooSymbol}`);
        continue;
      }

      priceResult.push({
        marketPrice: quote.regularMarketPrice,
        changePercent: quote.regularMarketChangePercent,
        ...item,
      });
    }

    return priceResult;
  } catch (err) {
    console.error("----GET STOCK PRICE ERR----", err);
    throw err; // let the caller decide how to handle failure
  }
};

export default getStockPrice;
