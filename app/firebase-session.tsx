"use client";

import {useEffect} from "react";
import {onIdTokenChanged} from "firebase/auth";
import {firebaseAuth} from "../lib/firebase-client";

export default function FirebaseSession(){
  useEffect(()=>{
    if(!firebaseAuth)return;
    return onIdTokenChanged(firebaseAuth,async user=>{
      if(user){const idToken=await user.getIdToken();await fetch("/api/auth/session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idToken})})}
      else await fetch("/api/auth/session",{method:"DELETE"});
    });
  },[]);
  return null;
}
