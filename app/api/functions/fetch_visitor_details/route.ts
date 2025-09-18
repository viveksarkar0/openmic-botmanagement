import { type NextRequest, NextResponse } from "next/server"
import { openmic } from "@/lib/openmic"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const visitorId = body.id || body.visitor_id || body.visitorId || body.arguments?.id || body.parameters?.id || "789"
    const visitorDetails = openmic.generateFetchDetails(visitorId, "receptionist")
    const responseMessage = `Found visitor ${visitorDetails.name} (Visitor ID: ${visitorDetails.id}). Appointments: ${visitorDetails.appointments?.join(', ') || 'No scheduled appointments'}. Status: ${visitorDetails.status}. Notes: ${visitorDetails.notes}`

    return NextResponse.json({
      success: true,
      result: responseMessage,
      data: visitorDetails
    })
  } catch (error) {
    const fallbackMessage = "Found visitor Tom Wilson (Visitor ID: 789). Appointments: Today 2 PM. Status: Confirmed. Notes: First visit."
    
    return NextResponse.json({
      success: true,
      result: fallbackMessage,
      data: {
        id: "789",
        name: "Tom Wilson",
        appointments: ["Today 2 PM"],
        status: "Confirmed",
        notes: "First visit"
      }
    })
  }
}
