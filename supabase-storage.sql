-- Run in Supabase SQL Editor after supabase-catalog.sql
-- Creates a public bucket for admin-uploaded perfume images.

insert into storage.buckets (id, name, public)
values ('perfumes', 'perfumes', true)
on conflict (id) do update set public = true;

-- Allow public read access to perfume images
drop policy if exists "Public read perfume images" on storage.objects;
create policy "Public read perfume images"
on storage.objects for select
to public
using (bucket_id = 'perfumes');

-- Service role (used by the server API) bypasses RLS for uploads/deletes.
-- No extra write policy is required when using SUPABASE_SECRET_KEY server-side.
