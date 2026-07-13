import{cert,initializeApp}from"firebase-admin/app";
import{getFirestore,FieldValue}from"firebase-admin/firestore";

const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
if(!raw)throw new Error("Falta FIREBASE_SERVICE_ACCOUNT");
initializeApp({credential:cert(JSON.parse(raw))});
const db=getFirestore();
const sources=["Carrefour","Pão de Açúcar","Atacadão","Tenda Atacado","Sonda","Savegnago","Pague Menos","Coop","Spani","Assaí","Magalu","Mercado Livre","Amazon Brasil","Shopee","SHEIN","AliExpress"];

const pending=await db.collection("priceRequests").where("status","==","pending").limit(50).get();
for(const request of pending.docs){
  const data=request.data();
  await db.doc(`users/${data.userId}/products/${data.productId}`).set({priceStatus:"checking",lastSearchAttemptAt:FieldValue.serverTimestamp()},{merge:true});
  await request.ref.set({status:"connector_pending",processedAt:FieldValue.serverTimestamp()},{merge:true});
}

let notifications=0;
const users=await db.collection("users").get();
for(const user of users.docs){
  const activeAlerts=await user.ref.collection("alerts").where("active","==",true).get();
  for(const alertDoc of activeAlerts.docs){
    const alert=alertDoc.data();
    const productDoc=await user.ref.collection("products").doc(alert.productId).get();
    if(!productDoc.exists)continue;
    const product=productDoc.data(),price=Number(product.bestPrice),oldPrice=Number(product.oldPrice);
    if(!Number.isFinite(price)||price<=0)continue;
    const reachedTarget=alert.type==="target_price"&&Number.isFinite(Number(alert.threshold))&&price<=Number(alert.threshold);
    const dropped=alert.type==="price_drop"&&Number.isFinite(oldPrice)&&oldPrice>price;
    if(!reachedTarget&&!dropped)continue;
    const eventId=`${alertDoc.id}_${price.toFixed(2).replace(".","-")}`;
    const eventRef=user.ref.collection("alertEvents").doc(eventId);
    if((await eventRef.get()).exists)continue;
    await eventRef.set({alertId:alertDoc.id,productId:alert.productId,productName:alert.productName||product.name,message:reachedTarget?`Chegou ao preço desejado de R$ ${price.toFixed(2)}`:`O preço baixou de R$ ${oldPrice.toFixed(2)} para R$ ${price.toFixed(2)}`,price,store:product.store||null,offerUrl:product.offerUrl||null,createdAt:FieldValue.serverTimestamp()});
    notifications++;
  }
}

await db.doc("system/priceRefresh").set({status:"ready_for_connectors",lastRunAt:FieldValue.serverTimestamp(),sourceCount:sources.length,sources,message:"As fontes estão registradas; cada conector publicará unicamente preços verificáveis.",notifications},{merge:true});
console.log(`Ciclo registrado para ${sources.length} fontes, ${pending.size} solicitações novas e ${notifications} alertas.`);
