# Google OAuth Setup

## 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application** as the application type
6. Set the following:
   - **Authorized JavaScript origins**: Add your app's origin (e.g. `https://yourapp.com`)
   - **Authorized redirect URIs**: Add your Supabase callback URL:
     ```
     https://<your-supabase-project>.supabase.co/auth/v1/callback
     ```
7. Click **Create** and note the **Client ID** and **Client Secret**

## 2. Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Google** and enable it
5. Paste the **Client ID** and **Client Secret** from Google Cloud Console
6. The **Callback URL (for OAuth)** shown in Supabase must match the redirect URI configured in Google Cloud Console:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```

## 3. Local Development

For local development, add the following to your Google Cloud Console OAuth client:

- **Authorized JavaScript origins**:
  - `http://localhost:5173` (or whichever port your dev server uses)
- **Authorized redirect URIs**:
  - The Supabase callback URL remains the same (it redirects back to your app after auth)

No additional environment variables are needed. The existing Supabase client configuration (`supabaseUrl` and `supabaseAnonKey`) handles OAuth automatically.

## 4. Environment

No new environment variables are required. The Supabase client is already configured with the project URL and anon key, which is sufficient for OAuth flows. The `signInWithGoogle` function uses `window.location.origin` as the `redirectTo` URL, so Supabase redirects back to whichever host the app is running on.
