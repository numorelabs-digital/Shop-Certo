export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  presentation: string;
  category: "Mercado" | "Hogar";
  barcode?: string;
  model?: string;
  emoji: string;
};

export const catalogProducts: CatalogProduct[] = [
  {id:"pilao-tradicional-500",name:"Café torrado e moído Tradicional",brand:"Pilão",presentation:"Paquete 500 g",category:"Mercado",barcode:"7896089011980",emoji:"☕"},
  {id:"pilao-tradicional-250",name:"Café torrado e moído Tradicional",brand:"Pilão",presentation:"Paquete 250 g",category:"Mercado",barcode:"7896089011973",emoji:"☕"},
  {id:"pilao-extraforte-500",name:"Café torrado e moído Extraforte",brand:"Pilão",presentation:"Paquete 500 g",category:"Mercado",emoji:"☕"},
  {id:"samsung-du8000-55",name:"Smart TV 4K 55 pulgadas",brand:"Samsung",presentation:"Crystal UHD",category:"Hogar",model:"UN55DU8000GXZD",emoji:"📺"},
  {id:"samsung-q60d-55",name:"Smart TV QLED 4K 55 pulgadas",brand:"Samsung",presentation:"QLED",category:"Hogar",model:"QN55Q60DAGXZD",emoji:"📺"},
];

export function findCatalogProducts(query: string, category: "Mercado" | "Hogar") {
  const terms = query.toLocaleLowerCase("pt-BR").trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return catalogProducts.filter(product => {
    if (product.category !== category) return false;
    const haystack = `${product.name} ${product.brand} ${product.presentation} ${product.barcode ?? ""} ${product.model ?? ""}`.toLocaleLowerCase("pt-BR");
    return terms.every(term => haystack.includes(term));
  });
}
