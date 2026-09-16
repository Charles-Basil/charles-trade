export function getCryptoIconUrl(symbol: string) {
  return `https://assets.coincap.io/assets/icons/${symbol.split("/")[0].toLowerCase()}@2x.png`;
}