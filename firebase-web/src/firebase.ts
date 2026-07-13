import {initializeApp} from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
const app=initializeApp({apiKey:"AIzaSyBYEm8VOffiTPuy3spPXc-quXDOczHWu2k",authDomain:"shopcerto.firebaseapp.com",projectId:"shopcerto",appId:"1:362976893415:web:4cb5e39e8a8629c5bd0542"});
export const auth=getAuth(app);export const db=getFirestore(app);export const googleProvider=new GoogleAuthProvider();
