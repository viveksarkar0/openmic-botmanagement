import { type NextRequest, NextResponse } from "next/server"
import { openmic } from "@/lib/openmic"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    console.log("[DEBUG] fetch_patient_details called with:", JSON.stringify(body, null, 2))

    // Extract patient ID from various possible formats
    const patientId = body.id || body.patient_id || body.patientId || body.arguments?.id || body.parameters?.id || "123"
    
    console.log(`[INFO] Fetching patient details for ID: ${patientId}`)

    // Generate mock patient data (in a real app, this would query your database)
    const patientDetails = openmic.generateFetchDetails(patientId, "medical")

    const responseMessage = `Found patient ${patientDetails.name} (ID: ${patientDetails.id}). Medical history: ${patientDetails.allergies?.join(', ') || 'No known allergies'}. Current medications: ${patientDetails.medications?.join(', ') || 'None'}. Notes: ${patientDetails.notes}`

    console.log(`[SUCCESS] Patient details retrieved: ${responseMessage}`)

    return NextResponse.json({
      success: true,
      result: responseMessage,
      data: patientDetails
    })
  } catch (error) {
    console.error("Error in fetch_patient_details:", error)

    // Fallback response
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
