# Last-Min Activities Marketplace

A full-stack marketplace platform connecting activity providers with consumers looking for last-minute discounted activities. Built with Next.js, Supabase, and Stripe.

## Features

- ✅ User authentication (signup, login, protected routes)
- ✅ Activity discovery with location-based search
- ✅ Real-time activity listings
- ✅ Booking system with Stripe + Apple Pay
- ✅ QR code check-in system
- ✅ User dashboard (bookings, profile)
- ✅ Responsive design (mobile-first)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Payments**: Stripe (with Apple Pay support)
- **Maps**: Leaflet (via shadcn Map component)
- **Email**: Resend

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all the required API keys:

```bash
cp .env.local.example .env.local
```

**Required API Keys:**
- ✅ Supabase (already provided)
- ✅ Stripe (already provided in .env.local)
- ✅ Resend (already provided in .env.local)
- ⚠️ Stripe Webhook Secret - Optional (only needed for production webhook verification)

### 3. Set Up Supabase Database

1. Go to your Supabase project: https://rpujmhkplcwgynivyxsc.supabase.co
2. Navigate to SQL Editor
3. Run the SQL from `supabase/schema.sql`
4. Create a storage bucket named `activity-images` with public read access

### 4. Set Up Stripe Webhook (Optional)

1. Stripe keys are already configured in `.env.local`
2. Webhook secret is optional - the webhook handler works without it
3. For production with signature verification, set up webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Get webhook secret and add to `.env.local` as `STRIPE_WEBHOOK_SECRET` (optional)

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:6060](http://localhost:6060) in your browser.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── activities/         # Activity pages
│   ├── bookings/           # User bookings
│   ├── profile/            # User profile
│   ├── login/              # Authentication
│   ├── signup/
│   └── api/                # API routes
│       ├── payments/       # Stripe payment endpoints
│       ├── bookings/       # Booking endpoints
│       └── webhooks/       # Stripe webhooks
├── components/             # React components
│   ├── ui/                 # UI components (shadcn/ui)
│   └── ...                 # Feature components
├── lib/                    # Utilities
│   ├── supabase/           # Supabase clients
│   ├── stripe.ts           # Stripe client
│   └── utils.ts             # Helper functions
└── supabase/               # Database schema
    └── schema.sql          # SQL schema file
```

## Key Features Implementation

### Authentication
- Supabase Auth with email/password
- Protected routes via middleware
- Automatic profile creation on signup

### Activities
- Real-time listings from Supabase
- Location-based filtering
- Distance calculation
- Image support via Supabase Storage

### Bookings
- Stripe Payment Intents
- Apple Pay support (via Stripe)
- QR code generation for check-in
- Real-time spot count updates

### Payments
- Secure payment processing via Stripe
- Webhook handling for payment confirmations
- Refund support

## Development

### Adding New Features

1. Create database tables in `supabase/schema.sql`
2. Add RLS policies for security
3. Create API routes in `app/api/`
4. Build UI components in `components/`
5. Add pages in `app/`

### Database Migrations

Run SQL migrations directly in Supabase SQL Editor. The schema file contains all table definitions, functions, triggers, and RLS policies.

## Production Deployment

1. Set up production environment variables in Vercel
2. Run database schema in production Supabase
3. Configure Stripe webhooks for production
4. Set up domain and SSL
5. Deploy to Vercel: `vercel deploy`

## Important Notes

⚠️ **All features use real services - no mocks!**
- Real Supabase database
- Real Stripe payments
- Real Mapbox maps
- Real email delivery

Make sure all API keys are set before running the application.

## License

MIT

