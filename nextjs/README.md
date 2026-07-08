This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables

Before running the application, you need to configure the environment variables in the `.env.local` file:

#### Clerk Authentication Keys

- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Your Clerk publishable key
  - Get this from [Clerk Dashboard](https://dashboard.clerk.com) → Select your application → API Keys
- **CLERK_SECRET_KEY**: Your Clerk secret key
  - Get this from the same location as the publishable key (keep this secure and never commit to version control)
- **NEXT_PUBLIC_CLERK_SIGN_IN_URL**: The URL path for sign-in page (default: `/sign-in`)
- **NEXT_PUBLIC_CLERK_SIGN_UP_URL**: The URL path for sign-up page (default: `/sign-up`)

To set up Clerk:

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable and secret keys from the API Keys section

#### Other Configuration

- **SIGNING_SECRET**: A secret key for clerk webhooks
  - You can generate one from clerk
- **API_URL**: Backend API URL (default: `http://backend:8000`)
  - Update this based on your backend server configuration
- **NEXT_PUBLIC_NEXTJS_API_URL**: Frontend API URL (default: `http://localhost:3000`)
  - Update this to match your Next.js server URL

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
