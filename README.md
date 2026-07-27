# Clinic Demo Clone

This is a clean demo copy of the clinic appointment app. It keeps the website layout, UI, and app structure from the original app, but it does not include patient data, account data, medical records, settings, API keys, doctor credentials, WhatsApp number, or clinic-specific labels.

## Files

- `index.html` - main app entry point.
- `clinic-layout.html` - layout copy of the same app screen.
- `firestore.rules` - starter Firestore rules for signed-in users.
- `README.md` - setup instructions.

## What Was Removed Or Replaced

- Firebase config was replaced with `YOUR_FIREBASE_*` placeholders.
- The default WhatsApp number was cleared.
- Doctor credential placeholder was replaced with generic demo text.
- Clinic-specific bank account labels were replaced with generic account labels.
- Clinic-specific neurodiagnostic center names were replaced with generic demo names.
- The neurodiagnostics PIN was replaced with `CHANGE_ME_DEMO_PIN`.
- Browser localStorage keys were changed to a demo namespace so this copy does not reuse data saved by the original app.

No Firebase data export, patient list, medical record, account ledger, saved settings, credentials, or API key files were copied.

## Firebase Setup

Firebase project created for this demo:

- Project ID: `clinic-demo-clone-drgigy`
- Console: <https://console.firebase.google.com/project/clinic-demo-clone-drgigy/overview>
- Firestore database: created in `asia-south1`
- Firestore rules: deployed from `firestore.rules`

The Firebase web app config has already been added to `index.html` and `clinic-layout.html`.

If you create another Firebase project later, open `index.html` and `clinic-layout.html`, then replace this block in both files:

```js
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
```

For this project, these setup steps still matter:

1. Enable Firebase Authentication.
2. Add the new doctor's sign-in user under Authentication > Users.
3. Confirm Firestore is empty before sharing the app.
4. Re-publish `firestore.rules` if you edit the rules later.

The app uses these Firestore collections:

- `patients`
- `accounts`
- `medicalRecords`
- `neuroMonthlyStats`
- `settings/clinic`

## Optional Gemini Setup

The ambient notes feature asks for a Gemini API key inside the app settings. Do not commit a real Gemini API key to GitHub. Add it in the app UI only when testing locally or after deployment.

## GitHub Setup

GitHub repository created:

- <https://github.com/drgigy/clinic-demo-clone>
- Live custom domain: <https://democlinic.woyz.in/>
- GitHub Pages fallback URL: <https://drgigy.github.io/clinic-demo-clone/>

If you need to push this folder again:

```bash
git init
git add index.html clinic-layout.html firestore.rules README.md
git commit -m "Create clean clinic demo clone"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

3. If using GitHub Pages, enable Pages for the `main` branch in repository settings.
4. Add the GitHub Pages domain to Firebase Authentication > Settings > Authorized domains.

## Before Sharing With Another Doctor

- Replace Firebase placeholders with the new Firebase project config.
- Change `CHANGE_ME_DEMO_PIN` in both HTML files.
- Create only the new doctor's Firebase Auth account.
- Confirm Firestore starts empty.
- Confirm no real API keys are committed.
- Confirm the WhatsApp number is blank or changed to the new doctor's number.
