-- Run in Supabase SQL Editor after supabase-catalog.sql
-- Creates a public bucket for admin-uploaded perfume images.

insert into storage.buckets (id, name, public)
values ('perfumes', 'perfumes', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read perfume images" on storage.objects;
create policy "Public read perfume images"
on storage.objects for select
to public
using (bucket_id = 'perfumes');

-- Service role (used by the server API) bypasses RLS for uploads/deletes.
