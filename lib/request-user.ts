import { getDb } from "../db";
import { userIdentities, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyFirebaseToken } from "./firebase-token";

export async function ensureRequestUser(request: Request) {
  const cookies=request.headers.get("cookie")||"",session=cookies.match(/(?:^|;\s*)pc_session=([^;]+)/)?.[1],bearer=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const firebase=await verifyFirebaseToken(bearer||decodeURIComponent(session||""));
  const email = firebase?.email||request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email) return null;
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  const name = firebase?.name||(encodedName && request.headers.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8" ? decodeURIComponent(encodedName) : "Mi perfil");
  const id = firebase?`usr_fb_${firebase.uid}`:`usr_${await sha256(email)}`;
  const now = new Date();
  await getDb().insert(users).values({id,email,name,createdAt:now,updatedAt:now}).onConflictDoUpdate({target:users.id,set:{name,updatedAt:now}});
  const provider=firebase?"google":"chatgpt",subject=firebase?.uid||email;
  await getDb().insert(userIdentities).values({id:`idn_${provider}_${await sha256(subject)}`,userId:id,provider,providerSubject:subject,email,emailVerified:firebase?.emailVerified??true,linkedAt:now,lastLoginAt:now}).onConflictDoUpdate({target:[userIdentities.provider,userIdentities.providerSubject],set:{email,emailVerified:firebase?.emailVerified??true,lastLoginAt:now}});
  const [record]=await getDb().select({role:users.role}).from(users).where(eq(users.id,id));
  return { id, email, name, role:record?.role||"user" };
}

async function sha256(value:string){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes)).slice(0,12).map(x=>x.toString(16).padStart(2,"0")).join("")}
