import axios from "axios";

const futunnClient = axios.create({
  timeout: 15000,
  headers: {
    // "User-Agent":
    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
    Accept:
      // "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "*/*",
    "Accept-Language": "zh-hk,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Upgrade-Insecure-Requests": "1",
    Referer: "https://news.futunn.com/",
    Cookie: `wafToken=${process.env.FUTUNN_WAFTOKEN}`,
  },
});

export default futunnClient;
