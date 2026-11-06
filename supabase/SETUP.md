# Supabase para NaturalApp

## 1. Crear el proyecto y ejecutar el esquema

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta `supabase/schema.sql`.
3. Ejecuta `supabase/seed.sql`. Importa las 40 plantas con su descripción, uso tradicional, preparación e imagen. Se puede volver a ejecutar; no sobrescribe fichas ya existentes.

## 2. Configurar la app estática

En el panel del proyecto, copia **Project URL** y la **publishable key**. Colócalas en `js/supabase-config.js`:

```js
window.NATURALAPP_SUPABASE_CONFIG = {
  projectUrl: "https://TU_PROJECT_REF.supabase.co",
  publishableKey: "sb_publishable_...",
};
```

La clave publishable es pública y funciona con las políticas RLS del esquema. Nunca uses `sb_secret_...` ni `service_role` en esta app o en GitHub.

En **Authentication → URL Configuration**, establece como Site URL la dirección de GitHub Pages y agrega esa misma URL (incluida la carpeta del repositorio) a las redirect URLs permitidas. Agrega `http://localhost:5500/**` si desarrollas localmente con Live Server. El registro por correo puede requerir confirmar el mensaje antes de iniciar sesión.

## 3. Crear el administrador

1. Registra desde la app el correo que usarás como administrador y confirma la cuenta si Supabase lo solicita.
2. Abre `supabase/promote-admin.sql`, cambia `TU_CORREO@EJEMPLO.COM` por ese correo y ejecuta el SQL en Supabase.
3. Cierra sesión y vuelve a entrar para que la app lea el rol actualizado.

Las cuentas creadas desde el registro reciben rol `user`. El rol administrador se asigna desde SQL, no desde el navegador.

## 4. Publicar

Guarda `js/supabase-config.js` con la URL y clave publicable, sube los cambios al repositorio y espera el despliegue de GitHub Pages. El sitio necesita HTTPS para las sesiones seguras y Supabase Realtime.

## Qué queda en la base

`profiles`, `plants`, `plant_comments`, `plant_likes` y `page_visits`. “Me gusta” y Favoritos son la misma relación por cuenta, igual que en la app actual. Comentarios, reacciones y cambios de catálogo se comparten en vivo; las visitas se acumulan para el panel administrador.

El SQL inicial carga el catálogo. Usuarios, contraseñas, comentarios, favoritos y visitas que existan únicamente en el `localStorage` de un navegador no se importan con `seed.sql`; la cuenta administradora de demostración local tampoco se conserva. Cada usuario debe registrarse con Supabase Auth.
