import{cert,initializeApp}from"firebase-admin/app";
import{getFirestore,FieldValue}from"firebase-admin/firestore";

const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
if(!raw)throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_SHOPCERTO");
initializeApp({credential:cert(JSON.parse(raw))});
const db=getFirestore();
const headers={"user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36","accept-language":"pt-BR,pt;q=0.9,en;q=0.7"};
const stores={
  Mercado:[
    ["Carrefour",q=>`https://mercado.carrefour.com.br/busca/${encodeURIComponent(q)}`],
    ["Extra Mercado",q=>`https://www.extramercado.com.br/busca?q=${encodeURIComponent(q)}`],
    ["Pão de Açúcar",q=>`https://www.paodeacucar.com/busca?q=${encodeURIComponent(q)}`],
    ["Atacadão",q=>`https://www.atacadao.com.br/catalogsearch/result/?q=${encodeURIComponent(q)}`],
    ["Tenda Atacado",q=>`https://www.tendaatacado.com.br/busca?q=${encodeURIComponent(q)}`],
    ["Sonda",q=>`https://www.sondadelivery.com.br/delivery/busca/${encodeURIComponent(q)}`],
    ["Savegnago",q=>`https://www.savegnago.com.br/busca?q=${encodeURIComponent(q)}`],
    ["Pague Menos",q=>`https://www.superpaguemenos.com.br/busca?q=${encodeURIComponent(q)}`],
    ["Coop",q=>`https://www.coopsupermercado.com.br/busca?q=${encodeURIComponent(q)}`],
    ["Spani",q=>`https://www.spanionline.com.br/busca?q=${encodeURIComponent(q)}`]
  ],
  Hogar:[
    ["Magalu",q=>`https://www.magazineluiza.com.br/busca/${encodeURIComponent(q)}/`],
    ["Mercado Livre",q=>`https://lista.mercadolivre.com.br/${encodeURIComponent(q).replaceAll("%20","-")}`],
    ["Amazon Brasil",q=>`https://www.amazon.com.br/s?k=${encodeURIComponent(q)}`],
    ["Shopee",q=>`https://shopee.com.br/search?keyword=${encodeURIComponent(q)}`],
    ["AliExpress",q=>`https://pt.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q)}`]
  ]
};
const text=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const words=v=>new Set(text(v).split(/[^a-z0-9]+/).filter(word=>word.length>1));
const score=(query,title)=>{const wanted=words(query),found=words(title);return wanted.size?[...wanted].filter(word=>found.has(word)).length/wanted.size:0};
const number=v=>{if(typeof v==="number")return v;const clean=String(v??"").replace(/[^0-9,.-]/g,"");if(!clean)return NaN;return Number(clean.includes(",")?clean.replaceAll(".","").replace(",","."):clean)};
const absolute=(value,base)=>{try{return new URL(Array.isArray(value)?value[0]:value,base).toString()}catch{return null}};
const cleanHtml=value=>String(value||"").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();

async function download(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);try{const response=await fetch(url,{headers,redirect:"follow",signal:controller.signal});if(!response.ok)throw new Error(`HTTP ${response.status}`);return{html:await response.text(),url:response.url}}finally{clearTimeout(timer)}}
function structuredProducts(html,base,store){
  const results=[];
  const add=node=>{if(!node||typeof node!=="object")return;if(Array.isArray(node)){node.forEach(add);return}const type=Array.isArray(node["@type"])?node["@type"].join(" "):node["@type"];if(/product/i.test(String(type||""))){const offers=Array.isArray(node.offers)?node.offers:[node.offers].filter(Boolean);for(const offer of offers){const price=number(offer?.price??offer?.lowPrice??node.price);if(Number.isFinite(price)&&price>0)results.push({title:node.name||node.headline||"Produto",price,oldPrice:number(offer?.highPrice),currency:offer?.priceCurrency||"BRL",url:absolute(offer?.url||node.url,base)||base,imageUrl:absolute(node.image,base),shipping:number(offer?.shippingDetails?.shippingRate?.value),availability:offer?.availability||null,store})}}Object.values(node).forEach(add)};
  for(const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{add(JSON.parse(match[1].trim()))}catch{}}
  const meta=(property)=>html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)`,"i"))?.[1]||html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,"i"))?.[1];
  const metaPrice=number(meta("product:price:amount"));if(Number.isFinite(metaPrice)&&metaPrice>0)results.push({title:meta("og:title")||"Produto",price:metaPrice,currency:meta("product:price:currency")||"BRL",url:meta("og:url")||base,imageUrl:absolute(meta("og:image"),base),store});
  for(const heading of html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)){const title=cleanHtml(heading[1]);if(title.length<3)continue;const start=heading.index||0,before=html.slice(Math.max(0,start-3500),start),after=html.slice(start,Math.min(html.length,start+3500)),priceMatch=after.match(/R\$\s*([0-9.]+,[0-9]{2})/i);if(!priceMatch)continue;const links=[...before.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)],link=links.at(-1)?.[1],images=[...before.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi)],image=images.at(-1)?.[1],price=number(priceMatch[1]);if(link&&Number.isFinite(price)&&price>0)results.push({title,price,currency:"BRL",url:absolute(link,base)||base,imageUrl:absolute(image,base),store})}
  return results;
}
async function collect(url,store,query,direct=false){try{const page=await download(url),items=structuredProducts(page.html,page.url,store).filter(item=>item.currency==="BRL"||!item.currency).map(item=>({...item,match:score(query,item.title)}));return items.filter(item=>direct||item.match>=.45)}catch(error){return[{error:`${store}: ${error.message}`,store}]}}

async function updateProduct({userId,productId,requestRef}){
  const productRef=db.doc(`users/${userId}/products/${productId}`),productSnap=await productRef.get();if(!productSnap.exists)return;
  const product=productSnap.data(),user=(await db.doc(`users/${userId}`).get()).data()||{},query=[product.name,product.brand,product.detail==="Busca ampla por descrição"?"":product.detail].filter(Boolean).join(" "),candidates=[],errors=[];
  await productRef.set({priceStatus:"checking",lastSearchAttemptAt:FieldValue.serverTimestamp()},{merge:true});
  if(product.sourceUrl){for(const item of await collect(product.sourceUrl,product.sourceStore||new URL(product.sourceUrl).hostname,query,true))item.error?errors.push(item.error):candidates.push(item)}
  const adapters=stores[product.category]||stores.Hogar;
  for(const [store,makeUrl] of adapters){for(const item of await collect(makeUrl(query),store,query))item.error?errors.push(item.error):candidates.push(item)}
  const unique=[...new Map(candidates.map(item=>[`${item.store}|${item.url}|${item.price}`,item])).values()].sort((a,b)=>a.price-b.price),best=unique[0];
  if(best){const previous=number(product.bestPrice);await productRef.set({name:product.sourceUrl&&best.title?best.title:product.name,bestPrice:best.price,...(Number.isFinite(previous)?{oldPrice:previous}:Number.isFinite(best.oldPrice)?{oldPrice:best.oldPrice}:{}),shipping:Number.isFinite(best.shipping)?best.shipping:0,store:best.store,offerUrl:best.url,imageUrl:best.imageUrl||product.imageUrl||null,offersCount:unique.length,priceStatus:"ready",lastPriceCheckAt:FieldValue.serverTimestamp(),lastPriceError:FieldValue.delete(),locationUsed:{postalCode:user.postalCode||null,street:user.street||null,radiusKm:user.radiusKm||null}}, {merge:true});await productRef.collection("priceHistory").add({price:best.price,store:best.store,url:best.url,checkedAt:FieldValue.serverTimestamp()});if(requestRef)await requestRef.set({status:"done",offersFound:unique.length,processedAt:FieldValue.serverTimestamp()},{merge:true});return true}
  await productRef.set({priceStatus:"no_offer",lastPriceCheckAt:FieldValue.serverTimestamp(),lastPriceError:errors.slice(0,6),locationUsed:{postalCode:user.postalCode||null,street:user.street||null,radiusKm:user.radiusKm||null}},{merge:true});if(requestRef)await requestRef.set({status:"retry",attempts:FieldValue.increment(1),lastErrors:errors.slice(0,6),processedAt:FieldValue.serverTimestamp()},{merge:true});return false;
}

const queue=new Map(),requests=await db.collection("priceRequests").where("status","in",["pending","retry"]).limit(30).get();for(const request of requests.docs){const data=request.data();queue.set(`${data.userId}/${data.productId}`,{userId:data.userId,productId:data.productId,requestRef:request.ref})}
const users=await db.collection("users").get();for(const user of users.docs){const products=await user.ref.collection("products").get();for(const product of products.docs){const checked=product.data().lastPriceCheckAt?.toMillis?.()||0;if(Date.now()-checked>20*60*60*1000&&!queue.has(`${user.id}/${product.id}`))queue.set(`${user.id}/${product.id}`,{userId:user.id,productId:product.id})}}
let updated=0;for(const job of queue.values())if(await updateProduct(job))updated++;

let notifications=0;for(const user of users.docs){const activeAlerts=await user.ref.collection("alerts").where("active","==",true).get();for(const alertDoc of activeAlerts.docs){const alert=alertDoc.data(),productDoc=await user.ref.collection("products").doc(alert.productId).get();if(!productDoc.exists)continue;const product=productDoc.data(),price=number(product.bestPrice),oldPrice=number(product.oldPrice);if(!Number.isFinite(price)||price<=0)continue;const reached=alert.type==="target_price"&&price<=number(alert.threshold),dropped=alert.type==="price_drop"&&Number.isFinite(oldPrice)&&oldPrice>price;if(!reached&&!dropped)continue;const ref=user.ref.collection("alertEvents").doc(`${alertDoc.id}_${price.toFixed(2).replace(".","-")}`);if((await ref.get()).exists)continue;await ref.set({alertId:alertDoc.id,productId:alert.productId,productName:alert.productName||product.name,message:reached?`Chegou ao preço desejado de R$ ${price.toFixed(2)}`:`O preço baixou de R$ ${oldPrice.toFixed(2)} para R$ ${price.toFixed(2)}`,price,store:product.store||null,offerUrl:product.offerUrl||null,createdAt:FieldValue.serverTimestamp()});notifications++}}
await db.doc("system/priceRefresh").set({status:"completed",lastRunAt:FieldValue.serverTimestamp(),jobs:queue.size,updated,notifications},{merge:true});console.log(JSON.stringify({jobs:queue.size,updated,notifications}));
