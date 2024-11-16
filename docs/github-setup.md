# GitHub OAuth Setup Guide

This guide will help you set up the necessary GitHub tokens and application for OAuth authentication, and add the required keys to the `.env` file.

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click on "New OAuth App".
3. Fill in the required fields:
   - **Application name**: IssueBuilder
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/auth/callback` (or your production callback URL)
4. Click "Register application".

## Step 2: Get Client ID and Client Secret

1. After registering the application, you will be redirected to the app's settings page.
2. Copy the **Client ID**.
3. Generate a new **Client Secret** and copy it.

## Step 3: Add Keys to `.env` File

1. Open your `.env` file.
2. Add the following environment variables:

```
# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

Replace `your-client-id` and `your-client-secret` with the values you copied in Step 2.

## Step 4: Update `nuxt.config.ts`

Ensure that your `nuxt.config.ts` file includes the GitHub OAuth environment variables:

```javascript
export default defineNuxtConfig({
  // Other configurations...

  runtimeConfig: {
    public: {
      githubClientId: process.env.GITHUB_CLIENT_ID,
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    }
  }
})
```

## Step 5: Implement OAuth Flow

Refer to the following files for the implementation of the GitHub OAuth flow:

- `components/NavBar.vue`: Contains the "Link with GitHub" button.
- `composables/useAuth.ts`: Handles the GitHub OAuth flow and token exchange.
- `pages/auth/login.vue`: Manages the GitHub OAuth login process.

## Step 6: Fetch and Display Repositories

Refer to the following files for fetching and displaying the list of repositories:

- `composables/appStore.js`: Fetches the list of repositories using the GitHub API and stores them in the state management system.
- `components/RepositoriesList.vue`: Displays the list of repositories and allows the user to select one.

## Step 7: Secure Token Storage

Ensure that the GitHub access token is stored securely using `useLocalStorage` in `composables/appStore.js`.

## Step 8: Handle Token Expiration and Refresh

Implement logic to handle token expiration and refresh in `composables/useAuth.ts`. Note that GitHub access tokens typically do not expire, but it's good practice to handle token refresh if needed.

By following these steps, you will set up the necessary GitHub tokens and application for OAuth authentication, and add the required keys to the `.env` file.
