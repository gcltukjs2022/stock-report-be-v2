import {
  Document,
  HeightRule,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import * as fs from "fs";
import moment from "moment";
import path from "path";
import { StockWithNews } from "./getAllStocksNews";
import { StockPriceResult } from "./getStockPrice";
import * as os from "os";
import toSimplified from "./utils/convertToSimplified";

const CURRENCY_LABEL: Record<string, string> = {
  USD: "美元",
  HKD: "港币",
};

function currencyLabel(currency: string): string {
  return CURRENCY_LABEL[currency] || "元";
}

function formatMonthDay(currency: string): { month: string; day: string } {
  // USD markets report on a 1-day lag relative to HK/local time
  const month =
    currency === "USD"
      ? moment(new Date()).subtract(1, "month").format("M")
      : moment(new Date()).format("M");
  const day =
    currency === "USD"
      ? moment(new Date()).subtract(1, "day").format("D")
      : moment(new Date()).format("D");
  return { month, day };
}

const generateWord = async (
  highlightStocksArr: StockPriceResult[],
  scrapingResult: StockWithNews[],
  priceResult: StockPriceResult[],
) => {
  console.log("----IN GEN WORD---");
  const currentDate = new Date();
  const currentDayOfMonth = currentDate.getDate();

  // --- Highlighted stocks paragraphs ---
  const highLightStocksParagraphs: Paragraph[] = highlightStocksArr.map(
    (stock) => {
      const isFirstOfMonth = currentDayOfMonth === 1;
      const month = isFirstOfMonth
        ? formatMonthDay(stock.currency).month
        : moment(new Date()).format("M");
      const day =
        stock.currency === "USD"
          ? moment(new Date()).subtract(1, "day").format("D")
          : moment(new Date()).format("D");

      return new Paragraph({
        children: [
          new TextRun({
            text: `${stock.name} ${month} 月 ${day} 日 ${
              stock.changePercent > 0 ? "涨幅" : "跌幅"
            }  ${Math.abs(stock.changePercent).toFixed(1)}%, 收盘价 ${
              stock.marketPrice
            } ${currencyLabel(stock.currency)}`,
            bold: true,
            highlight: "yellow",
          }),
        ],
      });
    },
  );

  // --- News articles paragraphs ---
  const articlesParagraphs: Paragraph[] = [];

  for (const stock of scrapingResult) {
    if (stock.news.length === 0) continue; // skip stocks with no same-day news

    articlesParagraphs.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        children: [
          new TextRun({
            text: stock.name,
            bold: true,
            highlight: "yellow",
          }),
        ],
      }),
    );

    for (const newsItem of stock.news) {
      const simplifiedTitle = toSimplified(newsItem.title);
      articlesParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: simplifiedTitle, bold: true })],
        }),
        new Paragraph({
          children: [new TextRun(newsItem.article)], // link to full article since we only scrape title/href/date
        }),
        new Paragraph({ children: [] }),
      );
    }
  }

  // --- Price table ---
  const firstRow = new Table({
    columnWidths: [901, 901, 7208],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 901, type: WidthType.DXA },
            children: [new Paragraph("Project")],
          }),
          new TableCell({
            width: { size: 901, type: WidthType.DXA },
            children: [new Paragraph("Local CCY")],
          }),
          new TableCell({
            width: { size: 7208, type: WidthType.DXA },
            children: [new Paragraph("Combine")],
          }),
        ],
        height: { value: 700, rule: HeightRule.EXACT },
      }),
    ],
  });

  const tableArr = priceResult.map((stock) => {
    const isFirstOfMonth = currentDayOfMonth === 1;
    const month = isFirstOfMonth
      ? formatMonthDay(stock.currency).month
      : moment(new Date()).format("M");
    const day =
      stock.currency === "USD"
        ? moment(new Date()).subtract(1, "day").format("D")
        : moment(new Date()).format("D");

    const changeAbs = isFirstOfMonth
      ? Math.round(stock.changePercent)
      : Math.abs(Math.round(stock.changePercent));

    return new Table({
      columnWidths: [901, 901, 7208],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 901, type: WidthType.DXA },
              children: [new Paragraph(stock.name)],
            }),
            new TableCell({
              width: { size: 901, type: WidthType.DXA },
              children: [new Paragraph(stock.currency)],
            }),
            new TableCell({
              width: { size: 7208, type: WidthType.DXA },
              children: [
                new Paragraph(
                  `${stock.name} ${month} 月 ${day} 日 ${
                    stock.changePercent > 0 ? "涨幅" : "跌幅"
                  } ${changeAbs}%, 收盘价 ${stock.marketPrice} ${currencyLabel(
                    stock.currency,
                  )}`,
                ),
              ],
            }),
          ],
          height: { value: 800, rule: HeightRule.EXACT },
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun(
                `Please find attached the listed share price summary as of `,
              ),
              new TextRun({
                text: `${moment(new Date()).format("YYYY.MM.DD.")}`,
                highlight: "yellow",
              }),
            ],
          }),
          new Paragraph({ children: [] }),
          new Paragraph({
            children: [
              new TextRun(
                "Below please also find public news which is relevant to the stocks or banks during the day: ",
              ),
            ],
          }),
          new Paragraph({ children: [] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "项目相关",
                bold: true,
                highlight: "yellow",
              }),
            ],
          }),
          ...highLightStocksParagraphs,
          new Paragraph({ children: [] }),
          ...articlesParagraphs,
          new Paragraph({ children: [] }),
          firstRow,
          ...tableArr,
        ],
      },
    ],
  });

  const formattedDate = moment().format("DDMMYYYY");

  const filePath = path.join("/tmp", `report${formattedDate}.docx`);
  // const filePath = path.join(
  //   os.homedir(),
  //   "Desktop",
  //   `report${formattedDate}.docx`,
  // );

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer, { encoding: "binary" });

  const fileName = `report${formattedDate}.docx`;

  return { buffer, fileName };
};

export default generateWord;
