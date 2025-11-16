# Last-Min Activities Marketplace - Complete Specification

## 1. Project Overview

### 1.1 Concept
A marketplace platform connecting activity providers (gyms, yoga studios, escape rooms, workshops, classes, events, etc.) with consumers looking for last-minute discounted activities. Similar to Too Good To Go but for experiences instead of food.

### 1.2 Core Value Proposition
- **For Consumers**: Discover and book discounted last-minute activities near them
- **For Providers**: Fill empty slots and reduce waste of unused capacity
- **For Society**: Reduce waste of unused resources and make activities more accessible

### 1.3 Key Differentiators
- Real-time availability updates
- Location-based discovery
- Time-sensitive pricing (cheaper closer to activity time)
- Instant booking with Apple Pay
- Surprise activity options (mystery experiences)

---

## 2. Technical Stack

### 2.1 Backend & Database
- **Supabase** (PostgreSQL database, Auth, Storage, Realtime)
- **Project URL**: `https://rpujmhkplcwgynivyxsc.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWptaGtwbGN3Z3luaXZ5eHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNjcyODQsImV4cCI6MjA3Nzk0MzI4NH0.ghB6tcP4fyTTQJ9aooIkqHc_fIzHa5CXpGWlFfGs11E`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWptaGtwbGN3Z3luaXZ5eHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2NzI4NCwiZXhwIjoyMDc3OTQzMjg0fQ.JopuqtBH5oKRFVNQ8rC9TaojfVTHx-_avalmuTDuzvw`

### 2.2 Frontend - **FULLY FUNCTIONAL, NO MOCKS**

**⚠️ CRITICAL REQUIREMENT: All features must be production-ready and fully functional. No mock data, no placeholder APIs, no simulated payments. Everything must work end-to-end with real services.**

#### Core Framework & Build Tools
- **Next.js 14+** (App Router) with TypeScript
  - Package: `next@latest`
  - TypeScript: `typescript@latest`, `@types/node`, `@types/react`, `@types/react-dom`
  - Build tool: Next.js built-in (Turbopack)

#### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
  - Package: `tailwindcss@latest`, `postcss@latest`, `autoprefixer@latest`
  - Config: `tailwind.config.ts`
- **shadcn/ui** - Component library (built on Radix UI)
  - Setup: `npx shadcn-ui@latest init`
  - Core packages: `@radix-ui/react-*` (dialog, dropdown, select, toast, etc.)
  - Icons: `lucide-react` (icon library)
  - Class utilities: `clsx`, `tailwind-merge`
  - Animation: `framer-motion` or `@radix-ui/react-animate`

#### State Management
- **React Hooks** (built-in state management)
- **Zustand** (for global state if needed)
  - Package: `zustand@latest`
- **React Query / TanStack Query** (server state, caching, real-time updates)
  - Package: `@tanstack/react-query@latest`

#### Supabase Client
- **@supabase/supabase-js** - Official Supabase client
  - Package: `@supabase/supabase-js@latest`
- **@supabase/ssr** - Server-side rendering support
  - Package: `@supabase/ssr@latest`
- **@supabase/auth-helpers-nextjs** (if needed for auth)

#### Maps & Location
- **Mapbox GL JS** - Interactive maps
  - Package: `mapbox-gl@latest`
  - React wrapper: `react-map-gl@latest`
  - Alternative: **Google Maps** via `@react-google-maps/api@latest`
  - **Geolocation API** (browser native) for user location

#### Payment Integration (REAL STRIPE + APPLE PAY)
- **@stripe/stripe-js** - Stripe.js for client-side
  - Package: `@stripe/stripe-js@latest`
- **stripe** - Stripe Node.js SDK for server-side
  - Package: `stripe@latest`
- **@stripe/react-stripe-js** - React components
  - Package: `@stripe/react-stripe-js@latest`
- **Apple Pay** - Native browser support via Stripe Payment Request API
  - No additional package needed (uses Stripe's Payment Request Button)

#### Forms & Validation
- **React Hook Form** - Form state management
  - Package: `react-hook-form@latest`
- **Zod** - Schema validation
  - Package: `zod@latest`
- **@hookform/resolvers** - Zod resolver for React Hook Form
  - Package: `@hookform/resolvers@latest`

#### Image Handling
- **next/image** - Next.js optimized images
- **react-dropzone** - Image upload component
  - Package: `react-dropzone@latest`
- **Supabase Storage** - Real image storage (no mocks)

#### QR Code
- **qrcode.react** - Generate QR codes
  - Package: `qrcode.react@latest`
- **html5-qrcode** - Scan QR codes via camera
  - Package: `html5-qrcode@latest`

#### Date & Time
- **date-fns** - Date manipulation
  - Package: `date-fns@latest`
- **react-day-picker** - Date picker component
  - Package: `react-day-picker@latest`

#### Real-time Features
- **Supabase Realtime** - Built into @supabase/supabase-js
  - Real-time subscriptions for activity updates, spot counts, etc.

#### Notifications
- **Web Push API** (browser native)
- **react-hot-toast** - In-app toast notifications
  - Package: `react-hot-toast@latest`
- **Resend** or **SendGrid** - Email notifications (real service)
  - Package: `resend@latest` or `@sendgrid/mail@latest`

#### PWA Support
- **next-pwa** - PWA plugin for Next.js
  - Package: `next-pwa@latest`
- **workbox** - Service worker (included with next-pwa)

#### Utilities
- **zod** - Already mentioned (validation)
- **date-fns** - Already mentioned (dates)
- **uuid** - Generate UUIDs if needed
  - Package: `uuid@latest`, `@types/uuid@latest`

#### Development Tools
- **ESLint** - Linting
  - Package: `eslint@latest`, `eslint-config-next@latest`
- **Prettier** - Code formatting
  - Package: `prettier@latest`, `prettier-plugin-tailwindcss@latest`

#### Testing (Optional but Recommended)
- **Vitest** - Unit testing
  - Package: `vitest@latest`, `@testing-library/react@latest`
- **Playwright** - E2E testing
  - Package: `@playwright/test@latest`

### Complete Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "@tanstack/react-query": "^5.17.0",
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "stripe": "^14.10.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "mapbox-gl": "^3.0.1",
    "react-map-gl": "^7.1.7",
    "html5-qrcode": "^2.3.8",
    "qrcode.react": "^3.1.0",
    "date-fns": "^3.0.6",
    "react-day-picker": "^8.10.0",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "framer-motion": "^11.0.5",
    "zustand": "^4.5.0",
    "resend": "^3.2.0",
    "next-pwa": "^5.6.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.5.11"
  }
}
```

**Why Web PWA First?**
- ✅ Faster to market (single codebase)
- ✅ Works on all devices (iOS, Android, Desktop)
- ✅ Easier to iterate and update
- ✅ Lower development cost
- ✅ Can be "installed" on home screen (feels like native app)
- ✅ Apple Pay works on web (Safari on iOS) - **REAL Apple Pay via Stripe**
- ✅ QR code scanning via camera API - **REAL camera access**
- ✅ Push notifications via Web Push API - **REAL push notifications**
- ✅ Location services via browser Geolocation API - **REAL GPS**

**Native Apps (Future Phase):**
- Better performance for complex animations
- Native UI components
- App store presence (better discoverability)
- Better push notification reliability
- Native QR scanner (faster)
- Can be built later when product-market fit is proven

### 2.3 Payment - **REAL STRIPE + APPLE PAY**
- **Stripe Account Required**: Must set up real Stripe account (test mode initially, then production)
- **Apple Pay**: Real Apple Pay integration via Stripe Payment Request API
  - Works on Safari (iOS/macOS) and Chrome (with Apple Pay enabled)
  - Real payment processing, no test mode in production
- **Stripe API**: Full integration with Stripe API
  - Payment Intents API for secure payments
  - Webhook handling for payment confirmations (real webhooks)
  - Refund processing (real refunds)
- **No Mock Payments**: All payment flows must use real Stripe test/production API

### 2.4 Additional Services - **ALL REAL SERVICES**
- **Email**: **Resend** (recommended) or **SendGrid** for transactional emails
  - Real email delivery (no mock emails)
  - Account setup required
  - Templates for: booking confirmations, reminders, cancellations
- **Push Notifications**: **Web Push API** (browser native)
  - Real push notifications (no mock notifications)
  - Service worker required
  - User permission required
- **Image Storage**: **Supabase Storage** (real cloud storage)
  - No local storage mocks
  - Real image uploads and CDN delivery
- **Maps**: **Mapbox** or **Google Maps** (real API keys required)
  - Real map rendering
  - Real geocoding and reverse geocoding
  - Real directions API
- **Analytics**: Optional - PostHog, Vercel Analytics, or similar
  - Real user tracking (if implemented)

### 2.5 **CRITICAL: NO MOCKS POLICY**

**Every feature must be fully functional with real services:**

✅ **Real Database**: Supabase PostgreSQL (not JSON files or in-memory data)  
✅ **Real Authentication**: Supabase Auth (not mock auth)  
✅ **Real Payments**: Stripe API (not fake payment buttons)  
✅ **Real Apple Pay**: Stripe Payment Request API (not simulated)  
✅ **Real Maps**: Mapbox/Google Maps API (not static images)  
✅ **Real Location**: Browser Geolocation API (not hardcoded coordinates)  
✅ **Real Images**: Supabase Storage (not placeholder images)  
✅ **Real QR Codes**: Generated and scannable (not static images)  
✅ **Real Email**: Resend/SendGrid (not console.log emails)  
✅ **Real Push Notifications**: Web Push API (not in-app only)  
✅ **Real-time Updates**: Supabase Realtime (not polling)  
✅ **Real File Uploads**: Supabase Storage (not base64 in database)

**Implementation Checklist:**
- [ ] All API endpoints connect to real Supabase database
- [ ] All payments go through real Stripe API
- [ ] All images stored in real Supabase Storage
- [ ] All emails sent via real email service
- [ ] All maps use real Mapbox/Google Maps API
- [ ] All location data from real browser Geolocation API
- [ ] All QR codes are generated and scannable
- [ ] All real-time features use Supabase Realtime subscriptions
- [ ] All webhooks are configured and functional
- [ ] All environment variables are set with real API keys

---

## 3. Database Schema

### 3.1 Core Tables

#### `profiles` (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'consumer' CHECK (role IN ('consumer', 'provider', 'admin')),
  -- Consumer fields
  favorite_categories TEXT[],
  saved_providers UUID[],
  -- Provider fields
  business_name TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verified ON profiles(verified) WHERE role = 'provider';
```

#### `providers` (activity providers)
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'fitness', 'wellness', 'entertainment', 'education', 'arts', 'sports', etc.
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_category ON providers(category);
CREATE INDEX idx_providers_location ON providers(latitude, longitude);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_providers_active ON providers(active) WHERE active = TRUE;
CREATE INDEX idx_providers_verified ON providers(verified) WHERE verified = TRUE;
```

#### `activities` (individual activity listings)
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT, -- 'yoga', 'pilates', 'boxing', 'escape-room', etc.
  image_urls TEXT[],
  duration_minutes INTEGER, -- activity duration
  max_participants INTEGER,
  min_participants INTEGER DEFAULT 1,
  regular_price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2) NOT NULL, -- current discounted price
  original_price DECIMAL(10,2), -- original full price
  discount_percentage INTEGER, -- calculated discount %
  -- Time fields
  activity_start_time TIMESTAMPTZ NOT NULL,
  activity_end_time TIMESTAMPTZ NOT NULL,
  booking_deadline TIMESTAMPTZ NOT NULL, -- last time to book
  -- Availability
  available_spots INTEGER NOT NULL,
  total_spots INTEGER NOT NULL,
  is_surprise BOOLEAN DEFAULT FALSE, -- mystery activity
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold_out', 'cancelled', 'completed')),
  -- Metadata
  tags TEXT[],
  requirements TEXT, -- age restrictions, skill level, etc.
  equipment_needed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_provider ON activities(provider_id);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_start_time ON activities(activity_start_time);
CREATE INDEX idx_activities_status ON activities(status) WHERE status = 'active';
CREATE INDEX idx_activities_deadline ON activities(booking_deadline) WHERE status = 'active';
CREATE INDEX idx_activities_location ON activities USING GIST (
  (SELECT point(providers.longitude, providers.latitude) 
   FROM providers WHERE providers.id = activities.provider_id)
);
```

#### `bookings` (user bookings)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE RESTRICT,
  provider_id UUID REFERENCES providers(id) ON DELETE RESTRICT,
  -- Booking details
  number_of_spots INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  price_per_spot DECIMAL(10,2) NOT NULL,
  -- Payment
  payment_intent_id TEXT, -- Stripe payment intent ID
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT, -- 'apple_pay', 'card', etc.
  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  -- Timestamps
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  -- Check-in
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  qr_code TEXT, -- unique QR code for check-in
  -- Metadata
  cancellation_reason TEXT,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_activity ON bookings(activity_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_qr_code ON bookings(qr_code);
```

#### `reviews` (user reviews)
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[],
  -- Review metadata
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id) -- one review per booking
);

CREATE INDEX idx_reviews_activity ON reviews(activity_id);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
```

#### `favorites` (saved activities/providers)
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_id),
  UNIQUE(user_id, provider_id),
  CHECK (
    (activity_id IS NOT NULL AND provider_id IS NULL) OR
    (activity_id IS NULL AND provider_id IS NOT NULL)
  )
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_activity ON favorites(activity_id);
CREATE INDEX idx_favorites_provider ON favorites(provider_id);
```

#### `notifications` (in-app notifications)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_activity', 'booking_confirmed', 'reminder', 'cancelled', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- additional data (activity_id, booking_id, etc.)
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### `categories` (activity categories)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT, -- icon name or URL
  description TEXT,
  color TEXT, -- hex color for UI
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(active) WHERE active = TRUE;
```

### 3.2 Row Level Security (RLS) Policies

#### Profiles
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Providers
```sql
-- Anyone can view active providers
CREATE POLICY "Anyone can view active providers" ON providers
  FOR SELECT USING (active = TRUE);

-- Providers can manage their own provider profile
CREATE POLICY "Providers can manage own profile" ON providers
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### Activities
```sql
-- Anyone can view active activities
CREATE POLICY "Anyone can view active activities" ON activities
  FOR SELECT USING (status = 'active' AND booking_deadline > NOW());

-- Providers can manage their own activities
CREATE POLICY "Providers can manage own activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM providers 
      WHERE providers.id = activities.provider_id 
      AND providers.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### Bookings
```sql
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Providers can view bookings for their activities
CREATE POLICY "Providers can view their bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM providers 
      WHERE providers.id = bookings.provider_id 
      AND providers.user_id = auth.uid()
    )
  );

-- Users can create their own bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (cancel)
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Reviews
```sql
-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (TRUE);

-- Users can create reviews for their bookings
CREATE POLICY "Users can create own reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = reviews.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3.3 Database Functions & Triggers

#### Update activity status based on availability
```sql
CREATE OR REPLACE FUNCTION update_activity_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update activity status based on available spots
  UPDATE activities
  SET status = CASE
    WHEN available_spots <= 0 THEN 'sold_out'
    WHEN booking_deadline < NOW() THEN 'sold_out'
    WHEN activity_start_time < NOW() THEN 'completed'
    ELSE 'active'
  END,
  updated_at = NOW()
  WHERE id = NEW.activity_id OR id = OLD.activity_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_activity_status
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_status();
```

#### Update provider ratings
```sql
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE providers
  SET 
    rating_average = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = NEW.provider_id
    )
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating();
```

#### Generate QR codes for bookings
```sql
CREATE OR REPLACE FUNCTION generate_booking_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_qr_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_qr_code();
```

#### Update activity available spots on booking
```sql
CREATE OR REPLACE FUNCTION update_activity_spots()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE activities
    SET available_spots = available_spots - NEW.number_of_spots,
        updated_at = NOW()
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle cancellation
    IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
      UPDATE activities
      SET available_spots = available_spots + OLD.number_of_spots,
          updated_at = NOW()
      WHERE id = NEW.activity_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_activity_spots
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_spots();
```

---

## 4. API Endpoints & Business Logic

### 4.1 Authentication Endpoints (Supabase Auth)
- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/token` - Login
- `POST /auth/v1/logout` - Logout
- `POST /auth/v1/recover` - Password reset
- `GET /auth/v1/user` - Get current user

### 4.2 Activity Discovery Endpoints

#### `GET /rest/v1/activities`
**Query Parameters:**
- `latitude` (decimal): User's latitude
- `longitude` (decimal): User's longitude
- `radius` (integer, default: 10km): Search radius
- `category` (string): Filter by category
- `min_price` (decimal): Minimum price filter
- `max_price` (decimal): Maximum price filter
- `date_from` (timestamp): Start date filter
- `date_to` (timestamp): End date filter
- `surprise_only` (boolean): Only surprise activities
- `sort` (string): 'distance', 'price', 'time', 'rating'
- `limit` (integer, default: 20)
- `offset` (integer, default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Evening Yoga Class",
      "description": "...",
      "category": "wellness",
      "provider": {
        "id": "uuid",
        "name": "Zen Yoga Studio",
        "rating_average": 4.5,
        "distance_km": 2.3
      },
      "regular_price": 30.00,
      "discount_price": 12.00,
      "discount_percentage": 60,
      "activity_start_time": "2024-01-15T18:00:00Z",
      "activity_end_time": "2024-01-15T19:00:00Z",
      "booking_deadline": "2024-01-15T17:30:00Z",
      "available_spots": 5,
      "total_spots": 20,
      "image_urls": ["..."],
      "is_surprise": false
    }
  ],
  "count": 50
}
```

#### `GET /rest/v1/activities/:id`
Get single activity details with full provider info.

#### `GET /rest/v1/categories`
Get all active categories with subcategories.

### 4.3 Booking Endpoints

#### `POST /rest/v1/bookings`
**Request Body:**
```json
{
  "activity_id": "uuid",
  "number_of_spots": 2,
  "payment_intent_id": "pi_xxx" // from Stripe
}
```

**Business Logic:**
1. Verify activity is available (status = 'active', spots available, deadline not passed)
2. Check available_spots >= number_of_spots
3. Calculate total_price = discount_price * number_of_spots
4. Create booking with status 'pending'
5. Update activity available_spots (via trigger)
6. Return booking with QR code

#### `GET /rest/v1/bookings`
Get user's bookings (filtered by RLS).

**Query Parameters:**
- `status`: Filter by status
- `upcoming`: Boolean, only upcoming bookings

#### `GET /rest/v1/bookings/:id`
Get single booking details.

#### `PATCH /rest/v1/bookings/:id`
Cancel a booking.

**Request Body:**
```json
{
  "status": "cancelled",
  "cancellation_reason": "Changed plans"
}
```

**Business Logic:**
1. Check booking can be cancelled (not started, within cancellation window)
2. Update booking status
3. Refund via Stripe if paid
4. Update activity available_spots

### 4.4 Provider Endpoints

#### `GET /rest/v1/providers/:id`
Get provider details with activities.

#### `GET /rest/v1/providers/:id/activities`
Get all activities for a provider.

#### `POST /rest/v1/activities` (Provider only)
Create new activity listing.

**Request Body:**
```json
{
  "title": "Morning Pilates",
  "description": "...",
  "category": "fitness",
  "subcategory": "pilates",
  "regular_price": 25.00,
  "discount_price": 10.00,
  "activity_start_time": "2024-01-16T09:00:00Z",
  "activity_end_time": "2024-01-16T10:00:00Z",
  "booking_deadline": "2024-01-16T08:30:00Z",
  "total_spots": 15,
  "max_participants": 1,
  "min_participants": 1,
  "duration_minutes": 60,
  "image_urls": ["..."],
  "tags": ["beginner-friendly", "mat-based"]
}
```

#### `PATCH /rest/v1/activities/:id` (Provider only)
Update activity (price, spots, etc.).

#### `DELETE /rest/v1/activities/:id` (Provider only)
Cancel/delete activity.

### 4.5 Review Endpoints

#### `POST /rest/v1/reviews`
Create review for a completed booking.

**Request Body:**
```json
{
  "booking_id": "uuid",
  "rating": 5,
  "title": "Amazing experience!",
  "comment": "...",
  "images": ["..."]
}
```

#### `GET /rest/v1/activities/:id/reviews`
Get reviews for an activity.

### 4.6 Payment Endpoints

#### `POST /api/payments/create-intent`
Create Stripe payment intent for Apple Pay.

**Request Body:**
```json
{
  "activity_id": "uuid",
  "number_of_spots": 2
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 2400, // in cents
  "currency": "usd"
}
```

#### `POST /api/payments/confirm`
Confirm payment and create booking.

**Request Body:**
```json
{
  "payment_intent_id": "pi_xxx",
  "activity_id": "uuid",
  "number_of_spots": 2
}
```

#### `POST /api/payments/webhook`
Stripe webhook handler for payment events.

### 4.7 Search & Filter Endpoints

#### `GET /rest/v1/activities/search`
Full-text search on activities.

**Query Parameters:**
- `q`: Search query
- `filters`: JSON object with filters

---

## 5. Frontend Features & Pages

### 5.1 Consumer App Pages

#### Home/Discovery Page
- **Map View**: Interactive map showing nearby activities
- **List View**: Scrollable list of activities
- **Filters**: Category, price range, distance, time, surprise toggle
- **Search Bar**: Search by name, category, location
- **Sort Options**: Distance, price (low to high), time (soonest first), rating

**Components:**
- `ActivityCard`: Shows image, title, provider, price, discount, time, spots left
- `MapView`: Mapbox/Google Maps with activity markers
- `FilterPanel`: Sidebar or modal with filters
- `CategoryPills`: Quick filter by category

#### Activity Detail Page
- Full activity information
- Provider details and rating
- Image gallery
- Booking form (select number of spots)
- Apple Pay button
- Similar activities
- Reviews section
- Share button

**Components:**
- `ActivityHeader`: Image, title, provider
- `BookingCard`: Price breakdown, spot selector, Apple Pay button
- `ProviderInfo`: Provider details, map, contact
- `ReviewList`: Reviews with ratings
- `SimilarActivities`: Recommendations

#### Booking Confirmation Page
- Booking details
- QR code for check-in
- Calendar add button
- Directions button
- Cancel booking option

#### My Bookings Page
- Upcoming bookings
- Past bookings
- Cancelled bookings
- Filter tabs
- Each booking shows: Activity, date/time, status, QR code, actions

#### Profile Page
- User information
- Favorite activities/providers
- Booking history
- Reviews written
- Settings

#### Provider Dashboard (Web)
- Dashboard overview (bookings, revenue, ratings)
- Activity management (create, edit, delete)
- Booking management (view, check-in via QR scanner)
- Analytics (views, bookings, revenue)
- Provider profile settings

### 5.2 Key UI/UX Features

#### Real-time Updates
- Use Supabase Realtime subscriptions to update:
  - Available spots count
  - New activities
  - Booking status changes

#### Push Notifications
- New activities matching preferences
- Booking confirmations
- Reminders (1 hour before activity)
- Cancellation notifications
- Special offers

#### Location Services
- Request location permission
- Show distance to activities
- Directions integration
- "Near me" filter

#### Apple Pay Integration
- Native Apple Pay button
- One-tap checkout
- Secure payment processing

#### QR Code Check-in
- Generate QR code on booking
- Provider scans QR code to check in
- Mark booking as checked_in

---

## 6. Implementation Steps - **ALL WITH REAL INTEGRATIONS**

**⚠️ Each phase must be fully functional with real services. No phase is complete until all integrations are working with real APIs.**

### Phase 1: Setup & Core Infrastructure
1. **Initialize Next.js project**
   - Set up TypeScript
   - Configure Tailwind CSS
   - Install all dependencies from package.json
   - Set up Supabase client with **real Supabase credentials**
   - Configure **real environment variables** (all API keys)
   - Set up shadcn/ui components

2. **Database Setup (Real Supabase Database)**
   - Create all tables in **real Supabase SQL Editor**
   - Set up RLS policies (test with real queries)
   - Create database functions and triggers (verify they work)
   - Seed categories data (real data in database)
   - Create storage bucket for images (real Supabase Storage)

3. **Authentication (Real Supabase Auth)**
   - Configure Supabase Auth with **real project**
   - Build Login/Signup pages (test with real user creation)
   - Implement protected routes (verify auth works)
   - User profile creation (real profiles in database)
   - Test email verification (real emails sent)

### Phase 2: Core Features
4. **Activity Discovery (Real Data & Maps)**
   - Activity listing page (fetch from **real Supabase database**)
   - Activity detail page (real activity data)
   - Search and filters (real database queries)
   - **Real Mapbox/Google Maps integration** (real map rendering)
   - **Real browser Geolocation API** (get user's real location)
   - Distance calculations (real coordinates)

5. **Booking System (Real Stripe + Apple Pay)**
   - Booking creation (save to **real database**)
   - **Real Stripe Payment Intent creation** (test mode initially)
   - **Real Apple Pay integration** via Stripe Payment Request API
   - Payment confirmation (real Stripe webhook handling)
   - **Real QR code generation** (scannable codes)
   - Update activity spots (real database updates)

6. **User Dashboard (Real Data)**
   - My bookings page (fetch from **real database**)
   - Profile page (real user data)
   - Favorites (real database operations)
   - Image uploads to **real Supabase Storage**

### Phase 3: Provider Features
7. **Provider Dashboard (Real Functionality)**
   - Provider registration flow (real profile creation)
   - Activity creation form (save to **real database**)
   - Activity management (real CRUD operations)
   - Booking management (real booking data)
   - **Real QR code scanner** (html5-qrcode with camera access)
   - Check-in functionality (real database updates)

### Phase 4: Advanced Features
8. **Reviews & Ratings (Real Data)**
   - Review creation (save to **real database**)
   - Review display (real reviews from database)
   - Rating aggregation (real calculations via database triggers)
   - Image uploads for reviews (real Supabase Storage)

9. **Notifications (Real Services)**
   - In-app notifications (real database notifications table)
   - **Real email notifications** via Resend/SendGrid (test sending)
   - **Real push notifications** via Web Push API (test on device)
   - Service worker setup for PWA

10. **Real-time Updates (Real Supabase Realtime)**
    - **Real Supabase Realtime subscriptions** (not polling)
    - Live spot count updates (test with multiple users)
    - New activity notifications (real-time)
    - Booking status updates (real-time)

### Phase 5: Polish & Optimization
11. **Performance (Real Optimizations)**
    - Image optimization (Next.js Image with real Supabase URLs)
    - Caching strategies (real caching, not mocks)
    - Lazy loading (real code splitting)
    - PWA manifest and service worker (real offline support)

12. **Analytics (Optional - Real if Implemented)**
    - User behavior tracking (real analytics service or skip)
    - Conversion tracking (real events)
    - Provider analytics (real data aggregation)

13. **Testing (Real Integration Tests)**
    - Unit tests (test real functions)
    - Integration tests (test real API calls to Supabase/Stripe)
    - E2E tests (test real user flows with real services)

---

## 7. Environment Variables - **ALL REAL API KEYS REQUIRED**

**⚠️ All environment variables must contain real API keys from actual service accounts. No placeholder values allowed in production.**

### Required Environment Variables

```env
# ============================================
# SUPABASE (Already Provided)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://rpujmhkplcwgynivyxsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWptaGtwbGN3Z3luaXZ5eHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNjcyODQsImV4cCI6MjA3Nzk0MzI4NH0.ghB6tcP4fyTTQJ9aooIkqHc_fIzHa5CXpGWlFfGs11E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWptaGtwbGN3Z3luaXZ5eHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2NzI4NCwiZXhwIjoyMDc3OTQzMjg0fQ.JopuqtBH5oKRFVNQ8rC9TaojfVTHx-_avalmuTDuzvw

# ============================================
# STRIPE (REQUIRED - Must create real account)
# ============================================
# Get from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51... # Real Stripe publishable key
STRIPE_SECRET_KEY=sk_test_51... # Real Stripe secret key (server-side only)
STRIPE_WEBHOOK_SECRET=whsec_... # Real webhook secret from Stripe dashboard

# ============================================
# MAPS (REQUIRED - Choose one)
# ============================================
# Option 1: Mapbox (Recommended)
# Get from: https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1... # Real Mapbox access token

# Option 2: Google Maps
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza... # Real Google Maps API key
# Get from: https://console.cloud.google.com/google/maps-apis

# ============================================
# EMAIL SERVICE (REQUIRED - Choose one)
# ============================================
# Option 1: Resend (Recommended)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_... # Real Resend API key

# Option 2: SendGrid
# SENDGRID_API_KEY=SG.... # Real SendGrid API key
# Get from: https://app.sendgrid.com/settings/api_keys

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Development
# NEXT_PUBLIC_APP_URL=https://yourdomain.com # Production

# ============================================
# OPTIONAL: ANALYTICS
# ============================================
# NEXT_PUBLIC_POSTHOG_KEY=phc_... # If using PostHog
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Setup Instructions for Real API Keys

1. **Stripe Account Setup**
   - Create account at https://stripe.com
   - Get test API keys from Dashboard → Developers → API keys
   - Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Get webhook signing secret from webhook settings
   - Enable Apple Pay in Stripe Dashboard → Settings → Payment methods

2. **Mapbox Account Setup**
   - Create account at https://account.mapbox.com
   - Create access token with public scope
   - Add token to environment variables

3. **Resend Account Setup**
   - Create account at https://resend.com
   - Generate API key
   - Verify domain (for production)
   - Add API key to environment variables

4. **Supabase Storage Setup**
   - Already configured with your Supabase project
   - Create storage bucket: `activity-images`
   - Set up RLS policies for public read, authenticated write

### Environment File Structure

Create `.env.local` for local development:
```bash
# Copy from above and fill in real values
```

Create `.env.production` for production (set in Vercel dashboard):
```bash
# Use production API keys (Stripe live keys, production URLs, etc.)
```

---

## 8. Key Business Rules

### 8.1 Pricing
- Discount price must be less than regular price
- Minimum discount: 20%
- Dynamic pricing: Can increase discount as deadline approaches

### 8.2 Booking Rules
- Cannot book past booking deadline
- Cannot book more spots than available
- Minimum 1 spot per booking
- Maximum spots per booking: activity's max_participants

### 8.3 Cancellation Policy
- Users can cancel up to 2 hours before activity start
- Automatic refund if cancelled within policy
- Provider can cancel (full refund + notification)

### 8.4 Activity Status
- `draft`: Provider created but not published
- `active`: Available for booking
- `sold_out`: No spots available or deadline passed
- `cancelled`: Provider cancelled
- `completed`: Activity time has passed

### 8.5 Check-in
- QR code valid only for that specific booking
- Can check in up to 15 minutes before start time
- Can check in up to 30 minutes after start time
- After 30 minutes = no-show (no refund)

---

## 9. Security Considerations

1. **RLS Policies**: All tables protected by Row Level Security
2. **API Keys**: Never expose service role key in client
3. **Payment Security**: All payments through Stripe (PCI compliant)
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Prevent abuse on booking endpoints
6. **CORS**: Configure properly for production
7. **HTTPS**: Required for production

---

## 10. Testing Checklist

### Unit Tests
- [ ] Activity filtering logic
- [ ] Price calculations
- [ ] Booking availability checks
- [ ] Distance calculations
- [ ] QR code generation

### Integration Tests
- [ ] Booking flow (create → payment → confirm)
- [ ] Cancellation flow
- [ ] Review creation
- [ ] Provider activity creation

### E2E Tests
- [ ] Complete user journey (discover → book → attend)
- [ ] Provider journey (create activity → manage bookings)
- [ ] Payment flow
- [ ] Check-in flow

---

## 11. Deployment

### Recommended Stack
- **Hosting**: Vercel (Next.js optimized)
- **Database**: Supabase (already set up)
- **Storage**: Supabase Storage
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry

### PWA Configuration
- **Manifest File**: `public/manifest.json` for installability
- **Service Worker**: Next.js PWA plugin for offline support
- **HTTPS Required**: Vercel provides SSL by default
- **Icons**: Generate app icons (192x192, 512x512) for home screen
- **Apple Touch Icons**: For iOS home screen installation

### Deployment Steps
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Configure PWA manifest and service worker
4. Deploy (automatic on git push)
5. Configure custom domain
6. Set up monitoring
7. Test PWA installation on iOS/Android devices

---

## 12. Future Enhancements

1. **Mobile Apps**: React Native apps for iOS/Android
2. **Group Bookings**: Book for multiple people
3. **Waitlist**: Join waitlist for sold-out activities
4. **Loyalty Program**: Points and rewards
5. **Referral System**: Refer friends, get credits
6. **Social Features**: Share activities, see friends' bookings
7. **AI Recommendations**: Personalized activity suggestions
8. **Multi-language**: i18n support
9. **Advanced Analytics**: Provider insights dashboard
10. **Subscription Model**: Monthly passes for providers

---

## 13. Success Metrics

- **User Metrics**: DAU, MAU, retention rate
- **Booking Metrics**: Conversion rate, average booking value
- **Provider Metrics**: Activities listed, fill rate, revenue
- **Engagement**: Time in app, searches per session
- **Business**: GMV (Gross Merchandise Value), take rate

---

This specification provides a complete blueprint for building the Last-Min Activities Marketplace. Follow the phases sequentially, and refer back to this document for implementation details.
