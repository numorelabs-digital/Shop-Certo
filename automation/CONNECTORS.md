# ShopCerto price connectors

The collector uses two paths:

1. Direct product links: downloads the supplied URL and reads verified JSON-LD/Open Graph product data.
2. Broad search: queries configured retailer search pages and accepts structured products matching at least 45% of the requested words.

The current no-credential adapters cover Carrefour, Pão de Açúcar, Atacadão, Tenda, Sonda, Savegnago, Magalu, Mercado Livre, Amazon Brasil, Shopee and AliExpress. Retailers may block datacenter traffic or require a CEP cookie. Those failures are saved to `lastPriceError` and retried automatically.

Required GitHub repository secret:

- `FIREBASE_SERVICE_ACCOUNT_SHOPCERTO`: complete Firebase service-account JSON.

Optional future official API secrets can be added without changing the web app, for example `MERCADO_LIVRE_ACCESS_TOKEN`, `AMAZON_PARTNER_TAG`, and retailer affiliate credentials.
