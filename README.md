<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7a4af020-666e-4ebe-9d0d-cdc28043a8a7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Free Cloud Storage

The app can sync quiz packages, groups, sessions, and student results with Firebase Firestore on the free Spark plan.

In Firebase Console:

1. Create/enable a Firestore Database.
2. Enable Authentication > Sign-in method > Anonymous.
3. Publish the rules from `firestore.rules`.

Without these settings, the app automatically falls back to browser `localStorage`.
