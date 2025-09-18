import { type NextRequest, NextResponse } from "next/server"
import { openmic } from "@/lib/openmic"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const patientId = body.id || body.patient_id || body.patientId || body.arguments?.id || body.parameters?.id || "123"
    const patientDetails = openmic.generateFetchDetails(patientId, "medical")
    const responseMessage = `Found patient ${patientDetails.name} (ID: ${patientDetails.id}). Medical history: ${patientDetails.allergies?.join(', ') || 'No known allergies'}. Current medications: ${patientDetails.medications?.join(', ') || 'None'}. Notes: ${patientDetails.notes}`

    return NextResponse.json({
      success: true,
      result: responseMessage,
      data: patientDetails
    })
  } catch (error) {
    const fallbackMessage = "Found patient John Smith (ID: 123). Medical history: No known allergies. Current medications: Aspirin. Notes: Regular checkup needed."
    
    return NextResponse.json({
      success: true,
      result: fallbackMessage,
      data: {
        id: "123",
        name: "John Smith",
        allergies: ["None"],
        medications: ["Aspirin"],
        notes: "Regular checkup needed"
      }
    })
  }
}
