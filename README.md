# ShopCerto

Aplicación móvil para comparar precios en Brasil. La versión pública vive en Firebase Hosting, usa Google mediante Firebase Authentication y guarda los datos personales en Cloud Firestore.

## Aplicación actual

- Frontend: `firebase-web/`
- Producción: `https://shopcerto.web.app`
- Dominio previsto: `shopcerto.numorelabs.com.br`
- Datos: Firestore con reglas por usuario
- Actualización diaria: GitHub Actions

## Desarrollo

```bash
npm install --prefix firebase-web
npm run dev --prefix firebase-web
```

## Publicación

El flujo `firebase-hosting.yml` publica la rama `main` cuando existe el secreto empresarial `FIREBASE_SERVICE_ACCOUNT_SHOPCERTO`. Nunca se deben guardar cuentas de servicio o claves privadas en el repositorio.

La carpeta histórica de la primera maqueta se conserva temporalmente como referencia, pero no participa del build ni del alojamiento Firebase.
