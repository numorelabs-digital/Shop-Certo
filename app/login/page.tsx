"use client";

import {useState} from "react";
import {GoogleAuthProvider,signInWithPopup} from "firebase/auth";
import {firebaseAuth,firebaseConfigured} from "../../lib/firebase-client";

export default function LoginPage(){
  const[error,setError]=useState("");
  async function login(){
    if(!firebaseAuth)return;
    try{const result=await signInWithPopup(firebaseAuth,new GoogleAuthProvider()),idToken=await result.user.getIdToken();const response=await fetch("/api/auth/session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idToken})});if(!response.ok)throw new Error();location.href="/"}catch{setError("No pudimos iniciar sesión. Revisá que Google esté habilitado en Firebase.")}
  }
  return <main className="auth-page"><section><a href="/" className="auth-brand">precio<b>cerca</b></a><div className="auth-icon">G</div><p className="auth-over">TU CUENTA PERSONAL</p><h1>Guardá precios<br/>y encontralos siempre</h1><p>Ingresá con Google para sincronizar productos, listas, alertas y tu zona.</p><button onClick={login} disabled={!firebaseConfigured}><span>G</span>Continuar con Google</button>{!firebaseConfigured&&<div className="auth-warning">Falta conectar este sitio con tu proyecto de Firebase.</div>}{error&&<div className="auth-error">{error}</div>}<small>Al continuar aceptás los <a href="/termos">Términos</a> y la <a href="/privacidade">Política de privacidad</a>.</small></section></main>;
}
