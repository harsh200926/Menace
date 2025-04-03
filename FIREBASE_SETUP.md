# Firebase Setup Guide

This guide will help you properly configure Firebase for your application, with a focus on authentication and storage.

## Prerequisites

1. A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Logged in to Firebase CLI: `firebase login`

## Steps to Configure Firebase

### 1. Update Firebase Configuration

The Firebase configuration in `src/lib/firebase.ts` should match your Firebase project. Update it with your own values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

You can find these values in your Firebase project settings.

### 2. Enable Authentication Methods

1. Go to the Firebase Console → Authentication → Sign-in method
2. Enable the following authentication methods:
   - Email/Password
   - Google

### 3. Set Up Firestore Database

1. Go to the Firebase Console → Firestore Database
2. Click "Create database" if not already created
3. Choose a location close to your target users
4. Start in production mode

### 4. Configure Storage Rules

1. Go to the Firebase Console → Storage
2. Create a storage bucket if not already created
3. Make sure the storage rules in `storage.rules` are properly set up (already done in this project)

### 5. Deploy to Firebase

#### For Windows:

Run the deployment script by double-clicking `deploy.bat` or running it from the command prompt.

```
deploy.bat
```

#### For Mac/Linux:

Make the script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

Alternatively, you can deploy manually:

```bash
npm run build
cd functions && npm run build && cd ..
firebase deploy
```

### 6. Verify Setup

After deployment:

1. Visit your Firebase Hosting URL (shown after deployment)
2. Test the authentication flow (signup, login, password reset)
3. Check the Firebase console to verify users are created

## Troubleshooting

### ESLint Errors on Deployment

If you encounter ESLint errors during deployment, try running:

```bash
cd functions
npm run lint -- --fix
cd ..
firebase deploy
```

### Authentication Not Working

1. Check the browser console for errors
2. Verify that authentication methods are enabled in Firebase Console
3. Ensure your Firebase config values are correct

### Storage Upload Issues

1. Verify your storage rules in Firebase Console
2. Check that the storage bucket name in your configuration is correct
3. Try uploading a small file first to test permissions

## Security Considerations

1. Never commit your Firebase API keys to public repositories
2. Set up proper Firestore and Storage security rules
3. Monitor authentication usage in Firebase Console for unusual patterns

## Support

If you need additional help, refer to the [Firebase documentation](https://firebase.google.com/docs) or open an issue in the project repository. 