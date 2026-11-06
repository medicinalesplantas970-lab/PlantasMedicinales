-- NaturalApp: esquema compartido para Supabase (PostgreSQL).
-- Ejecutar primero en Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Usuario',
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.plants (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  image_url text not null,
  description text not null default '',
  uses text not null default '',
  preparation text not null default '',
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plant_comments (
  id uuid primary key default gen_random_uuid(),
  plant_id text not null references public.plants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body varchar(200) not null check (length(trim(body)) between 1 and 200),
  created_at timestamptz not null default now()
);

-- En la app actual, pulsar «Me gusta» también añade/quita la planta de Favoritos.
-- Esta relación única conserva esa regla y mantiene ambos datos sincronizados.
create table if not exists public.plant_likes (
  plant_id text not null references public.plants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plant_id, user_id)
);

create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  page text not null check (page in ('inicio', 'remedios', 'perfil', 'agregar', 'dashboard')),
  user_id uuid not null references auth.users(id) on delete cascade,
  visited_at timestamptz not null default now()
);

create index if not exists plant_comments_plant_created_idx on public.plant_comments (plant_id, created_at desc);
alter table public.plants add column if not exists likes_count integer not null default 0 check (likes_count >= 0);

create index if not exists page_visits_page_created_idx on public.page_visits (page, visited_at desc);

create or replace function public.is_naturalapp_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.is_naturalapp_admin() from public;
grant execute on function public.is_naturalapp_admin() to authenticated;

create or replace function public.create_naturalapp_profile()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Usuario')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists naturalapp_create_profile on auth.users;
create trigger naturalapp_create_profile
after insert on auth.users
for each row execute function public.create_naturalapp_profile();

create or replace function public.set_naturalapp_comment_author()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'El comentario debe pertenecer a la sesión activa.';
  end if;
  select display_name into new.author_name from public.profiles where id = auth.uid();
  new.author_name := coalesce(nullif(trim(new.author_name), ''), 'Usuario');
  return new;
end;
$$;
drop trigger if exists naturalapp_comment_author on public.plant_comments;
create trigger naturalapp_comment_author
before insert on public.plant_comments
for each row execute function public.set_naturalapp_comment_author();

create or replace function public.adjust_naturalapp_like_count()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.plants set likes_count = likes_count + 1, updated_at = now() where id = new.plant_id;
    return new;
  end if;
  update public.plants set likes_count = greatest(0, likes_count - 1), updated_at = now() where id = old.plant_id;
  return old;
end;
$$;
drop trigger if exists naturalapp_like_count on public.plant_likes;
create trigger naturalapp_like_count
after insert or delete on public.plant_likes
for each row execute function public.adjust_naturalapp_like_count();

-- Devuelve solo totales, no expone la lista de cuentas que marcaron cada planta.
create or replace function public.naturalapp_like_counts()
returns table (plant_id text, likes bigint)
language sql stable security definer
set search_path = ''
as $$
  select l.plant_id, count(*)::bigint
  from public.plant_likes l
  group by l.plant_id;
$$;
revoke all on function public.naturalapp_like_counts() from public;
grant execute on function public.naturalapp_like_counts() to authenticated;

alter table public.profiles enable row level security;
alter table public.plants enable row level security;
alter table public.plant_comments enable row level security;
alter table public.plant_likes enable row level security;
alter table public.page_visits enable row level security;

revoke all on public.profiles, public.plants, public.plant_comments, public.plant_likes, public.page_visits from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant select on public.plants to anon, authenticated;
grant insert, update, delete on public.plants to authenticated;
grant select, insert, delete on public.plant_comments to authenticated;
grant select, insert, delete on public.plant_likes to authenticated;
grant select (id, name, image_url, description, uses, preparation, likes_count, created_at, updated_at) on public.plants to anon, authenticated;
grant select, insert on public.page_visits to authenticated;

drop policy if exists profiles_read_self_or_admin on public.profiles;
create policy profiles_read_self_or_admin on public.profiles
for select to authenticated using (id = auth.uid() or public.is_naturalapp_admin());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists plants_read on public.plants;
create policy plants_read on public.plants
for select to anon, authenticated using (true);
drop policy if exists plants_admin_insert on public.plants;
create policy plants_admin_insert on public.plants
for insert to authenticated with check (public.is_naturalapp_admin());
drop policy if exists plants_admin_update on public.plants;
create policy plants_admin_update on public.plants
for update to authenticated using (public.is_naturalapp_admin()) with check (public.is_naturalapp_admin());
drop policy if exists plants_admin_delete on public.plants;
create policy plants_admin_delete on public.plants
for delete to authenticated using (public.is_naturalapp_admin());

drop policy if exists comments_read on public.plant_comments;
create policy comments_read on public.plant_comments
for select to authenticated using (true);
drop policy if exists comments_insert_own on public.plant_comments;
create policy comments_insert_own on public.plant_comments
for insert to authenticated with check (user_id = auth.uid());
drop policy if exists comments_delete_own_or_admin on public.plant_comments;
create policy comments_delete_own_or_admin on public.plant_comments
for delete to authenticated using (user_id = auth.uid() or public.is_naturalapp_admin());

drop policy if exists likes_read_own on public.plant_likes;
create policy likes_read_own on public.plant_likes
for select to authenticated using (user_id = auth.uid());
drop policy if exists likes_insert_own on public.plant_likes;
create policy likes_insert_own on public.plant_likes
for insert to authenticated with check (user_id = auth.uid());
drop policy if exists likes_delete_own on public.plant_likes;
create policy likes_delete_own on public.plant_likes
for delete to authenticated using (user_id = auth.uid());

drop policy if exists visits_insert_own on public.page_visits;
create policy visits_insert_own on public.page_visits
for insert to authenticated with check (user_id = auth.uid());
drop policy if exists visits_admin_read on public.page_visits;
create policy visits_admin_read on public.page_visits
for select to authenticated using (public.is_naturalapp_admin());

-- Bucket público para servir imágenes; las escrituras quedan limitadas por carpeta/rol.
insert into storage.buckets (id, name, public)
values ('naturalapp', 'naturalapp', true)
on conflict (id) do update set public = excluded.public;
drop policy if exists naturalapp_images_public_read on storage.objects;
create policy naturalapp_images_public_read on storage.objects
for select to public using (bucket_id = 'naturalapp');
drop policy if exists naturalapp_images_upload on storage.objects;
create policy naturalapp_images_upload on storage.objects
for insert to authenticated with check (
  bucket_id = 'naturalapp' and (
    name like ('avatars/' || auth.uid()::text || '/%') or
    (name like 'plants/%' and public.is_naturalapp_admin())
  )
);
drop policy if exists naturalapp_images_update on storage.objects;
create policy naturalapp_images_update on storage.objects
for update to authenticated using (
  bucket_id = 'naturalapp' and (
    name like ('avatars/' || auth.uid()::text || '/%') or
    (name like 'plants/%' and public.is_naturalapp_admin())
  )
) with check (
  bucket_id = 'naturalapp' and (
    name like ('avatars/' || auth.uid()::text || '/%') or
    (name like 'plants/%' and public.is_naturalapp_admin())
  )
);
drop policy if exists naturalapp_images_delete on storage.objects;
create policy naturalapp_images_delete on storage.objects
for delete to authenticated using (
  bucket_id = 'naturalapp' and (
    name like ('avatars/' || auth.uid()::text || '/%') or
    (name like 'plants/%' and public.is_naturalapp_admin())
  )
);

-- Activa sincronización en vivo para las pantallas conectadas.
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.plants;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.plant_comments;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.plant_likes;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.page_visits;
exception when duplicate_object then null;
end $$;
