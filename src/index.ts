import * as dotenv from "dotenv";
dotenv.config();

import { getStockPrice } from "./getStockPrice";

const main = async () => {
  try {
    const prices = await getStockPrice();
    console.log(JSON.stringify(prices, null, 2));
  } catch (err) {
    console.error("Failed to fetch stock prices:", err);
    process.exit(1);
  }
};

main();
