/**
 * Fetches a single news article page and extracts its body text.
 * Targets the #spanContent container (div.newscontent5 > span > p...)
 * */

import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeAastocksArticleBody(url: string): Promise<string> {
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const $ = cheerio.load(html);
  const container = $("#spanContent");

  if (container.length === 0) {
    console.warn(`No #spanContent found for ${url}`);
    return "";
  }

  // Grab all <p> tags inside, join with double newline to preserve paragraph breaks
  const paragraphs = container
    .find("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((text) => text.length > 0);

  // Fallback: if there are no <p> tags, just take the container's full text
  if (paragraphs.length === 0) {
    return container.text().trim();
  }

  return paragraphs.join("\n\n");
}

export default scrapeAastocksArticleBody;
