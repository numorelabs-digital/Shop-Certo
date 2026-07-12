import { ensureRequestUser } from "../../../lib/request-user";

export async function GET(request:Request){const user=await ensureRequestUser(request);if(!user)return Response.json({user:null,signIn:"/login"},{status:401});return Response.json({user,signOut:"/logout"})}
