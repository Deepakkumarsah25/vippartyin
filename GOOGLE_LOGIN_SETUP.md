# Enable Google sign-in

The Google sign-in integration is already wired into `/login`. It requires a Google OAuth **Web application client ID**; the current local `.env` does not contain `GOOGLE_CLIENT_ID`, so the button cannot complete sign-in yet.

## Create the client ID

1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) and select or create a project.
2. Configure the Google Auth Platform consent screen and app branding for the project.
3. Create an OAuth client with application type **Web application**.
4. Add each site origin under **Authorized JavaScript origins**. For local development, use the origin matching your app, for example `http://localhost:3000`. For production, add the full HTTPS origin such as `https://example.com`. Origins contain scheme, hostname and optional port only—no route/path.
5. Copy the client ID (ending in `.apps.googleusercontent.com`) into the root `vippartyin/.env`:

   ```dotenv
   GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   AUTH_SESSION_SECRET=replace-with-a-long-random-secret
   ```

6. Restart the Node server, reload `/login`, and try Google sign-in again.

This integration uses Google Identity Services' popup callback, so it does not need an authorized redirect URI. The client ID is okay to expose to the browser; do not put a client secret in frontend code. See Google's [client ID setup guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

## Profile photos and MongoDB profile data

Profile photos upload from the server to Cloudinary. The returned `secure_url` is stored in the logged-in user's `photoURL` field in MongoDB together with name, email, mobile, address, district and state. Add these server-only values to the root `.env` using the Cloudinary Dashboard values:

```dotenv
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Restart the Node server after saving the values. Keep `CLOUDINARY_API_SECRET` private and never add it to browser code or share it in chat. Profile uploads accept JPG, PNG and WebP up to 5 MB. Other profile fields can be saved without Cloudinary; uploading a photo requires these three settings.
