# Supabase Setup Instructions

## Enable Email Signups

To enable email signups in your Supabase project:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://rpujmhkplcwgynivyxsc.supabase.co
   - Or go to: https://supabase.com/dashboard

2. **Open Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers** tab

3. **Enable Email Provider**
   - Find **Email** in the list of providers
   - Toggle it **ON** (it should be enabled by default)
   - Make sure **Enable email signup** is checked

4. **Configure Email Settings (Optional)**
   - **Confirm email**: Toggle this based on whether you want users to verify their email
   - **Secure email change**: Enable this for security
   - **Email template**: Customize the email templates if needed

5. **Save Settings**
   - Click **Save** at the bottom of the page

## Alternative: Use Magic Link (Passwordless)

If you prefer passwordless authentication:

1. In **Authentication > Providers > Email**
2. Enable **Magic Link**
3. Users will receive a link to sign in without a password

## Enable OAuth Providers (Optional)

You can also enable social signups:

1. Go to **Authentication > Providers**
2. Enable providers like:
   - **Google**
   - **GitHub**
   - **Apple**
   - **Facebook**
   - etc.

3. Configure each provider with their API keys

## Test Email Signups

After enabling email signups:

1. Go to your app's signup page
2. Try creating an account
3. Check your email (or Supabase logs) for the verification email

## Troubleshooting

**If signups still don't work:**

1. Check **Authentication > Settings > Auth Providers**
2. Make sure **Email** is enabled
3. Check **Authentication > Settings > Email Auth** settings
4. Verify your email templates are configured
5. Check the Supabase logs for any errors

**Common Issues:**

- **"Email signups are disabled"**: Enable email provider in Authentication settings
- **"Invalid email"**: Check email format validation
- **"Email already registered"**: User already exists, try logging in instead
- **No verification email**: Check spam folder, verify email templates are set up

## Production Setup

For production:

1. **Configure SMTP** (if not using Supabase's default):
   - Go to **Settings > Auth > SMTP Settings**
   - Configure your own SMTP server
   - Or use Supabase's built-in email service

2. **Custom Email Templates**:
   - Go to **Authentication > Email Templates**
   - Customize the signup, password reset, and magic link emails

3. **Rate Limiting**:
   - Configure rate limits in **Authentication > Settings**
   - Prevent abuse and spam signups

