export type FirebaseIdentity={uid:string;email:string;name:string;emailVerified:boolean;provider:string};

export async function verifyFirebaseToken(idToken:string):Promise<FirebaseIdentity|null>{
  const apiKey=process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if(!apiKey||!idToken)return null;
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idToken}),cache:"no-store"});
  if(!response.ok)return null;
  const data=await response.json() as {users?:Array<{localId:string;email?:string;displayName?:string;emailVerified?:boolean;providerUserInfo?:Array<{providerId?:string}>}>};
  const user=data.users?.[0];
  if(!user?.localId||!user.email)return null;
  return {uid:user.localId,email:user.email.toLowerCase(),name:user.displayName||user.email.split("@")[0],emailVerified:Boolean(user.emailVerified),provider:user.providerUserInfo?.[0]?.providerId||"google.com"};
}
