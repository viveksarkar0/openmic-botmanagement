# 🤖 AI Intake Agent - OpenMic Integration Platform

<div align="center">

![AI Intake Agent](https://img.shields.io/badge/AI-Intake%20Agent-blue?style=for-the-badge&logo=robot)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**A production-ready, enterprise-grade AI voice agent management platform with seamless OpenMic integration**

[🎬 Demo Videos](#-demo-videos) • [🚀 Quick Start](#-quick-start) • [📚 Documentation](#-api-documentation) • [🌐 Deploy](#-deployment)

</div>

---

## 📺 Demo Videos

- 🎥 **[Part 1: Project Overview & Setup](https://www.loom.com/share/5f3d0f24657f48309ab649101238dcaa?sid=3d6b353a-854a-44d5-8b21-e3bb0ab5d3dd)**
- 🎥 **[Part 2: OpenMic Integration](https://www.loom.com/share/4b56059e7efa49d8b2349c3e3b3b376e?sid=2e5887a0-8b4e-4b22-bed8-acce8af54996)**
- 🎥 **[Part 3: Advanced Features](https://www.loom.com/share/34ca098925994be3ba6b43da45d2acbf?sid=e60eceb5-6922-4eed-9b69-099c1624c1d6)**

## 🌟 Overview

Transform your business communication with our comprehensive AI voice agent platform. Built with Next.js 15 and featuring direct OpenMic API integration, this platform enables seamless management of domain-specific AI intake agents across medical, legal, and receptionist use cases.

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🤖 **AI Agent Management**
- **Multi-Domain Support** - Medical, Legal, Receptionist
- **Intelligent Bot Assignment** - Automatic call routing
- **Real-time Synchronization** - Live OpenMic integration
- **Custom Function Calls** - Domain-specific data retrieval

</td>
<td width="50%">

### 📊 **Advanced Analytics**
- **Real-time Call Monitoring** - Live call status tracking
- **Comprehensive Logging** - Detailed conversation analysis
- **Performance Metrics** - Success rates and cost tracking
- **Webhook Processing** - Pre/post-call automation

</td>
</tr>
<tr>
<td width="50%">

### 🎨 **Modern Interface**
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Customizable themes
- **Interactive Dashboard** - Real-time data visualization
- **Intuitive Navigation** - User-friendly experience

</td>
<td width="50%">

### 🚀 **Production Ready**
- **Enterprise Architecture** - Scalable and maintainable
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error management
- **Security** - Built-in authentication & validation

</td>
</tr>
</table>

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

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css) |
| **Backend** | ![API Routes](https://img.shields.io/badge/API-Routes-green) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma) ![Zod](https://img.shields.io/badge/Zod-Validation-blue) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite) |
| **UI/UX** | ![Radix UI](https://img.shields.io/badge/Radix-UI-161618?logo=radix-ui) ![Lucide](https://img.shields.io/badge/Lucide-Icons-orange) ![React Hook Form](https://img.shields.io/badge/React-Hook%20Form-EC5990?logo=reacthookform) |
| **Development** | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier) ![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel) ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker) |

</div>

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- PostgreSQL database (or SQLite for local development)
- ngrok account for webhook testing

## 🚀 Quick Start

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/viveksarkar0/openmic-botmanagement.git
cd ai-bot

# Install dependencies
pnpm install
```

### 2️⃣ Environment Setup

Create a `.env` file in the root directory:

```env
# 🗄️ Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/ai_bot_db"
# For local development with SQLite:
# DATABASE_URL="file:./dev.db"

# 🤖 OpenMic API Integration
OPENMIC_API_KEY="sk_your_openmic_api_key"

# 🌐 Webhook & Function Endpoints
NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok.io"

# 🔐 Security (for production)
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

### 3️⃣ Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Apply database migrations
pnpm prisma:migrate

# Seed with sample data
pnpm prisma:seed
```

### 4️⃣ Launch Application

```bash
# Start development server
pnpm dev
```

🎉 **Success!** Open [http://localhost:3000](http://localhost:3000) to see your AI agent platform.

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

## 🌐 Deployment

### 🚀 Deploy to Vercel (Recommended)

<details>
<summary><strong>📋 Step-by-Step Vercel Deployment</strong></summary>

#### 1️⃣ Prepare Your Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2️⃣ Database Setup (Production)
```bash
# Set up a production PostgreSQL database
# Recommended: Railway, Supabase, or Neon

# Example with Neon:
# 1. Create account at neon.tech
# 2. Create new database
# 3. Copy connection string
```

#### 3️⃣ Vercel Configuration
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" and import your GitHub repository
3. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm vercel-build`
   - **Install Command**: `pnpm install`

#### 4️⃣ Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# 🗄️ Database (Production)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# 🤖 OpenMic Integration
OPENMIC_API_KEY="sk_your_production_openmic_key"

# 🌐 Application URL (will be your Vercel domain)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# 🔐 Security
NEXTAUTH_SECRET="your-super-secret-production-key"
NEXTAUTH_URL="https://your-app.vercel.app"
```

#### 5️⃣ Deploy!
- Click "Deploy" and wait for the build to complete
- Your app will be live at `https://your-app.vercel.app`

</details>

### 🐳 Docker Deployment

<details>
<summary><strong>🐳 Docker Setup</strong></summary>

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t ai-intake-agent .
docker run -p 3000:3000 --env-file .env ai-intake-agent
```

</details>

### ☁️ Other Deployment Options

| Platform | Complexity | Cost | Features |
|----------|------------|------|----------|
| **Vercel** ⭐ | Easy | Free tier | Serverless, Auto-scaling |
| **Railway** | Easy | $5/month | Full-stack, Database included |
| **Render** | Medium | $7/month | Docker support, Auto-deploy |
| **AWS/GCP** | Hard | Variable | Enterprise features |

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
