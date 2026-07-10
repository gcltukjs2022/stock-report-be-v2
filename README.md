# Stock Price App

Fetches stock quotes (price, % change) from a Yahoo Finance API on RapidAPI.

## Setup

```bash
npm install
cp .env.example .env
# then fill in YAHOO_API, RAPIDAPI_KEY, RAPIDAPI_HOST in .env
```

## Run (dev, no build step)

```bash
npm run dev
```

## Build & run (production)

```bash
npm run build
npm start
```

## Project structure

```
src/
  data.ts            # your list of tracked stocks (yahooSymbol, yahooName, ...)
  getStockPrice.ts    # fetches quotes and merges them with your stock data
  index.ts            # entry point, loads .env and runs getStockPrice()
```

## Notes

- `getStockPrice` matches API results to your `data` list by `yahooSymbol`
  (the symbol you send is the symbol Yahoo returns), rather than by name —
  this is more reliable and avoids special-casing any one stock.
- If a symbol in `data` doesn't come back in the API response, it's skipped
  with a `console.warn`, not silently dropped.
- On request failure, `getStockPrice` throws — handle/catch it at the call site.
# stock-report-be-v2
