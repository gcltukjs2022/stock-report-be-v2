import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

export interface iData {
  name: string;
  yahooSymbol: string;
  currency: string;
  futunnParam: string;
  aastocksParam: string;
}

const TABLE_NAME = "Stocks";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/**
 * Fetches all tracked stocks from DynamoDB.
 * Replaces the old hardcoded `data` array — same shape (iData[]),
 * just sourced from the DB instead of a static file.
 */
export async function getStocks(): Promise<iData[]> {
  const { Items } = await client.send(
    new ScanCommand({ TableName: TABLE_NAME }),
  );
  return (Items ?? []) as iData[];
}
