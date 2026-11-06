-- Reemplaza el correo por la cuenta que registraste en Supabase Auth.
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id and lower(u.email) = lower('TU_CORREO@EJEMPLO.COM');
