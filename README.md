# PrecioClaro

Aplicación personal responsive para registrar productos, comparar el costo total de ofertas y planificar compras del hogar y cotidianas. La interfaz nunca presenta una integración pendiente como precio real: los registros incluidos son datos **demo** y están rotulados como tales.

## Qué incluye esta primera versión

- Dashboard responsive con navegación lateral y móvil, métricas, oportunidades y gráfico de ahorro.
- Catálogo con búsqueda global, filtros por tipo, estado y datos demo de heladera, TV, aspiradora, arroz, café, detergente y pañales.
- Alta de productos con identificación, categoría, marca, modelo, GTIN/EAN, objetivo y frecuencia.
- Listas de compras, estimación de mejor combinación y ahorro.
- Centro de alertas para precio objetivo, stock y datos desactualizados.
- Esquema relacional completo para usuarios, productos, tiendas, enlaces, snapshots históricos, listas, alertas y trabajos de actualización.
- Contrato único de adaptadores y adaptadores iniciales para Mercado Livre, Amazon Brasil, Magalu, Carrefour, Shopee y tiendas genéricas.
- PWA instalable, diseño claro/oscuro según el sistema y layouts adaptados a celular.
- Protección base de URLs contra protocolos inseguros y destinos locales (SSRF).

## Arquitectura y persistencia

Se eligió una base SQL relacional (D1/SQLite con Drizzle) porque ofertas, snapshots históricos, listas y propiedad por usuario se benefician de claves foráneas, índices y consultas agregadas. El modelo es portable a PostgreSQL/Supabase si el despliegue definitivo requiere autenticación pública independiente. D1 queda configurado para Sites; el acceso está encapsulado en `db/index.ts`.

Cada actualización crea un `price_snapshot`; no sobrescribe el historial. La interfaz consume una oferta común definida en `lib/stores/types.ts`. La extracción específica vive únicamente en adaptadores. Por ahora los adaptadores externos responden `manual_required`: la carga manual es el flujo seguro y funcional hasta configurar APIs oficiales o un worker Playwright externo.

## Ejecutar en Windows

Requiere Node.js 22.13 o superior.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abrí la URL local indicada. Para verificar producción:

```powershell
npm run build
```

## Variables y seguridad

Copiá `.env.example` a `.env.local`. No publiques `.env.local`. Las actualizaciones automáticas deberán validar sesión, propiedad del producto, rate limit, tamaño de respuesta, redirecciones y `ALLOWED_STORE_DOMAINS`. No se deben ejecutar scrapers desde una ruta pública sin cola ni límites.

## GitHub y despliegue

```powershell
git add .
git commit -m "feat: primera version de PrecioClaro"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/precioclaro.git
git push -u origin main
```

El proyecto usa Next.js compatible con el App Router. Para Vercel, importá el repositorio, agregá las variables del `.env.example` y ejecutá el build estándar. La configuración incluida de Sites usa D1; en Vercel conectá Supabase PostgreSQL y migrá el esquema Drizzle antes de habilitar persistencia real.

## Integraciones pendientes

- APIs oficiales: requieren credenciales y aprobación de cada comercio.
- Amazon, Magalu, Carrefour, Assaí, Pão de Açúcar, Casas Bahia, Extra, Drogasil, Droga Raia y Shopee: carga manual disponible; actualización automática pendiente.
- Scraping con Playwright: debe desplegarse como servicio/worker aislado y respetar términos, robots, caché y límites.
- Email, WhatsApp y push: el modelo de alertas está preparado, pero requieren proveedores externos.
- Escáner: la navegación y el campo GTIN están preparados; el lector de cámara requiere HTTPS y una librería de lectura de códigos.

## Próxima fase recomendada

Conectar autenticación y persistencia del proveedor elegido, implementar operaciones CRUD del lado servidor con validación y habilitar una primera API oficial. Hasta entonces, esta entrega funciona como experiencia completa de producto con datos demo y flujo manual, sin afirmar precios en vivo.
