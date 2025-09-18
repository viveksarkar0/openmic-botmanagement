# 🤖 AI Intake Agent - Direct OpenMic Integration

loom videos -https://www.loom.com/share/5f3d0f24657f48309ab649101238dcaa?sid=3d6b353a-854a-44d5-8b21-e3bb0ab5d3dd
loom part 2 - https://www.loom.com/share/4b56059e7efa49d8b2349c3e3b3b376e?sid=2e5887a0-8b4e-4b22-bed8-acce8af54996
A production-ready, full-stack Next.js 15 application for managing domain-specific AI intake agents with **direct OpenMic API integration**. Features real-time call log fetching, automatic bot assignment, and comprehensive webhook handling for seamless AI voice agent management.

## 🎯 **Key Features**

This project provides a complete OpenMic integration solution:

- ✅ **Multi-Domain Support** - Medical, Legal, and Receptionist bots
- ✅ **Direct OpenMic Integration** - Real-time call log fetching via API
- ✅ **Automatic Bot Assignment** - No more manual sync or misassigned calls
- ✅ **Pre-call Webhooks** - Dynamic data injection before calls
- ✅ **In-call Function Calls** - Live data retrieval during conversations
- ✅ **Post-call Webhooks** - Automatic call logging and processing
- ✅ **Modern UI** - Beautiful interface for bot and call management
- ✅ **Production Ready** - Clean architecture with proper error handling

## 🎬 **Quick Demo**

1. **Create a bot** in the UI → Automatically appears in OpenMic dashboard
2. **Make a test call** in OpenMic → Say "123" when asked for patient ID
3. **Watch real-time** webhook calls in terminal logs
4. **View call transcript** in the Call Logs page

**Test Patient ID:** `123` (John Smith - No allergies, takes Aspirin)

## 🚀 Architecture Highlights

- **Direct API Integration**: Fetches call logs directly from OpenMic API (no sync required)
- **Automatic Bot Matching**: Uses OpenMic's `agent_id` for perfect bot assignment
- **Real-time Data**: Always shows the latest calls with complete metadata
- **Function Calling**: Domain-specific endpoints for live data retrieval
- **Clean Webhooks**: Simplified pre-call and post-call handling
- **Modern Stack**: Next.js 15, TypeScript, Prisma, TailwindCSS
- **Production Ready**: Proper error handling, validation, and logging

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (SQLite for development)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form
- **UI Components**: Lucide React icons, React Hot Toast
- **Validation**: Zod
- **Development**: ESLint, Prettier, tsx

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- PostgreSQL database (or SQLite for local development)
- ngrok account for webhook testing

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-bot
pnpm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_bot_db"
# For local development with SQLite:
# DATABASE_URL="file:./dev.db"

# OpenMic API (required for call log fetching)
OPENMIC_API_KEY="sk_your_openmic_api_key"

# ngrok URL (for webhook and function endpoints)
NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok.io"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Seed the database with sample data
pnpm prisma:seed
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🌐 ngrok Setup for Webhooks

### 1. Install and Setup ngrok

```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# Authenticate with your token
ngrok authtoken YOUR_NGROK_AUTH_TOKEN
```

### 2. Expose Local Server

```bash
# In a separate terminal, expose your local server
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 3. Configure OpenMic Dashboard

In your OpenMic dashboard, configure the following webhook URLs:

- **Pre-call webhook**: `https://abc123.ngrok.io/api/pre-call`
- **Post-call webhook**: `https://abc123.ngrok.io/api/post-call`

**Function URLs (domain-specific):**
- **Medical**: `https://abc123.ngrok.io/api/functions/fetch_patient_details`
- **Legal**: `https://abc123.ngrok.io/api/functions/fetch_case_details`
- **Receptionist**: `https://abc123.ngrok.io/api/functions/fetch_visitor_details`

## 📡 API Endpoints

### Bot Management
- `GET /api/bots` - List all bots
- `POST /api/bots` - Create a new bot
- `GET /api/bots/[id]` - Get specific bot
- `PATCH /api/bots/[id]` - Update bot
- `DELETE /api/bots/[id]` - Delete bot

### Webhooks
- `POST /api/pre-call` - Pre-call webhook from OpenMic
- `POST /api/post-call` - Post-call webhook from OpenMic

### Function Calls (In-call)
- `POST /api/functions/fetch_patient_details` - Medical domain function
- `POST /api/functions/fetch_case_details` - Legal domain function  
- `POST /api/functions/fetch_visitor_details` - Receptionist domain function

### Call Logs
- `GET /api/call-logs` - Get call logs directly from OpenMic API
- `GET /api/call-logs?source=local` - Get local database logs only
- `GET /api/call-logs?source=both` - Get merged local + OpenMic logs

## 🏗️ Project Structure

```
/
├── app/
│   ├── api/                    # API routes
│   │   ├── bots/              # Bot CRUD operations
│   │   ├── call-logs/         # Direct OpenMic call log fetching
│   │   ├── functions/         # Domain-specific function endpoints
│   │   │   ├── fetch_patient_details/   # Medical function
│   │   │   ├── fetch_case_details/      # Legal function
│   │   │   └── fetch_visitor_details/   # Receptionist function
│   │   ├── pre-call/          # Pre-call webhook
│   │   ├── post-call/         # Post-call webhook
│   │   └── health/            # Health check
│   ├── bots/                  # Bot management page
│   ├── logs/                  # Call logs page (real-time OpenMic data)
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Dashboard
├── components/                # Reusable UI components
│   ├── ui/                    # Base UI components
│   ├── bot-form.tsx          # Bot create/edit form
│   ├── bot-table.tsx         # Bot management table
│   └── [other components]     # Additional UI components
├── lib/
│   ├── prisma.ts             # Prisma client & database utilities
│   ├── types.ts              # Zod schemas & TypeScript types
│   └── openmic.ts            # OpenMic API integration
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── README.md
```

## 🎯 Usage Guide

### 1. Create Your First Bot

1. Navigate to the "Bots" page
2. Click "Create Bot"
3. Fill in the bot details:
   - **Name**: Descriptive name for your bot
   - **Domain**: Choose from Medical, Legal, or Receptionist
   - **UID**: OpenMic bot UID (leave empty to auto-generate)

### 2. Configure OpenMic Integration

1. Copy your bot's UID from the bots table
2. In OpenMic dashboard, create a new bot with this UID
3. Configure webhook URLs using your ngrok URL
4. Test the integration by making a call

### 3. Monitor Call Logs

1. Go to "Call Logs" page to see **real-time OpenMic data**
2. View complete transcripts with call analysis and cost breakdowns
3. See recording URLs, performance metrics, and success rates
4. Filter by bot - calls are automatically assigned to correct bots
5. All data is live from OpenMic - no sync delays or misassignments!

## 🔍 Domain-Specific Features

### Medical Domain
- Patient ID lookup
- Medical history access
- Appointment scheduling
- Allergy and medication tracking

### Legal Domain
- Case information retrieval
- Client consultation scheduling
- Attorney assignment
- Legal document references

### Receptionist Domain
- General appointment booking
- Call routing and transfers
- Basic information collection
- Office hours and location info

## 🧪 Testing the Integration

### 1. Test Pre-call Webhook

```bash
curl -X POST http://localhost:3000/api/pre-call \
  -H "Content-Type: application/json" \
  -d '{"botUid": "your_bot_uid", "metadata": {"id": "PAT-001"}}'
```

### 2. Test Fetch Details

```bash
curl -X POST http://localhost:3000/api/fetch-details \
  -H "Content-Type: application/json" \
  -d '{"id": "PAT-001", "domain": "medical"}'
```

### 3. Test Post-call Webhook

```bash
curl -X POST http://localhost:3000/api/post-call \
  -H "Content-Type: application/json" \
  -d '{
    "botUid": "your_bot_uid",
    "callId": "test_call_001",
    "transcript": "Test conversation transcript",
    "metadata": {"duration": 120}
  }'
```

## 📊 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm prisma:migrate   # Run database migrations
pnpm prisma:seed      # Seed database with sample data
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:generate  # Generate Prisma client
```

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:port/database"
OPENMIC_API_KEY="your_production_api_key"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Run `pnpm prisma:migrate` to apply migrations

2. **Webhook Not Receiving Calls**
   - Verify ngrok is running and URL is correct
   - Check OpenMic dashboard webhook configuration
   - Ensure bot UID matches between app and OpenMic

3. **Build Errors**
   - Run `pnpm prisma:generate` to regenerate Prisma client
   - Clear `.next` folder and rebuild

### Logs and Debugging

- Check browser console for frontend errors
- Check terminal output for API errors
- Use `console.log` statements in webhook handlers for debugging
- Monitor ngrok dashboard for webhook delivery status

## 📝 Demo Checklist

- [ ] Application runs locally on `http://localhost:3000`
- [ ] Database migrations applied successfully
- [ ] Sample bots and call logs visible in UI
- [ ] ngrok tunnel active and webhooks configured
- [ ] Test call made through OpenMic dashboard
- [ ] Call log appears in application
- [ ] Bot CRUD operations working (create, edit, delete)
- [ ] Call log filtering and search functional

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the OpenMic API documentation
3. Create an issue in the repository
