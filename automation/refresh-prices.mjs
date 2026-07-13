import{cert,initializeApp}from"firebase-admin/app";import{getFirestore,FieldValue}from"firebase-admin/firestore";
const raw=process.env.FIREBASE_SERVICE_ACCOUNT;if(!raw)throw new Error("Falta FIREBASE_SERVICE_ACCOUNT");initializeApp({credential:cert(JSON.parse(raw))});const db=getFirestore();
const sources=["Carrefour","Pão de Açúcar","Atacadão","Tenda Atacado","Sonda","Savegnago","Pague Menos","Coop","Spani","Assaí","Magalu","Mercado Livre","Amazon Brasil","Shopee","SHEIN","AliExpress"];
const pending=await db.collection("priceRequests").where("status","==","pending").limit(50).get();
for(const request of pending.docs){const data=request.data();await db.doc(`users/${data.userId}/products/${data.productId}`).set({priceStatus:"checking",lastSearchAttemptAt:FieldValue.serverTimestamp()},{merge:true});await request.ref.set({status:"connector_pending",processedAt:FieldValue.serverTimestamp()},{merge:true});}
await db.doc("system/priceRefresh").set({status:"ready_for_connectors",lastRunAt:FieldValue.serverTimestamp(),sourceCount:sources.length,sources,message:"Las fuentes están registradas; cada conector publicará únicamente precios verificables."},{merge:true});
console.log(`Ciclo registrado para ${sources.length} fuentes y ${pending.size} solicitudes nuevas.`);
