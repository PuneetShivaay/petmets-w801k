# Deploying to Firebase App Hosting

This document provides the steps to deploy your Next.js application to Firebase App Hosting.

## Prerequisites

- You have a Firebase project.
- You have the [Firebase CLI](https://firebase.google.com/docs/cli) installed and configured on your local machine.

## Deployment Steps

1. **Install dependencies:**
   Open a terminal in the project's root directory and run the following command to install the necessary dependencies:
   ```bash
   npm install
   ```

2. **Log in to Firebase:**
   If you haven't already, log in to your Firebase account using the following command:
   ```bash
   firebase login
   ```
   This will open a browser window for you to authenticate with your Google account.

3. **Deploy to Firebase App Hosting:**
   Once you're logged in, you can deploy your application with this command:
   ```bash
   firebase deploy
   ```
   The Firebase CLI will automatically use the `apphosting.yaml` file to build and deploy your application. After the deployment is complete, the CLI will output the URL of your live application.
