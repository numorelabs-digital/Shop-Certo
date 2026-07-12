export type PriceSource = {
  id: string;
  name: string;
  url: string;
  segment: "Mercado" | "Hogar";
  locationMode: "CEP" | "Sucursal" | "Nacional" | "Marketplace";
  coverage: string;
  priority: "Inicial" | "Segunda etapa";
  enabled: boolean;
  note: string;
};

export const launchMarket = {
  country: "Brasil",
  countryCode: "BR",
  currency: "BRL",
  language: "pt-BR",
  initialRegion: "Estado de São Paulo",
  initialCity: "São Paulo, SP",
};

export const priceSources: PriceSource[] = [
  {id:"carrefour",name:"Carrefour Mercado",url:"https://mercado.carrefour.com.br/",segment:"Mercado",locationMode:"CEP",coverage:"Brasil según CEP",priority:"Inicial",enabled:true,note:"Catálogo y ofertas dependen del CEP."},
  {id:"pao-de-acucar",name:"Pão de Açúcar",url:"https://www.paodeacucar.com/",segment:"Mercado",locationMode:"CEP",coverage:"São Paulo y zonas atendidas",priority:"Inicial",enabled:true,note:"Precios y entrega cambian por ubicación."},
  {id:"atacadao",name:"Atacadão",url:"https://www.atacadao.com.br/",segment:"Mercado",locationMode:"Sucursal",coverage:"Brasil según tienda",priority:"Inicial",enabled:true,note:"Requiere seleccionar tienda o informar CEP."},
  {id:"tenda",name:"Tenda Atacado",url:"https://www.tendaatacado.com.br/",segment:"Mercado",locationMode:"Sucursal",coverage:"Capital, Grande SP, litoral e interior",priority:"Inicial",enabled:true,note:"Fuente importante para la primera región."},
  {id:"sonda",name:"Sonda Supermercados",url:"https://www.sondadelivery.com.br/",segment:"Mercado",locationMode:"CEP",coverage:"Grande São Paulo",priority:"Inicial",enabled:true,note:"Catálogo de delivery regional."},
  {id:"savegnago",name:"Savegnago",url:"https://www.savegnago.com.br/",segment:"Mercado",locationMode:"CEP",coverage:"Interior de São Paulo",priority:"Segunda etapa",enabled:true,note:"Amplía la cobertura fuera de la capital."},
  {id:"pague-menos",name:"Supermercados Pague Menos",url:"https://www.superpaguemenos.com.br/",segment:"Mercado",locationMode:"Sucursal",coverage:"Interior de São Paulo",priority:"Segunda etapa",enabled:true,note:"Ofertas asociadas a la unidad elegida."},
  {id:"coop",name:"Coop Supermercado",url:"https://www.coopsupermercado.com.br/",segment:"Mercado",locationMode:"CEP",coverage:"ABC Paulista e interior",priority:"Segunda etapa",enabled:true,note:"Catálogo y entrega regional."},
  {id:"spani",name:"Spani Atacadista",url:"https://www.spanionline.com.br/",segment:"Mercado",locationMode:"Sucursal",coverage:"São Paulo según sucursal",priority:"Segunda etapa",enabled:true,note:"Precios vinculados a la sucursal."},
  {id:"assai",name:"Assaí Atacadista",url:"https://www.assai.com.br/",segment:"Mercado",locationMode:"Sucursal",coverage:"Brasil",priority:"Segunda etapa",enabled:false,note:"Catálogo público de precios no siempre disponible; queda en observación."},
  {id:"magalu",name:"Magalu",url:"https://www.magazineluiza.com.br/",segment:"Hogar",locationMode:"Nacional",coverage:"Brasil",priority:"Inicial",enabled:true,note:"Retail y marketplace con cálculo de envío por CEP."},
  {id:"mercado-livre",name:"Mercado Livre Brasil",url:"https://www.mercadolivre.com.br/",segment:"Hogar",locationMode:"Marketplace",coverage:"Brasil",priority:"Inicial",enabled:true,note:"Debe diferenciar vendedor, condición y reputación."},
  {id:"amazon",name:"Amazon Brasil",url:"https://www.amazon.com.br/",segment:"Hogar",locationMode:"Marketplace",coverage:"Brasil",priority:"Inicial",enabled:true,note:"Debe distinguir Amazon de vendedores externos."},
  {id:"shopee",name:"Shopee Brasil",url:"https://shopee.com.br/",segment:"Hogar",locationMode:"Marketplace",coverage:"Brasil",priority:"Segunda etapa",enabled:true,note:"Precio total depende de vendedor, cupón y envío."},
  {id:"shein",name:"SHEIN Brasil",url:"https://br.shein.com/",segment:"Hogar",locationMode:"Nacional",coverage:"Brasil",priority:"Segunda etapa",enabled:true,note:"Más relevante para hogar y decoración que para electro."},
  {id:"aliexpress",name:"AliExpress Brasil",url:"https://pt.aliexpress.com/",segment:"Hogar",locationMode:"Marketplace",coverage:"Brasil e importación",priority:"Segunda etapa",enabled:true,note:"URL corregida; considerar impuestos, plazo y origen internacional."},
];
