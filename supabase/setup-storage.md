# Supabase Storage Setup

## Create Storage Buckets

You need to create storage buckets in your Supabase project for image uploads.

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://rpujmhkplcwgynivyxsc.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create a bucket named `public` with the following settings:
   - **Name**: `public`
   - **Public bucket**: ✅ Enabled (check this box)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or leave empty for all types)

5. After creating the bucket, set up the storage policies:

### Storage Policies

Go to **Storage** → **Policies** → Select the `public` bucket, then create these policies:

#### Policy 1: Allow public read access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');
```

#### Policy 2: Allow authenticated users to upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Allow authenticated users to update their own files
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 4: Allow authenticated users to delete their own files
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);
```

### Option 2: Via SQL (Alternative)

You can also create the bucket via SQL in the SQL Editor:

```sql
-- Create the public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies (run these after creating the bucket)
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);
```

## Verify Setup

After creating the bucket and policies, try uploading an image again. The upload should work now.

