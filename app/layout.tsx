import type {Metadata,Viewport} from "next";
import "./globals.css";
import FirebaseSession from "./firebase-session";

export const metadata:Metadata={
  title:"PrecioCerca — encontrá el mejor precio",
  description:"Compará precios de supermercado, hogar y electro cerca tuyo o con envío nacional.",
  manifest:"/manifest.webmanifest",
};

export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#6c63ff"};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="es"><body><FirebaseSession/>{children}</body></html>;
}
