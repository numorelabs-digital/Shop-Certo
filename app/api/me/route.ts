import { ensureRequestUser } from "../../../lib/request-user";

export async function GET(request:Request){const user=await ensureRequestUser(request);if(!user)return Response.json({user:null,signIn:"/signin-with-chatgpt?return_to=%2F"},{status:401});return Response.json({user,signOut:"/signout-with-chatgpt?return_to=%2F"})}
