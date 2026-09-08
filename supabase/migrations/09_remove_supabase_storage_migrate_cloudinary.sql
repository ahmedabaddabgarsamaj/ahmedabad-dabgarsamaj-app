-- ============================================================================
-- MIGRATION 09: REMOVE SUPABASE STORAGE BUCKET & MIGRATE TO CLOUDINARY
-- ============================================================================
-- Member photos are now stored directly on Cloudinary Global CDN.
-- This script removes the legacy 'member-photos' storage bucket and its policies.

-- 1. Drop old Supabase storage policies
DROP POLICY IF EXISTS "Public can view member photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow photo uploads in member-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow photo updates in member-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow photo deletes in member-photos" ON storage.objects;

-- 2. Delete all legacy photo objects from Supabase storage
DELETE FROM storage.objects WHERE bucket_id = 'member-photos';

-- 3. Delete the storage bucket itself
DELETE FROM storage.buckets WHERE id = 'member-photos';

-- 4. (Optional) Uncomment to reset old broken Supabase photo URLs in database:
-- UPDATE public.family_members SET photo_url = NULL WHERE photo_url LIKE '%supabase.co/storage%';
-- UPDATE public.family_members SET photo_url = NULL WHERE photo_url LIKE 'file://%';
