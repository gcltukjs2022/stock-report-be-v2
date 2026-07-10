import * as dotenv from "dotenv";
dotenv.config();
import getStockPrice from "./getStockPrice";
import getAllStockNews from "./getAllStocksNews";
import generateWord from "./generateWord";
import uploadToS3 from "./utils/uploadToS3";

export const handler = async (event: any) => {
  try {
    const priceResult = await getStockPrice();
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
