import { getDb } from "../db";
import { users } from "../db/schema";

export async function ensureRequestUser(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email) return null;
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  const name = encodedName && request.headers.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8" ? decodeURIComponent(encodedName) : "Mi perfil";
  const id = `usr_${await sha256(email)}`;
  const now = new Date();
  await getDb().insert(users).values({id,email,name,createdAt:now,updatedAt:now}).onConflictDoUpdate({target:users.id,set:{name,updatedAt:now}});
  return { id, email, name };
}

async function sha256(value:string){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes)).slice(0,12).map(x=>x.toString(16).padStart(2,"0")).join("")}
