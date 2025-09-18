import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  // Create sample bots
  const medicalBot = await prisma.bot.upsert({
    where: { uid: 'medical_bot_demo' },
    update: {},
    create: {
      name: 'Medical Intake Assistant',
      domain: 'medical',
      uid: 'medical_bot_demo'
    }
  })

  const legalBot = await prisma.bot.upsert({
    where: { uid: 'legal_bot_demo' },
    update: {},
    create: {
      name: 'Legal Consultation Bot',
      domain: 'legal',
      uid: 'legal_bot_demo'
    }
  })

  const receptionistBot = await prisma.bot.upsert({
    where: { uid: 'receptionist_bot_demo' },
    update: {},
    create: {
      name: 'Virtual Receptionist',
      domain: 'receptionist',
      uid: 'receptionist_bot_demo'
    }
  })


  // Create sample call logs
  const sampleCallLogs = [
    {
      botId: medicalBot.id,
      transcript: `Bot: Hello, I'm your medical intake assistant. How can I help you today?
Caller: Hi, I need to schedule an appointment for my diabetes follow-up.
Bot: I'd be happy to help you schedule that appointment. Can you please provide me with your patient ID?
Caller: Yes, it's 123.
Bot: Thank you. I see you're John Smith, and your last visit was on August 10th for a regular checkup. Let me check available appointments for you.
Caller: That's correct. I need to get my HbA1c results reviewed.
Bot: Perfect. I have availability next Tuesday at 2 PM or Thursday at 10 AM. Which would work better for you?
Caller: Tuesday at 2 PM works great.
Bot: Excellent! I've scheduled your appointment for Tuesday at 2 PM. You'll receive a confirmation email shortly. Is there anything else I can help you with today?
Caller: No, that's all. Thank you!
Bot: You're welcome! Have a great day and we'll see you Tuesday.`,
      metadata: {
        patientId: '123',
        appointmentScheduled: true,
        appointmentDate: '2025-09-23T14:00:00Z',
        callDuration: 180,
        callId: 'call_001'
      }
    },
    {
      botId: legalBot.id,
      transcript: `Bot: Good afternoon, this is your legal consultation assistant. How may I assist you today?
Caller: I was in a car accident last week and need to know about my legal options.
Bot: I'm sorry to hear about your accident. I'm here to help gather some initial information. Can you tell me the date of the accident?
Caller: It was September 10th, around 3 PM.
Bot: Thank you. Were there any injuries involved, and have you filed a police report?
Caller: Yes, I have some back pain and the police came to the scene. I have the report number.
Bot: That's good that you have the police report. I'm going to connect you with Attorney Jane Doe who specializes in personal injury cases. She'll be able to provide you with detailed legal advice.
Caller: That sounds perfect. When can I speak with her?
Bot: I can schedule a consultation for you. Are you available tomorrow at 10 AM?
Caller: Yes, that works for me.
Bot: Great! I've scheduled your consultation with Attorney Jane Doe for tomorrow at 10 AM. You'll receive a confirmation email with all the details.`,
      metadata: {
        caseType: 'Personal Injury',
        accidentDate: '2025-09-10',
        policeReportFiled: true,
        consultationScheduled: true,
        attorney: 'Jane Doe',
        callId: 'call_002'
      }
    },
    {
      botId: receptionistBot.id,
      transcript: `Bot: Thank you for calling our office. This is your virtual receptionist. How can I help you today?
Caller: I'd like to schedule an appointment for a consultation.
Bot: I'd be happy to help you schedule a consultation. May I have your name please?
Caller: Michael Brown.
Bot: Thank you, Mr. Brown. Is this your first time visiting our office?
Caller: Yes, it is.
Bot: Perfect! For first-time consultations, we typically schedule 60-minute appointments. Do you have a preferred day of the week?
Caller: I'm flexible, but mornings work better for me.
Bot: I have availability this Friday at 10 AM or next Monday at 9 AM. Which would you prefer?
Caller: Friday at 10 AM sounds great.
Bot: Excellent! I've scheduled your consultation for Friday at 10 AM. You'll receive a confirmation email shortly with our office address and what to bring to your appointment.
Caller: Thank you so much!
Bot: You're very welcome, Mr. Brown. We look forward to seeing you on Friday!`,
      metadata: {
        clientName: 'Michael Brown',
        appointmentType: 'First-time consultation',
        appointmentDate: '2025-09-20T10:00:00Z',
        firstTimeClient: true,
        callId: 'call_003'
      }
    }
  ]

  for (const callLog of sampleCallLogs) {
    await prisma.callLog.create({
      data: callLog
    })
  }

}

main()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
