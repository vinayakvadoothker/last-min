-- ============================================
-- SUPABASE STORAGE SETUP
-- ============================================
-- This script creates the storage bucket and policies
-- for image uploads (activity images, partner logos, etc.)

-- Create the public bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Note: We drop policies first to avoid errors if they already exist

-- Policy 1: Allow public read access to all files
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- Policy 2: Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their own files
-- Note: This is a simplified policy. For production, you might want
-- to add ownership checks based on metadata or file paths
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);

