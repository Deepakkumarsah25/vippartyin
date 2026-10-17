# Enable Google sign-in

The Google sign-in integration is already wired into `/login`. Google sign-in is not restricted to a particular email address in this application. If it works for the project owner but not for other people, first check the OAuth app's audience and publishing status in Google Cloud Console.

## Create the client ID

1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) and select or create a project.
2. In **Google Auth Platform → Audience**, set the audience to **External** if people outside your Google Workspace organization should sign in. An **Internal** app only allows accounts in that Workspace/Cloud Identity organization.
3. While the app's publishing status is **Testing**, only Google accounts listed under **Test users** can sign in. To let anyone with a Google Account sign in, change the publishing status to **In production** (publish the app). Google documents that Testing is limited to listed test users, while In production is available to any Google Account: [Manage app audience](https://support.google.com/cloud/answer/15549945?hl=en).
4. Complete the app name, support email, developer contact details, and any verification steps Google requires for your requested scopes. This integration requests basic sign-in identity (email/profile); do not add extra scopes unless needed.
5. Create an OAuth client with application type **Web application**.
6. Add every site origin under **Authorized JavaScript origins**. For local development, use the origin matching your app, for example `http://localhost:3000`. For production, add the full HTTPS origin such as `https://example.com`. Origins contain scheme, hostname and optional port only—no route/path. Also add the production domain in the OAuth app's authorized domains/branding configuration if Google asks for it.
7. Set the same Web client ID in the server environment for the environment being used (local `.env`, hosting provider's production environment variables):

   ```dotenv
   GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   AUTH_SESSION_SECRET=replace-with-a-long-random-secret
   ```

8. Restart/redeploy the Node server after changing its environment variables, then reload `/login` and try again.

### When only your account works

- Open **Google Auth Platform → Audience** and check **Publishing status**. If it says **Testing**, either add each account to **Test users** for temporary testing or publish the app (**In production**) for public sign-in.
- Confirm **User type/Audience** is **External** for a public site. **Internal** only accepts accounts in your organization.
- Confirm the account is signing in through the same website origin that you registered, and that local/production servers use the intended OAuth Web client ID.
- If Google shows an `access_denied`, test-user, or unverified-app screen, follow the status and verification requirements shown in Google Cloud Console. Publishing makes the app available to Google Accounts; it does not bypass Google's policy or verification requirements.
- The server checks that Google's credential audience matches `GOOGLE_CLIENT_ID` and that the email is verified. There is no account-specific allowlist in `/auth/google`.

This integration uses Google Identity Services' popup callback, so it does not need an authorized redirect URI. The client ID is okay to expose to the browser; do not put a client secret in frontend code. See Google's [client ID setup guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

## Profile photos and MongoDB profile data

Profile photos upload from the server to Cloudinary. The returned `secure_url` is stored in the logged-in user's `photoURL` field in MongoDB together with name, email, mobile, address, district and state. Add these server-only values to the root `.env` using the Cloudinary Dashboard values:

```dotenv
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Restart the Node server after saving the values. Keep `CLOUDINARY_API_SECRET` private and never add it to browser code or share it in chat. Profile uploads accept JPG, PNG and WebP up to 5 MB. Other profile fields can be saved without Cloudinary; uploading a photo requires these three settings.
