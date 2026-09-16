# charles-trade

## Market data setup

Crypto prices and history use CoinGecko's public API through server-side Next.js routes. The app caches quotes and shows an unavailable state instead of inventing prices.

The Market Pulse historical chart uses Twelve Data through a server-side route. Add `TWELVE_DATA_API_KEY` to `.env.local` for chart history.

To connect Nigerian Exchange quotes, create an NGN Market developer key at [ngnmarket.com/developer](https://ngnmarket.com/developer), and add it to `.env.local`:

```env
NGNMARKET_API_KEY=your_key_here
NGX_SYMBOLS=DANGCEM,MTNN,BUACEMENT,GTCO,ZENITHBANK
```

NGN Market updates prices approximately every 20 minutes during NGX trading hours. Never send the key in chat or commit `.env.local`.
