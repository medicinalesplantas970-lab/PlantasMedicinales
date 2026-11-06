# NaturalApp

NaturalApp conserva su interfaz estática en GitHub Pages y usa Supabase para compartir los datos entre sesiones y dispositivos. La app sigue en HTML, CSS y JavaScript; no requiere migrar a React para conectar la base de datos.

## Preparar Supabase

Sigue los pasos de [`supabase/SETUP.md`](supabase/SETUP.md): ejecuta el esquema, carga el catálogo inicial de 40 plantas y configura la URL y la clave publicable en `js/supabase-config.js`.

## Datos compartidos

- Plantas y sus cambios de administración.
- Comentarios visibles para usuarios con sesión iniciada.
- Conteo común de “Me gusta”. En esta app, marcar “Me gusta” también añade la planta a Favoritos.
- Favoritos asociados a cada cuenta y disponibles al iniciar sesión en otro dispositivo.
- Visitas acumuladas de usuarios autenticados; el panel sigue siendo exclusivo para administradores.
- Fotografía de perfil y fotografías cargadas por el administrador.

Las modificaciones de plantas, comentarios, reacciones y visitas se actualizan mediante Supabase Realtime. Las filas quedan protegidas con políticas RLS; solo la clave publicable debe aparecer en el cliente web.
