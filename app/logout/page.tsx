"use client";
import {useEffect} from "react";
import {signOut} from "firebase/auth";
import {firebaseAuth} from "../../lib/firebase-client";
export default function LogoutPage(){useEffect(()=>{Promise.all([firebaseAuth?signOut(firebaseAuth):Promise.resolve(),fetch("/api/auth/session",{method:"DELETE"})]).finally(()=>location.href="/")},[]);return <main className="auth-page"><section><h1>Cerrando sesión…</h1></section></main>}
