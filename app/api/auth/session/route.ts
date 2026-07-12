import {verifyFirebaseToken} from "../../../../lib/firebase-token";

const cookie="pc_session";
export async function POST(request:Request){
  const {idToken}=await request.json() as {idToken?:string};
  const user=idToken?await verifyFirebaseToken(idToken):null;
  if(!user)return Response.json({error:"Credencial inválida"},{status:401});
  return Response.json({authenticated:true,user},{headers:{"set-cookie":`${cookie}=${encodeURIComponent(idToken!)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3300`}});
}
export async function DELETE(){return Response.json({authenticated:false},{headers:{"set-cookie":`${cookie}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`}})}
