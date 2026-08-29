create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  closet_name text not null default '슈가',
  updated_at timestamptz not null default now()
);

create table public.shoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '새 신발',
  brand text not null default 'Brand',
  image_url text not null,
  image_path text,
  price integer not null default 0,
  added_at timestamptz not null default now(),
  memo text,
  worn_count integer not null default 0,
  last_worn_at timestamptz
);

create index shoes_user_id_added_at_idx on public.shoes (user_id, added_at desc);

alter table public.profiles enable row level security;
alter table public.shoes enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "shoes_select_own"
  on public.shoes for select to authenticated
  using (user_id = (select auth.uid()));

create policy "shoes_insert_own"
  on public.shoes for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "shoes_update_own"
  on public.shoes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "shoes_delete_own"
  on public.shoes for delete to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.shoes to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shoes',
  'shoes',
  true,
  5242880,
  array['image/jpeg']::text[]
);

create policy "shoes_images_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'shoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "shoes_images_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'shoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'shoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "shoes_images_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'shoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
