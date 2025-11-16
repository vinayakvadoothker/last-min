-- Add location field to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8);

-- Add index for location searches
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(location_latitude, location_longitude) 
WHERE location_latitude IS NOT NULL AND location_longitude IS NOT NULL;

