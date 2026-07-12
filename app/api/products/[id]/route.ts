import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { products } from "../../../../db/schema";
import { ensureRequestUser } from "../../../../lib/request-user";

export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){const user=await ensureRequestUser(request);if(!user)return Response.json({error:"Sesión requerida"},{status:401});const {id}=await params;const deleted=await getDb().delete(products).where(and(eq(products.id,id),eq(products.userId,user.id))).returning({id:products.id});if(!deleted.length)return Response.json({error:"Producto no encontrado"},{status:404});return Response.json({deleted:true})}
