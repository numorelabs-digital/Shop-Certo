import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
const geist=Geist({variable:"--font-geist",subsets:["latin"]});
export const metadata:Metadata={title:"PrecioClaro — Comparador personal",description:"Organizá productos, compará el precio total y decidí cuándo comprar.",manifest:"/manifest.webmanifest"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className={geist.variable}>{children}</body></html>}
