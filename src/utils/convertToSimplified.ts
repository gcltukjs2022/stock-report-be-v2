import * as OpenCC from "opencc-js";

// t2s = Traditional -> Simplified
const converter = OpenCC.Converter({ from: "tw", to: "cn" });

function toSimplified(text: string): string {
  if (!text) return text;
  return converter(text);
}

export default toSimplified;
