import * as dotenv from "dotenv";
dotenv.config();
import getYahooStockPrice from "./helpers/getYahooStockPrice";
import getAllStockNews from "./helpers/getAllStocksNews";
import generateWord from "./helpers/generateWord";
import uploadToS3 from "./helpers/uploadToS3";
import axios from "axios";
import * as fs from "fs";
import * as os from "os";
import path from "path";

// async function main() {
//   try {
//     const priceResult = await getYahooStockPrice();
//     // console.log("Stock prices: ", JSON.stringify(priceResult, null, 2));
//     console.log("get stock price completed");

//     const allNewsLinks = await getAllStockNews();
//     // console.log("All news links: ", allNewsLinks);
//     console.log("get all stocks news completed");

//     const highlightStocksArr = priceResult.filter(
//       (el: any) => Math.abs(el.changePercent) >= 5,
//     );

//     const { fileName } = await generateWord(
//       highlightStocksArr,
//       allNewsLinks,
//       priceResult,
//     );

//     console.log("function completed");
//     console.log(`File saved to Desktop as: ${fileName}`);
//   } catch (err) {
//     console.error("Failed to generate stock report:", err);
//     process.exit(1);
//   }
// }

// main();

export const handler = async (event: any) => {
  try {
    const priceResult = await getYahooStockPrice();
    console.log("Stock prices: ", JSON.stringify(priceResult, null, 2));

    const allNewsLinks = await getAllStockNews();
    console.log("All news links: ", allNewsLinks);

    const highlightStocksArr = priceResult.filter(
      (el: any) => Math.abs(el.changePercent) >= 5,
    );

    const { buffer, fileName } = await generateWord(
      highlightStocksArr,
      allNewsLinks,
      priceResult,
    );

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("Missing required env var: S3_BUCKET_NAME");
    }

    await uploadToS3(buffer, bucketName, fileName);

    console.log("function completed");

    return {
      statusCode: 200,
      body: `File ${fileName} uploaded to ${bucketName}`,
    };
  } catch (err) {
    console.error("Failed to generate or upload stock report:", err);
    throw err; // let Lambda mark the invocation as failed
  }
};
