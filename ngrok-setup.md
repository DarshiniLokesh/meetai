# Ngrok Setup Instructions

## Step 1: Install the Missing Package

First, install the required OpenAI Realtime API package:

```bash
npm install
```

This will install `@stream-io/openai-realtime-api` which is required for the agent to connect.

## Step 2: Stop Existing Ngrok Tunnel

If you have an existing ngrok tunnel running, stop it first:

```bash
# Find and kill existing ngrok processes
pkill ngrok

# Or find the process ID and kill it
ps aux | grep ngrok
kill <PID>
```

## Step 3: Start Ngrok for Next.js (Port 3000)

Start ngrok pointing to port 3000 (where Next.js dev server runs):

```bash
ngrok http 3000
```

Or if you want to use your reserved domain:

```bash
ngrok http --domain=asbestoid-subconsciously-athena.ngrok-free.dev 3000
```

## Step 4: Copy the Ngrok URL

After starting ngrok, you'll see something like:

```
Forwarding  https://asbestoid-subconsciously-athena.ngrok-free.dev -> http://localhost:3000
```

Copy the HTTPS URL (e.g., `https://asbestoid-subconsciously-athena.ngrok-free.dev`)

## Step 5: Update Environment Variables (if needed)

If OpenAI requires a webhook URL, add it to your `.env` file:

```env
OPENAI_WEBHOOK_URL=https://asbestoid-subconsciously-athena.ngrok-free.dev/api/openai-webhook
```

## Note

**Important**: The Stream.io `connectOpenAi` function should work without ngrok for basic functionality. Ngrok is only needed if:
- OpenAI requires a webhook callback URL
- You need to test webhooks locally

Try installing the package first and see if the agent connects without ngrok.

