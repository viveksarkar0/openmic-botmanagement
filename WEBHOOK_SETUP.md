# OpenMic Webhook Setup Guide

## Current Issue Resolution

The webhook was getting stuck because OpenMic sends data in a different format than what the application was expecting. This has been fixed by updating the webhook handlers to properly parse OpenMic's data structure.

## Fixed Issues

1. **Data Structure Mismatch**: Updated schemas to handle OpenMic's webhook format with `bot_id`, `sessionId`, etc.
2. **Better Error Handling**: Added detailed logging to help debug webhook issues
3. **Improved Bot Matching**: Enhanced bot lookup logic to handle missing UIDs

## Setup Instructions

### 1. Environment Configuration

Create or update your `.env` file with:

```env
# Database
DATABASE_URL="your_database_url"

# OpenMic API Configuration
OPENMIC_API_KEY="your_openmic_api_key"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret"
```

### 2. Ngrok Setup

1. Start your Next.js server:
   ```bash
   npm run dev
   ```

2. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### 3. OpenMic Dashboard Configuration

In your OpenMic dashboard, configure the following webhook URLs:

- **Pre-call Webhook**: `https://your-ngrok-url.ngrok.io/api/pre-call`
- **Post-call Webhook**: `https://your-ngrok-url.ngrok.io/api/post-call`

### 4. Function Endpoints

The following function endpoints are available for your bots to call:

- **Medical Bot Functions**:
  - `fetch_patient_details`: `https://your-ngrok-url.ngrok.io/api/functions/fetch_patient_details`

- **Legal Bot Functions**:
  - `fetch_case_details`: `https://your-ngrok-url.ngrok.io/api/functions/fetch_case_details`

- **Receptionist Bot Functions**:
  - `fetch_visitor_details`: `https://your-ngrok-url.ngrok.io/api/functions/fetch_visitor_details`

These functions are automatically configured when you create a bot through the application.

### 5. Bot Creation Process

1. **Create Bot in Your App**: Use the bot form in your application to create a new bot
2. **Note the UID**: After creation, note the generated UID from the success message
3. **Configure in OpenMic**: 
   - Go to your OpenMic dashboard
   - Create a new bot/agent
   - Use the same UID from step 2
   - Set the webhook URLs from step 3

### 6. Testing

1. **Test the Bot**: Use the test call feature in OpenMic
2. **Check Logs**: Monitor your Next.js console for webhook activity
3. **Verify Database**: Check that call logs are being saved

## Webhook Data Flow

### Pre-call Webhook
OpenMic sends:
```json
{
  "event": "call",
  "call": {
    "direction": "inbound",
    "from_number": "web_call",
    "to_number": "web_call",
    "attempt": 1,
    "bot_id": "your_bot_uid"
  }
}
```

Your app responds with:
```json
{
  "success": true,
  "data": {
    "patientId": "123",
    "name": "John Smith",
    "age": 35,
    "lastVisit": "2025-09-18",
    "summary": "Regular checkup"
  }
}
```

### Post-call Webhook
OpenMic sends:
```json
{
  "type": "end-of-call-report",
  "sessionId": "call_session_id",
  "transcript": [["user", "Hello"], ["assistant", "Hi there!"]],
  "summary": "Call summary",
  "isSuccessful": true
}
```

### Function Calls
When a user provides an ID (like "123"), the bot will call the appropriate function:

**Medical Bot calls fetch_patient_details:**
```json
{
  "id": "123"
}
```

**Function responds with:**
```json
{
  "success": true,
  "result": "Found patient John Smith (ID: 123). Medical history: No known allergies. Current medications: Aspirin. Notes: Regular checkup needed.",
  "data": {
    "id": "123",
    "name": "John Smith",
    "allergies": ["None"],
    "medications": ["Aspirin"],
    "notes": "Regular checkup needed"
  }
}
```

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Data**
   - Check ngrok is running and URL is correct
   - Verify webhook URLs in OpenMic dashboard
   - Check firewall settings

2. **Bot Not Found Errors**
   - Ensure bot UID matches between your app and OpenMic
   - Check database connection
   - Verify bot was created successfully

3. **Parsing Errors**
   - Check the webhook logs for detailed error messages
   - Verify OpenMic is sending data in expected format

### Debug Commands

```bash
# Check webhook logs
tail -f logs/webhook.log

# Test database connection
npm run db:test

# Verify environment variables
npm run env:check
```

## Updated Features

- ✅ Proper OpenMic webhook data parsing
- ✅ Enhanced error logging and debugging
- ✅ Better bot matching logic
- ✅ Improved transcript handling
- ✅ Metadata preservation for call analytics

The webhook should now work properly with OpenMic's data format!
