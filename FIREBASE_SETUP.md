# Preparación de Firebase para PrecioCerca

La aplicación usa Firebase Authentication para que cualquier persona pueda crear una cuenta con Google. Los datos de productos, listas, alertas y preferencias continúan en la base segura del backend; Firebase no expone esos datos al navegador.

## Configuración necesaria

1. Crear un proyecto en Firebase Console.
2. En **Authentication > Sign-in method**, habilitar **Google** y elegir el correo de soporte.
3. En **Configuración del proyecto > Tus apps**, crear una aplicación Web.
4. Copiar los cuatro valores mostrados por Firebase a las variables de `.env.example`.
5. En **Authentication > Settings > Authorized domains**, agregar el dominio final y el dominio temporal de pruebas.
6. Configurar esas mismas variables en el proveedor donde se publique el backend.

## Dominio

Primero se agrega el dominio al alojamiento y después se copian en el registrador los registros DNS entregados. No se debe borrar el dominio temporal hasta que el certificado HTTPS del dominio propio figure activo.

## GitHub

Crear un repositorio privado vacío, agregarlo como remoto y subir la rama `main`. El flujo incluido verifica automáticamente cada cambio. Nunca subir `.env`, claves privadas ni archivos de cuentas de servicio.

## Eliminación de cuenta

El panel elimina tanto los datos de PrecioCerca como la identidad de Firebase. Google puede pedir un inicio de sesión reciente antes de permitir esta acción; en ese caso la persona vuelve a ingresar y confirma nuevamente.
